"use server";

import { featureFlags } from "@/lib/feature-flags";
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
	if (featureFlags.catalogV2) {
		// Phase B: paginated server action will replace this branch
		throw new Error("catalogV2 not yet implemented");
	}

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
