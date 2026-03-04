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
/**
 * Fetches all products that a user is entitled to.
 * Uses custom fields from entitlements when available, falls back to base product fields.
 *
 * @param userId - The user ID to fetch products for
 * @returns Array of ProductData the user is entitled to (empty if no entitlements)
 */
export async function fetchProductsForUser(
	userId: string,
	search?: string,
): Promise<ProductData[]> {
	const sanitizedSearch = search?.trim().slice(0, 100);
	const entitlements = await prisma.userProductEntitlement.findMany({
		where: {
			userId,
		},
		include: {
			product: true,
		},
	});

	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";

	const products: ProductData[] = entitlements.map((entitlement) => {
		const {
			product,
			customSku,
			customDescription,
			customUnitCost,
			customImageUrl,
		} = entitlement;

		const sku = customSku ?? product.sku;
		const rawImageUrl = customImageUrl ?? product.imageUrl;

		return {
			handle: product.handle,
			sku,
			itemCode: sku,
			description: customDescription ?? product.description,
			unitCost: customUnitCost ?? product.unitCost,
			imageUrl:
				rawImageUrl && cloudfrontUrl ? `${cloudfrontUrl}/${rawImageUrl}` : null,
		};
	});

	if (!sanitizedSearch) return products;

	const q = sanitizedSearch.toLowerCase();
	return products.filter(
		(p) =>
			p.sku.toLowerCase().includes(q) ||
			p.description.toLowerCase().includes(q),
	);
}

const MAX_PAGE_SIZE = 100;

export const fetchEntitledCatalog = async ({
	userId,
	search,
	page = 1,
	pageSize = 24,
}: {
	userId: string;
	search?: string;
	page?: number;
	pageSize?: number;
}): Promise<FetchProductsResult> => {
	const sanitizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;

	const sanitizedPageSize = Number.isFinite(pageSize)
		? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
		: 24;

	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	const where = {
		userId,
		...(search
			? {
					OR: [
						{ customSku: { contains: search, mode: "insensitive" as const } },
						{
							customDescription: {
								contains: search,
								mode: "insensitive" as const,
							},
						},
						{
							product: {
								sku: { contains: search, mode: "insensitive" as const },
							},
						},
						{
							product: {
								description: {
									contains: search,
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
			orderBy: [{ customSku: "asc" }, { product: { sku: "asc" } }],
			select: {
				customSku: true,
				customDescription: true,
				customUnitCost: true,
				customImageUrl: true,
				product: {
					select: {
						sku: true,
						description: true,
						unitCost: true,
						imageUrl: true,
					},
				},
			},
		}),
	]);

	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";

	const items = rows.map((row) => ({
		sku: row.product.sku,
		itemCode: row.product.sku,
		description: row.product.description,
		unitCost: row.product.unitCost,
		imageUrl:
			row.product.imageUrl && cloudfrontUrl
				? `${cloudfrontUrl}/${row.product.imageUrl}`
				: null,
	}));

	return {
		items,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		total,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
};

// TODO: Optimised prefetch loading
// Instead of fetching only the requested page, fetch current + next page in a single DB call
// (take: pageSize * 2). Return the current page's items in the response as normal, but also
// return the nextPageItems separately. On the client, CatalogPagination detects the prefetched
// data and stores it (e.g. in a ref or zustand slice keyed by page number). When the user
// clicks Next, the client renders the cached nextPageItems instantly while a background fetch
// loads page+2 — making navigation feel seamless unless the user spams through pages faster
// than a single round-trip. Only prefetch when page < totalPages to avoid wasted work on the
// last page.
export const fetchCatalog = async ({
	search,
	page = 1,
	pageSize = 24,
}: {
	search?: string;
	page?: number;
	pageSize?: number;
} = {}): Promise<FetchProductsResult> => {
	const sanitizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;

	const sanitizedPageSize = Number.isFinite(pageSize)
		? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
		: 24;

	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	const sanitizedSearch = search?.trim().slice(0, 100);

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
			orderBy: { handle: "asc" },
		}),
	]);

	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";

	console.log("ROWS:", rows);

	const items = rows.map((product) => ({
		handle: product.handle,
		sku: product.sku,
		itemCode: product.sku,
		description: product.description,
		unitCost: product.unitCost,
		imageUrl:
			product.imageUrl && cloudfrontUrl
				? `${cloudfrontUrl}/${product.imageUrl}`
				: null,
	}));

	console.log(items);

	return {
		items,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		total,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
};
