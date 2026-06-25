import { CacheService } from "@/service/cache";
import { S3Service } from "@/service/s3";

export const CATEGORY_IMAGE_URL_EXPIRY = 5 * 60;
export const CATEGORY_IMAGE_URL_CACHE_TTL = 2 * 60;

export async function getCategoryImagePresignedUrlWithCache(
	s3: S3Service,
	cacheKey: string,
	s3Key: string,
): Promise<string> {
	const cache = new CacheService("category-image-url");
	const cached = await cache.get<string>(cacheKey);
	if (cached) return cached;

	const presignedUrl = await s3.getPresignedUrl(
		s3Key,
		CATEGORY_IMAGE_URL_EXPIRY,
		"get",
	);
	await cache.set(cacheKey, presignedUrl, CATEGORY_IMAGE_URL_CACHE_TTL);
	return presignedUrl;
}
