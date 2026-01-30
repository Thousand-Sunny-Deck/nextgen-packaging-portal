import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import fs from "fs";
import path from "path";

const isDevelopment = process.env.NODE_ENV !== "production";

// File-based cache for development (persists across hot reloads)
const DEV_CACHE_FILE = path.join(
	process.cwd(),
	"node_modules",
	".cache",
	"dev-cache.json",
);

type CacheEntry = { value: unknown; expiresAt: number };
type CacheData = Record<string, CacheEntry>;

function ensureCacheDir() {
	const dir = path.dirname(DEV_CACHE_FILE);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function readCache(): CacheData {
	try {
		if (fs.existsSync(DEV_CACHE_FILE)) {
			return JSON.parse(fs.readFileSync(DEV_CACHE_FILE, "utf-8"));
		}
	} catch {
		// Corrupted cache file, start fresh
	}
	return {};
}

function writeCache(data: CacheData) {
	ensureCacheDir();
	fs.writeFileSync(DEV_CACHE_FILE, JSON.stringify(data, null, 2));
}

// Only initialize Redis in production
const redis = isDevelopment
	? null
	: new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL!,
			token: process.env.UPSTASH_REDIS_REST_TOKEN!,
		});

/**
 * Rate limiter for orders API - 20 requests per minute per user
 * In development, uses a mock that always allows requests
 */
export const ordersRatelimit = isDevelopment
	? {
			limit: async () => ({
				success: true,
				limit: 20,
				remaining: 20,
				reset: Date.now() + 60_000,
			}),
		}
	: new Ratelimit({
			redis: redis!,
			limiter: Ratelimit.slidingWindow(20, "1 m"),
			prefix: "ratelimit:orders",
		});

/**
 * Rate limiter for billing addresses API - 30 requests per minute per user
 */
export const billingAddressesRatelimit = isDevelopment
	? {
			limit: async () => ({
				success: true,
				limit: 30,
				remaining: 30,
				reset: Date.now() + 60_000,
			}),
		}
	: new Ratelimit({
			redis: redis!,
			limiter: Ratelimit.slidingWindow(30, "1 m"),
			prefix: "ratelimit:billing-addresses",
		});

/**
 * Generic cache service for storing and retrieving data with TTL.
 * Uses file-based cache in development, Upstash Redis in production.
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

		if (isDevelopment) {
			const cache = readCache();
			const entry = cache[fullKey];
			if (!entry) return null;
			if (entry.expiresAt <= Date.now()) {
				delete cache[fullKey];
				writeCache(cache);
				return null;
			}
			return entry.value as T;
		}

		return redis!.get<T>(fullKey);
	}

	/**
	 * Set a value in cache with TTL
	 * @param key - Cache key
	 * @param value - Value to cache
	 * @param ttlSeconds - Time to live in seconds
	 */
	async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
		const fullKey = this.buildKey(key);

		if (isDevelopment) {
			const cache = readCache();
			cache[fullKey] = {
				value,
				expiresAt: Date.now() + ttlSeconds * 1000,
			};
			writeCache(cache);
			return;
		}

		await redis!.set(fullKey, value, { ex: ttlSeconds });
	}

	/**
	 * Delete a specific key from cache
	 */
	async delete(key: string): Promise<void> {
		const fullKey = this.buildKey(key);

		if (isDevelopment) {
			const cache = readCache();
			delete cache[fullKey];
			writeCache(cache);
			return;
		}

		await redis!.del(fullKey);
	}
}

/**
 * Cache service instance for billing addresses
 * TTL: 5 minutes - balances freshness with performance
 */
export const billingAddressesCache = new CacheService("billing-addresses");
