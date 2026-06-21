"use server";

import { env } from "@/lib/env-validation/env";
import { prisma } from "@/lib/config/prisma";

export interface ProductData {
	handle: string;
	sku: string;
	itemCode: string; // same as sku
	description: string;
	unitCost: number;
	imageUrl?: string | null;
}

export type FetchProductsResult = {
	items: ProductData[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
};

const MAX_PAGE_SIZE = 100;

type FetchProductsInput = {
	userId?: string;
	search?: string;
	page?: number;
	pageSize?: number;
};

export interface ShopCategory {
	id: string;
	name: string;
	handle: string;
	description: string | null;
	imageUrl: string | null;
	productCount: number;
}

const sanitizePagination = ({
	page = 1,
	pageSize = 24,
}: FetchProductsInput) => {
	const sanitizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;

	const sanitizedPageSize = Number.isFinite(pageSize)
		? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
		: 24;

	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	return {
		sanitizedPage,
		sanitizedPageSize,
		skip,
	};
};

const sanitizeSearch = (search?: string) => search?.trim().slice(0, 100);

const toImageUrl = (imageUrl: string | null | undefined) => {
	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";
	return imageUrl && cloudfrontUrl ? `${cloudfrontUrl}/${imageUrl}` : null;
};

const toProductData = ({
	handle,
	sku,
	description,
	unitCost,
	imageUrl,
}: {
	handle: string;
	sku: string;
	description: string;
	unitCost: number;
	imageUrl?: string | null;
}): ProductData => ({
	handle,
	sku,
	itemCode: sku,
	description,
	unitCost,
	imageUrl: toImageUrl(imageUrl),
});

export const fetchNonEntitledCatalogProducts = async ({
	userId,
	search,
	categoryId,
	page = 1,
	pageSize = 24,
}: FetchProductsInput & {
	userId: string;
	categoryId?: string;
}): Promise<FetchProductsResult> => {
	const { sanitizedPage, sanitizedPageSize, skip } = sanitizePagination({
		page,
		pageSize,
	});
	const sanitizedSearch = sanitizeSearch(search);

	const where = {
		// A product shows in this user's shop when it is global OR has been
		// granted per-user shop visibility to them. Products the user is already
		// entitled to live in Quick Order, so they are excluded here.
		entitledUsers: {
			none: {
				userId,
			},
		},
		...(categoryId ? { categories: { some: { categoryId } } } : {}),
		AND: [
			{
				OR: [{ isGlobal: true }, { shopVisibilities: { some: { userId } } }],
			},
			...(sanitizedSearch
				? [
						{
							OR: [
								{
									sku: {
										contains: sanitizedSearch,
										mode: "insensitive" as const,
									},
								},
								{
									description: {
										contains: sanitizedSearch,
										mode: "insensitive" as const,
									},
								},
							],
						},
					]
				: []),
		],
	};

	const [total, rows] = await prisma.$transaction([
		prisma.product.count({ where }),
		prisma.product.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: { handle: "asc" },
		}),
	]);

	const items = rows.map((product) => toProductData(product));

	return {
		items,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		total,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
};

export const fetchEntitledProducts = async ({
	userId,
	search,
	page = 1,
	pageSize = 24,
}: FetchProductsInput & {
	userId: string;
}): Promise<FetchProductsResult> => {
	const { sanitizedPage, sanitizedPageSize, skip } = sanitizePagination({
		page,
		pageSize,
	});
	const sanitizedSearch = sanitizeSearch(search);

	const where = {
		userId,
		...(sanitizedSearch
			? {
					OR: [
						{
							customSku: {
								contains: sanitizedSearch,
								mode: "insensitive" as const,
							},
						},
						{
							customDescription: {
								contains: sanitizedSearch,
								mode: "insensitive" as const,
							},
						},
						{
							product: {
								sku: {
									contains: sanitizedSearch,
									mode: "insensitive" as const,
								},
							},
						},
						{
							product: {
								description: {
									contains: sanitizedSearch,
									mode: "insensitive" as const,
								},
							},
						},
					],
				}
			: {}),
	};

	const [total, rows] = await prisma.$transaction([
		prisma.userProductEntitlement.count({ where }),
		prisma.userProductEntitlement.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: { product: { handle: "asc" } },
			select: {
				customSku: true,
				customDescription: true,
				customUnitCost: true,
				customImageUrl: true,
				product: {
					select: {
						handle: true,
						sku: true,
						description: true,
						unitCost: true,
						imageUrl: true,
					},
				},
			},
		}),
	]);

	const items = rows.map((entitlement) =>
		toProductData({
			handle: entitlement.product.handle,
			sku: entitlement.customSku ?? entitlement.product.sku,
			description:
				entitlement.customDescription ?? entitlement.product.description,
			unitCost: entitlement.customUnitCost ?? entitlement.product.unitCost,
			imageUrl: entitlement.customImageUrl ?? entitlement.product.imageUrl,
		}),
	);

	return {
		items,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		total,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
};

/**
 * Categories shown on the shop landing page. Only categories that contain at
 * least one product the user is NOT already entitled to are returned, so the
 * grouping matches what the user can actually browse in the shop.
 */
export const fetchShopCategories = async ({
	userId,
}: {
	userId: string;
}): Promise<ShopCategory[]> => {
	const categories = await prisma.category.findMany({
		orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
		select: {
			id: true,
			name: true,
			handle: true,
			description: true,
			imageUrl: true,
			_count: {
				select: {
					products: {
						where: {
							product: {
								entitledUsers: { none: { userId } },
								OR: [
									{ isGlobal: true },
									{ shopVisibilities: { some: { userId } } },
								],
							},
						},
					},
				},
			},
		},
	});

	return categories
		.filter((category) => category._count.products > 0)
		.map((category) => ({
			id: category.id,
			name: category.name,
			handle: category.handle,
			description: category.description,
			imageUrl: toImageUrl(category.imageUrl),
			productCount: category._count.products,
		}));
};

/**
 * Resolves a category handle to its id + display name for the shop drill-down
 * view. Returns null when no such category exists.
 */
export const resolveShopCategoryByHandle = async (
	handle: string,
): Promise<{ id: string; name: string; handle: string } | null> => {
	const sanitized = handle.trim().slice(0, 100);
	if (!sanitized) return null;

	const category = await prisma.category.findUnique({
		where: { handle: sanitized },
		select: { id: true, name: true, handle: true },
	});

	return category;
};
