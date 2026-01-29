import { CacheService } from "@/service/cache";
import { S3Service } from "@/service/s3";

export const PRESIGNED_URL_EXPIRY = 15 * 60; // 15 minutes
export const PRESIGNED_URL_CACHE_TTL = 14 * 60; // 14 minutes (slightly less than URL expiry)

/**
 * Get or generate presigned URL for an order.
 * Checks cache first, generates new URL if not cached.
 */
export const getPresignedUrlWithCache = async (
	s3: S3Service,
	userId: string,
	orderId: string,
): Promise<string> => {
	const presignedUrlCache = new CacheService("presigned-url");
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
	await presignedUrlCache.set(cacheKey, presignedUrl, PRESIGNED_URL_CACHE_TTL);

	return presignedUrl;
};
