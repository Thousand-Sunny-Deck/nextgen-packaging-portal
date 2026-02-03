"use server";

import { prisma } from "@/lib/config/prisma";

export interface ProductData {
	sku: string;
	itemCode: string; // same as sku
	description: string;
	unitCost: number;
}

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
