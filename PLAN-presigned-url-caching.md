# Plan: Cache Presigned URLs to Prevent S3 Abuse

## Problem

Every page refresh generates new presigned URLs for all completed orders, causing repeated S3 API calls.

```
Current: Page refresh → GET /api/orders → s3.getPresignedUrl() per Success order
Goal:    Page refresh → GET /api/orders → Return cached URLs (no S3 calls)
```

---

## 1. Best Caching Option for Next.js

| Option                 | Serverless-friendly | Scales across instances | Complexity | Cost            |
| ---------------------- | ------------------- | ----------------------- | ---------- | --------------- |
| **Upstash Redis**      | Yes                 | Yes                     | Low        | Pay-per-request |
| **Vercel KV**          | Yes                 | Yes                     | Low        | Pay-per-request |
| Redis (self-hosted)    | No                  | Yes                     | High       | Fixed           |
| In-memory (Map/LRU)    | Yes                 | No                      | Very Low   | Free            |
| Next.js unstable_cache | Partial             | No                      | Low        | Free            |

### Recommendation: **Upstash Redis**

**Why:**

- Serverless-native (no connection pool issues)
- Works with Vercel, AWS Lambda, etc.
- Global edge replication available
- Simple REST + Redis SDK
- Free tier: 10,000 requests/day

**Alternative:** Vercel KV (same underlying tech, tighter Vercel integration)

---

## 2. Cache Service Implementation

### Install Dependencies

```bash
npm install @upstash/redis
```

### Environment Variables

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxx
```

### Cache Service (`src/service/cache.ts`)

```typescript
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis client
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Generic cache service for storing and retrieving data with TTL.
 */
export class CacheService {
	private keyPrefix: string;

	constructor(keyPrefix: string = "app") {
		this.keyPrefix = keyPrefix;
	}

	/**
	 * Build a namespaced cache key
	 */
	private buildKey(key: string): string {
		return `${this.keyPrefix}:${key}`;
	}

	/**
	 * Get a value from cache
	 * @returns The cached value or null if not found/expired
	 */
	async get<T>(key: string): Promise<T | null> {
		const fullKey = this.buildKey(key);
		const value = await redis.get<T>(fullKey);
		return value;
	}

	/**
	 * Set a value in cache with TTL
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param ttlSeconds - Time to live in seconds
	 */
	async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
		const fullKey = this.buildKey(key);
		await redis.set(fullKey, value, { ex: ttlSeconds });
	}

	/**
	 * Delete a specific key from cache
	 */
	async delete(key: string): Promise<void> {
		const fullKey = this.buildKey(key);
		await redis.del(fullKey);
	}

	/**
	 * Delete all keys matching a pattern (e.g., invalidate user's cache)
	 * Note: Use sparingly, SCAN is expensive
	 */
	async deletePattern(pattern: string): Promise<void> {
		const fullPattern = this.buildKey(pattern);
		const keys = await redis.keys(fullPattern);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	}
}

// Export singleton instances for different cache domains
export const presignedUrlCache = new CacheService("presigned-urls");
export const ordersCache = new CacheService("orders");
```

---

## 3. API Layer Implementation

### Cache Key Strategy

```
presigned-urls:{userId}:{orderId} → presigned URL string
                ^^^^^^   ^^^^^^^
                User scope  Order scope

TTL: 14 minutes (presigned URL valid for 15 min, cache slightly less)
```

### Updated `prepareAllOrdersData` (`src/app/api/orders/utils.ts`)

```typescript
import { Invoice } from "@/components/dynamic-table/invoices/columns";
import { OrderDetailsForOrderId } from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";
import { S3Service } from "@/service/s3";
import { presignedUrlCache } from "@/service/cache";

const PRESIGNED_URL_EXPIRY = 15 * 60; // 15 minutes
const CACHE_TTL = 14 * 60; // 14 minutes (slightly less than URL expiry)

const mapOrderStatusToInvoiceStatus = (
	status: OrderStatus,
): Invoice["status"] => {
	switch (status) {
		case "PENDING":
			return "Pending";
		case "PROCESSING":
		case "PDF_GENERATED":
		case "PDF_STORED":
			return "Processing";
		case "EMAIL_SENT":
			return "Success";
		case "FAILED":
			return "Failed";
		default:
			return "Pending";
	}
};

/**
 * Get or generate presigned URL for an order.
 * Checks cache first, generates new URL if not cached.
 */
async function getPresignedUrlWithCache(
	s3: S3Service,
	userId: string,
	orderId: string,
): Promise<string> {
	const cacheKey = `${userId}:${orderId}`;

	// Check cache first
	const cachedUrl = await presignedUrlCache.get<string>(cacheKey);
	if (cachedUrl) {
		return cachedUrl;
	}

	// Generate new presigned URL
	const s3Key = `invoices/${orderId}.pdf`;
	const presignedUrl = await s3.getPresignedUrl(
		s3Key,
		PRESIGNED_URL_EXPIRY,
		"get",
	);

	// Cache for 14 minutes
	await presignedUrlCache.set(cacheKey, presignedUrl, CACHE_TTL);

	return presignedUrl;
}

export const prepareAllOrdersData = async (
	orders: OrderDetailsForOrderId[],
	userId: string, // Need to pass userId for cache key
): Promise<Invoice[]> => {
	const s3 = new S3Service();

	const invoices = await Promise.all(
		orders.map(async (order) => {
			const status = mapOrderStatusToInvoiceStatus(order.status);

			// Generate presigned URL only for completed orders
			let pdfUrl: string | undefined;
			if (status === "Success") {
				pdfUrl = await getPresignedUrlWithCache(s3, userId, order.orderId);
			}

			return {
				invoiceId: order.orderId,
				amount: order.totalOrderCost,
				status,
				date: order.createdAt.toISOString().split("T")[0],
				pdfUrl,
			};
		}),
	);

	return invoices;
};
```

### Updated Route (`src/app/api/orders/route.ts`)

```typescript
// In GET handler, pass userId to prepareAllOrdersData
const userId = session.user.id;
const allOrdersResponse = await fetchOrdersForUser(userId);
const allOrders = await prepareAllOrdersData(allOrdersResponse, userId);
//                                                              ^^^^^^
//                                                              Pass userId
```

---

## 4. Cache Invalidation Strategy

### When to Invalidate

| Event                              | Action                                    |
| ---------------------------------- | ----------------------------------------- |
| Order status changes to EMAIL_SENT | No action needed (new URL will be cached) |
| PDF regenerated                    | Delete cache for that order               |
| User requests fresh data           | Optional: Add `?fresh=true` query param   |

### Invalidation Helper

```typescript
/**
 * Invalidate cached presigned URL when PDF is regenerated
 */
export async function invalidatePresignedUrlCache(
	userId: string,
	orderId: string,
): Promise<void> {
	const cacheKey = `${userId}:${orderId}`;
	await presignedUrlCache.delete(cacheKey);
}

/**
 * Invalidate all cached URLs for a user (e.g., on logout)
 */
export async function invalidateUserPresignedUrls(
	userId: string,
): Promise<void> {
	await presignedUrlCache.deletePattern(`${userId}:*`);
}
```

---

## 5. Flow Diagram

```
User refreshes page
        │
        ▼
GET /api/orders
        │
        ▼
For each Success order:
        │
        ├─► Check cache: presigned-urls:{userId}:{orderId}
        │           │
        │           ├─► HIT: Return cached URL (no S3 call)
        │           │
        │           └─► MISS: Generate URL → Cache → Return
        │
        ▼
Return Invoice[] with pdfUrl
```

---

## 6. Implementation Checklist

- [ ] Sign up for Upstash Redis (free tier)
- [ ] Add environment variables
- [ ] Install `@upstash/redis`
- [ ] Create `src/service/cache.ts`
- [ ] Update `prepareAllOrdersData` to use cache
- [ ] Update route to pass `userId`
- [ ] Update `Invoice` type to include `pdfUrl`
- [ ] Update `invoice-actions.tsx` to use `pdfUrl` directly
- [ ] Test cache hit/miss behavior
- [ ] Add cache invalidation where needed

---

## 7. Cost Estimation (Upstash Free Tier)

- **Free:** 10,000 requests/day
- **Scenario:** 100 users, 10 orders each, 5 page loads/day
  - Without cache: 100 × 10 × 5 = 5,000 S3 calls/day
  - With cache: 100 × 10 × 1 = 1,000 cache writes + 4,000 cache reads = 5,000 Redis calls/day
  - **Result:** Within free tier, zero S3 abuse

---

## 8. Alternative: Rate Limiting as Safety Net

Even with caching, consider adding rate limiting as defense-in-depth:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
});

// In API route
const { success } = await ratelimit.limit(userId);
if (!success) {
	return NextResponse.json({ error: "Rate limited" }, { status: 429 });
}
```
