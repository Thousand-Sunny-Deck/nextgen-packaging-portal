import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL!,
	token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limiter for orders API - 20 requests per minute per user
 */
export const ordersRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(20, "1 m"),
	prefix: "ratelimit:orders",
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
