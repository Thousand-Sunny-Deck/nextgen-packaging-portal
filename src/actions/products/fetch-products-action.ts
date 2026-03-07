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
	search?: string;
	page?: number;
	pageSize?: number;
};

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
	const { sanitizedPage, sanitizedPageSize, skip } = sanitizePagination({
		page,
		pageSize,
	});
	const sanitizedSearch = sanitizeSearch(search);

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

export const fetchProductsForUser = async (userId: string, search?: string) => {
	const result = await fetchEntitledProducts({ userId, search });
	return result.items;
};
