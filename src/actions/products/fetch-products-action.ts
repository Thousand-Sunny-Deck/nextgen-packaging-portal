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
	// Dual-unit pricing. When hasUnitOptions is true the customer picks a unit
	// (Sleeve/Box) at order time and the matching price applies.
	hasUnitOptions: boolean;
	sleevePrice: number | null;
	boxPrice: number | null;
}

export type FetchProductsResult = {
	items: ProductData[];
};

type FetchProductsInput = {
	userId?: string;
	search?: string;
};

export interface ShopCategory {
	id: string;
	name: string;
	handle: string;
	description: string | null;
	imageUrl: string | null;
	productCount: number;
}

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
	hasUnitOptions = false,
	sleevePrice = null,
	boxPrice = null,
}: {
	handle: string;
	sku: string;
	description: string;
	unitCost: number;
	imageUrl?: string | null;
	hasUnitOptions?: boolean;
	sleevePrice?: number | null;
	boxPrice?: number | null;
}): ProductData => ({
	handle,
	sku,
	itemCode: sku,
	description,
	unitCost,
	imageUrl: toImageUrl(imageUrl),
	hasUnitOptions,
	sleevePrice,
	boxPrice,
});

export const fetchNonEntitledCatalogProducts = async ({
	userId,
	search,
	categoryId,
}: FetchProductsInput & {
	userId: string;
	categoryId?: string;
}): Promise<FetchProductsResult> => {
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

	// No pagination — return the full result set so the page can be scrolled.
	const rows = await prisma.product.findMany({
		where,
		orderBy: { handle: "asc" },
	});

	return { items: rows.map((product) => toProductData(product)) };
};

export const fetchEntitledProducts = async ({
	userId,
	search,
	categoryId,
}: FetchProductsInput & {
	userId: string;
	categoryId?: string;
}): Promise<FetchProductsResult> => {
	const sanitizedSearch = sanitizeSearch(search);

	const where = {
		userId,
		...(categoryId
			? { product: { categories: { some: { categoryId } } } }
			: {}),
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

	// No pagination — return all entitled products so the page can be scrolled.
	const rows = await prisma.userProductEntitlement.findMany({
		where,
		orderBy: { product: { handle: "asc" } },
		select: {
			customSku: true,
			customDescription: true,
			customUnitCost: true,
			customSleevePrice: true,
			customBoxPrice: true,
			customImageUrl: true,
			product: {
				select: {
					handle: true,
					sku: true,
					description: true,
					unitCost: true,
					imageUrl: true,
					hasUnitOptions: true,
					sleevePrice: true,
					boxPrice: true,
				},
			},
		},
	});

	return {
		items: rows.map((entitlement) =>
			toProductData({
				handle: entitlement.product.handle,
				sku: entitlement.customSku ?? entitlement.product.sku,
				description:
					entitlement.customDescription ?? entitlement.product.description,
				unitCost: entitlement.customUnitCost ?? entitlement.product.unitCost,
				imageUrl: entitlement.customImageUrl ?? entitlement.product.imageUrl,
				// Unit-priced products: the per-customer sleeve/box price overrides
				// the product's, when set.
				hasUnitOptions: entitlement.product.hasUnitOptions,
				sleevePrice:
					entitlement.customSleevePrice ?? entitlement.product.sleevePrice,
				boxPrice: entitlement.customBoxPrice ?? entitlement.product.boxPrice,
			}),
		),
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
 * Categories shown on the Quick Order landing page. Only categories that
 * contain at least one product the user is entitled to are returned.
 */
export const fetchQuickOrderCategories = async ({
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
								entitledUsers: { some: { userId } },
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
 * Count of shop-browsable products (global or shop-visible, and not already
 * entitled) that are not assigned to any category. Used to decide whether the
 * shop landing needs an "All products" tile so uncategorized items stay
 * reachable.
 */
export const countUncategorizedShopProducts = async ({
	userId,
}: {
	userId: string;
}): Promise<number> => {
	return prisma.product.count({
		where: {
			categories: { none: {} },
			entitledUsers: { none: { userId } },
			OR: [{ isGlobal: true }, { shopVisibilities: { some: { userId } } }],
		},
	});
};

/**
 * Count of the user's entitled products that are not assigned to any category.
 * Used to decide whether the Quick Order landing needs an "All products" tile.
 */
export const countUncategorizedEntitledProducts = async ({
	userId,
}: {
	userId: string;
}): Promise<number> => {
	return prisma.userProductEntitlement.count({
		where: { userId, product: { categories: { none: {} } } },
	});
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
