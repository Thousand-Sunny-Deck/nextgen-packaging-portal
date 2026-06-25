"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { slugify } from "@/lib/utils";
import { S3Service } from "@/service/s3";
import { CacheService } from "@/service/cache";
import { getCategoryImagePresignedUrlWithCache } from "./category-image-url-cache";

export type SpikeAdminCategory = {
	id: string;
	name: string;
	handle: string;
	description: string | null;
	imageUrl: string | null;
	sortOrder: number;
	productCount: number;
	createdAt: string;
};

export type GetCategoriesParams = {
	page?: number;
	pageSize?: number;
	search?: string;
};

export type GetCategoriesResult = {
	categories: SpikeAdminCategory[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

const MAX_PAGE_SIZE = 100;

export async function getSpikeCategories(
	params: GetCategoriesParams = {},
): Promise<GetCategoriesResult> {
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
					{ name: { contains: sanitizedSearch, mode: "insensitive" as const } },
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
		prisma.category.count({ where }),
		prisma.category.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
			select: {
				id: true,
				name: true,
				handle: true,
				description: true,
				imageUrl: true,
				sortOrder: true,
				createdAt: true,
				_count: { select: { products: true } },
			},
		}),
	]);

	const categories: SpikeAdminCategory[] = rows.map((category) => ({
		id: category.id,
		name: category.name,
		handle: category.handle,
		description: category.description,
		imageUrl: category.imageUrl,
		sortOrder: category.sortOrder,
		productCount: category._count.products,
		createdAt: category.createdAt.toISOString(),
	}));

	return {
		categories,
		total,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createCategory(input: {
	name: string;
	description?: string;
	sortOrder?: number;
}): Promise<{ success: boolean; error?: string }> {
	await requireSuperAdmin();

	const name = input.name.trim();
	if (!name) {
		return { success: false, error: "Name is required." };
	}

	const handle = slugify(name);
	if (!handle) {
		return {
			success: false,
			error: "Name must contain at least one letter or number.",
		};
	}

	const description = input.description?.trim() || null;
	const sortOrder =
		Number.isFinite(input.sortOrder) && input.sortOrder !== undefined
			? Math.floor(input.sortOrder)
			: 0;

	const existing = await prisma.category.findUnique({
		where: { handle },
		select: { id: true },
	});
	if (existing) {
		return {
			success: false,
			error: `A category with handle "${handle}" already exists. Choose a different name.`,
		};
	}

	try {
		await prisma.category.create({
			data: { name, handle, description, sortOrder },
		});
		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to create category:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to create category." };
	}
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateSpikeCategory(input: {
	categoryId: string;
	name: string;
	description: string | null;
	sortOrder: number;
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const name = input.name.trim();
	if (!name) {
		return { success: false, error: "Name is required." };
	}
	if (!Number.isFinite(input.sortOrder)) {
		return { success: false, error: "Sort order must be a valid number." };
	}

	const handle = slugify(name);
	if (!handle) {
		return {
			success: false,
			error: "Name must contain at least one letter or number.",
		};
	}

	const collision = await prisma.category.findFirst({
		where: { handle, id: { not: input.categoryId } },
		select: { id: true },
	});
	if (collision) {
		return {
			success: false,
			error: `A category with handle "${handle}" already exists. Choose a different name.`,
		};
	}

	try {
		await prisma.category.update({
			where: { id: input.categoryId },
			data: {
				name,
				handle,
				description: input.description?.trim() || null,
				sortOrder: Math.floor(input.sortOrder),
			},
		});
		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update category:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update category." };
	}
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteSpikeCategory(input: {
	categoryId: string;
}): Promise<{ success: boolean; warning?: string; error?: string }> {
	await requireAdmin();

	const category = await prisma.category.findUnique({
		where: { id: input.categoryId },
		select: { id: true, handle: true, imageUrl: true },
	});

	if (!category) {
		return { success: false, error: "Category not found." };
	}

	try {
		// Join rows are removed automatically via onDelete: Cascade.
		await prisma.category.delete({ where: { id: category.id } });
	} catch (error: unknown) {
		console.error("Failed to delete category:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to delete category." };
	}

	if (category.imageUrl) {
		try {
			const s3 = new S3Service();
			const exists = await s3.fileExists(category.imageUrl);
			if (exists) {
				await s3.deleteFile(category.imageUrl);
			}
		} catch (error) {
			console.error(
				"Category deleted but failed to remove image from S3:",
				error,
			);
			return {
				success: true,
				warning: "Category deleted, but image cleanup failed in S3.",
			};
		}
	}

	return { success: true };
}

// ─── Category image ──────────────────────────────────────────────────────────

export async function getSpikeCategoryImageUploadUrl(input: {
	categoryId: string;
}): Promise<{
	success: boolean;
	uploadUrl?: string;
	s3Key?: string;
	error?: string;
}> {
	await requireAdmin();

	const category = await prisma.category.findUnique({
		where: { id: input.categoryId },
		select: { handle: true },
	});
	if (!category) {
		return { success: false, error: "Category not found." };
	}

	try {
		const s3Key = `categories/${category.handle}.png`;
		const s3 = new S3Service();
		const uploadUrl = await s3.getPresignedUrl(s3Key, 300, "put");
		return { success: true, uploadUrl, s3Key };
	} catch (error: unknown) {
		console.error("Failed to generate category upload URL:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to prepare image upload." };
	}
}

export async function updateSpikeCategoryImage(input: {
	categoryId: string;
	imageUrl: string;
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const imageUrl = input.imageUrl.trim();
	if (!imageUrl) {
		return { success: false, error: "Image key is required." };
	}

	try {
		await prisma.category.update({
			where: { id: input.categoryId },
			data: { imageUrl },
		});

		const cache = new CacheService("category-image-url");
		await cache.delete(`${input.categoryId}:${imageUrl}`);

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update category image:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update category image." };
	}
}

export async function getSpikeCategoryImageViewUrl(input: {
	categoryId: string;
}): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
	await requireAdmin();

	const category = await prisma.category.findUnique({
		where: { id: input.categoryId },
		select: { id: true, handle: true, imageUrl: true },
	});

	if (!category) {
		return { success: false, error: "Category not found." };
	}

	const imageKey = category.imageUrl || `categories/${category.handle}.png`;

	try {
		const s3 = new S3Service();
		const exists = await s3.fileExists(imageKey);
		if (!exists) {
			return { success: false, error: "No image found for this category." };
		}

		const cacheKey = `${category.id}:${imageKey}`;
		const imageUrl = await getCategoryImagePresignedUrlWithCache(
			s3,
			cacheKey,
			imageKey,
		);

		return { success: true, imageUrl };
	} catch (error: unknown) {
		console.error("Failed to generate category image URL:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to load category image." };
	}
}

// ─── Product <-> Category assignment ─────────────────────────────────────────

export type SpikeAssignableCategory = {
	id: string;
	name: string;
	handle: string;
	assigned: boolean;
};

/**
 * Returns every category with a flag indicating whether the given product is
 * already assigned to it. Used by the "Manage categories" dialog.
 */
export async function getSpikeProductCategories(input: {
	productId: string;
}): Promise<{
	success: boolean;
	categories?: SpikeAssignableCategory[];
	error?: string;
}> {
	await requireAdmin();

	const product = await prisma.product.findUnique({
		where: { id: input.productId },
		select: { id: true },
	});
	if (!product) {
		return { success: false, error: "Product not found." };
	}

	const [categories, assignments] = await Promise.all([
		prisma.category.findMany({
			orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
			select: { id: true, name: true, handle: true },
		}),
		prisma.productCategory.findMany({
			where: { productId: input.productId },
			select: { categoryId: true },
		}),
	]);

	const assignedIds = new Set(assignments.map((a) => a.categoryId));

	return {
		success: true,
		categories: categories.map((category) => ({
			id: category.id,
			name: category.name,
			handle: category.handle,
			assigned: assignedIds.has(category.id),
		})),
	};
}

/**
 * Replaces the set of categories a product belongs to with the provided list.
 * Adds missing assignments and removes the ones no longer selected in a single
 * transaction (all-or-nothing).
 */
export async function setSpikeProductCategories(input: {
	productId: string;
	categoryIds: string[];
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const product = await prisma.product.findUnique({
		where: { id: input.productId },
		select: { id: true },
	});
	if (!product) {
		return { success: false, error: "Product not found." };
	}

	const nextIds = Array.from(new Set(input.categoryIds));

	try {
		await prisma.$transaction([
			prisma.productCategory.deleteMany({
				where: {
					productId: input.productId,
					...(nextIds.length > 0 ? { categoryId: { notIn: nextIds } } : {}),
				},
			}),
			prisma.productCategory.createMany({
				data: nextIds.map((categoryId) => ({
					productId: input.productId,
					categoryId,
				})),
				skipDuplicates: true,
			}),
		]);
		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to set product categories:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update product categories." };
	}
}
