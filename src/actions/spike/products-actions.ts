"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { slugify } from "@/lib/utils";
import { S3Service } from "@/service/s3";

export type SpikeAdminProduct = {
	id: string;
	sku: string;
	handle: string;
	description: string;
	unitCost: number;
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
