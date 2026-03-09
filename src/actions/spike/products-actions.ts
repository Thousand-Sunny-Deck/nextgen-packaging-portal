"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { slugify } from "@/lib/utils";
import { S3Service } from "@/service/s3";
import { getProductImagePresignedUrlWithCache } from "./product-image-url-cache";

export type SpikeAdminProduct = {
	id: string;
	sku: string;
	handle: string;
	description: string;
	unitCost: number;
	imageUrl: string | null;
	createdAt: string;
};

export type GetProductsParams = {
	page?: number;
	pageSize?: number;
	search?: string;
};

export type GetProductsResult = {
	products: SpikeAdminProduct[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

const MAX_PAGE_SIZE = 100;

export async function getSpikeProducts(
	params: GetProductsParams = {},
): Promise<GetProductsResult> {
	await requireAdmin();

	const { page = 1, pageSize = 20, search } = params;

	const sanitizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;

	const sanitizedPageSize = Number.isFinite(pageSize)
		? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
		: 20;

	const sanitizedSearch = search?.trim().slice(0, 100);
	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	const where = sanitizedSearch
		? {
				OR: [
					{ sku: { contains: sanitizedSearch, mode: "insensitive" as const } },
					{
						description: {
							contains: sanitizedSearch,
							mode: "insensitive" as const,
						},
					},
				],
			}
		: {};

	const [total, rows] = await prisma.$transaction([
		prisma.product.count({ where }),
		prisma.product.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				sku: true,
				handle: true,
				description: true,
				unitCost: true,
				imageUrl: true,
				createdAt: true,
			},
		}),
	]);

	const products: SpikeAdminProduct[] = rows.map((product) => ({
		id: product.id,
		sku: product.sku,
		handle: product.handle,
		description: product.description,
		unitCost: Number(product.unitCost),
		imageUrl: product.imageUrl,
		createdAt: product.createdAt.toISOString(),
	}));

	return {
		products,
		total,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

export async function getProductImageUploadUrl(
	handle: string,
): Promise<{ uploadUrl: string; s3Key: string }> {
	await requireSuperAdmin();
	const s3Key = `images/${handle}.png`;
	const s3 = new S3Service();
	const uploadUrl = await s3.getPresignedUrl(s3Key, 300, "put");
	return { uploadUrl, s3Key };
}

export async function getSpikeProductImageUploadUrl(input: {
	productId: string;
}): Promise<{
	success: boolean;
	uploadUrl?: string;
	s3Key?: string;
	error?: string;
}> {
	await requireAdmin();

	const product = await prisma.product.findUnique({
		where: { id: input.productId },
		select: { handle: true },
	});
	if (!product) {
		return { success: false, error: "Product not found." };
	}

	try {
		const s3Key = `images/${product.handle}.png`;
		const s3 = new S3Service();
		const uploadUrl = await s3.getPresignedUrl(s3Key, 300, "put");
		return { success: true, uploadUrl, s3Key };
	} catch (error: unknown) {
		console.error("Failed to generate spike product upload URL:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to prepare image upload." };
	}
}

// ─── Bulk Create ─────────────────────────────────────────────────────────────

export type BulkCreateProductEntry = {
	sku: string;
	description: string;
	unitCost: number;
	imageUrl?: string;
};

export type BulkCreateProductsResult =
	| { success: true }
	| { success: false; error: string };

export async function bulkCreateProducts(
	entries: BulkCreateProductEntry[],
): Promise<BulkCreateProductsResult> {
	await requireSuperAdmin();

	if (entries.length === 0 || entries.length > 10) {
		return { success: false, error: "Must provide between 1 and 10 products." };
	}

	const skus = entries.map((e) => e.sku.trim());
	const handles = entries.map((e) =>
		slugify(`${e.sku.trim()} ${e.description.trim()}`),
	);

	const [existingBySku, existingByHandle] = await prisma.$transaction([
		prisma.product.findMany({
			where: { sku: { in: skus } },
			select: { sku: true },
		}),
		prisma.product.findMany({
			where: { handle: { in: handles } },
			select: { handle: true },
		}),
	]);

	if (existingBySku.length > 0) {
		const conflicts = existingBySku.map((p) => p.sku).join(", ");
		return {
			success: false,
			error: `SKU${existingBySku.length > 1 ? "s" : ""} already exist: ${conflicts}`,
		};
	}

	if (existingByHandle.length > 0) {
		const conflicts = existingByHandle.map((p) => p.handle).join(", ");
		return {
			success: false,
			error: `Handle collision${existingByHandle.length > 1 ? "s" : ""} detected: ${conflicts}. Adjust SKU or description to resolve.`,
		};
	}

	try {
		await prisma.$transaction(
			entries.map((entry) =>
				prisma.product.create({
					data: {
						sku: entry.sku.trim(),
						description: entry.description.trim(),
						unitCost: entry.unitCost,
						handle: slugify(`${entry.sku.trim()} ${entry.description.trim()}`),
						imageUrl: entry.imageUrl ?? null,
					},
				}),
			),
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("[bulkCreateProducts] Transaction failed:", err);
		return { success: false, error: `Failed to create products: ${message}` };
	}

	return { success: true };
}

export async function updateSpikeProduct(input: {
	productId: string;
	sku: string;
	description: string;
	unitCost: number;
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const sku = input.sku.trim();
	const description = input.description.trim();
	if (!sku) {
		return { success: false, error: "SKU is required." };
	}
	if (!description) {
		return { success: false, error: "Description is required." };
	}
	if (!Number.isFinite(input.unitCost) || input.unitCost < 0) {
		return {
			success: false,
			error: "Unit cost must be a valid positive number.",
		};
	}

	try {
		await prisma.product.update({
			where: { id: input.productId },
			data: {
				sku,
				description,
				unitCost: input.unitCost,
			},
		});
		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update spike product:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update product." };
	}
}

export async function deleteSpikeProduct(input: {
	productId: string;
}): Promise<{ success: boolean; warning?: string; error?: string }> {
	await requireAdmin();

	const product = await prisma.product.findUnique({
		where: { id: input.productId },
		select: {
			id: true,
			handle: true,
			imageUrl: true,
		},
	});

	if (!product) {
		return { success: false, error: "Product not found." };
	}

	try {
		await prisma.$transaction([
			prisma.userProductEntitlement.deleteMany({
				where: { productId: product.id },
			}),
			prisma.product.delete({
				where: { id: product.id },
			}),
		]);
	} catch (error: unknown) {
		console.error("Failed to delete spike product:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to delete product." };
	}

	const imageKey = product.imageUrl || `images/${product.handle}.png`;
	try {
		const s3 = new S3Service();
		const exists = await s3.fileExists(imageKey);
		if (exists) {
			await s3.deleteFile(imageKey);
		}
	} catch (error) {
		console.error("Product deleted but failed to remove image from S3:", error);
		return {
			success: true,
			warning: "Product deleted, but image cleanup failed in S3.",
		};
	}

	return { success: true };
}

export async function getSpikeProductImageViewUrl(input: {
	productId: string;
}): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
	await requireAdmin();

	const product = await prisma.product.findUnique({
		where: { id: input.productId },
		select: {
			id: true,
			handle: true,
			imageUrl: true,
		},
	});

	if (!product) {
		return { success: false, error: "Product not found." };
	}

	const imageKey = product.imageUrl || `images/${product.handle}.png`;

	try {
		const s3 = new S3Service();
		const exists = await s3.fileExists(imageKey);
		if (!exists) {
			return { success: false, error: "No image found for this product." };
		}

		const cacheKey = `${product.id}:${imageKey}`;
		const imageUrl = await getProductImagePresignedUrlWithCache(
			s3,
			cacheKey,
			imageKey,
		);

		return { success: true, imageUrl };
	} catch (error: unknown) {
		console.error("Failed to generate product image URL:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to load product image." };
	}
}

export async function updateSpikeProductImage(input: {
	productId: string;
	imageUrl: string;
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const imageUrl = input.imageUrl.trim();
	if (!imageUrl) {
		return { success: false, error: "Image key is required." };
	}

	try {
		await prisma.product.update({
			where: { id: input.productId },
			data: { imageUrl },
		});
		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update spike product image:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update product image." };
	}
}
