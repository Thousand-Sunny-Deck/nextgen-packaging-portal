import { CacheService } from "@/service/cache";
import { S3Service } from "@/service/s3";

export const PRODUCT_IMAGE_URL_EXPIRY = 5 * 60;
export const PRODUCT_IMAGE_URL_CACHE_TTL = 2 * 60;

export async function getProductImagePresignedUrlWithCache(
	s3: S3Service,
	cacheKey: string,
	s3Key: string,
): Promise<string> {
	const cache = new CacheService("product-image-url");
	const cached = await cache.get<string>(cacheKey);
	if (cached) return cached;

	const presignedUrl = await s3.getPresignedUrl(
		s3Key,
		PRODUCT_IMAGE_URL_EXPIRY,
		"get",
	);
	await cache.set(cacheKey, presignedUrl, PRODUCT_IMAGE_URL_CACHE_TTL);
	return presignedUrl;
}
