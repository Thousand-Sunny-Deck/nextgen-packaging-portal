"use server";

import { env } from "@/lib/env-validation/env";
import { prisma } from "@/lib/config/prisma";

export interface ProductData {
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
): Promise<ProductData[]> {
	const entitlements = await prisma.userProductEntitlement.findMany({
		where: {
			userId,
		},
		include: {
			product: true,
		},
	});

	const products: ProductData[] = entitlements.map((entitlement) => {
		const { product, customSku, customDescription, customUnitCost } =
			entitlement;

		const sku = customSku ?? product.sku;

		return {
			sku,
			itemCode: sku,
			description: customDescription ?? product.description,
			unitCost: customUnitCost ?? product.unitCost,
		};
	});

	return products;
}

const MAX_PAGE_SIZE = 100;

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

	const where = search
		? {
				OR: [
					{ sku: { contains: search, mode: "insensitive" as const } },
					{
						description: {
							contains: search,
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
			orderBy: { sku: "asc" },
		}),
	]);

	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";

	const items = rows.map((product) => ({
		sku: product.sku,
		itemCode: product.sku,
		description: product.description,
		unitCost: product.unitCost,
		imageUrl:
			product.imageUrl && cloudfrontUrl
				? `${cloudfrontUrl}/${product.imageUrl}`
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
