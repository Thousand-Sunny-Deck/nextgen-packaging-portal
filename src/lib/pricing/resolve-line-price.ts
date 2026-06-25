/**
 * Canonical, server-authoritative pricing rule for a single ordered unit.
 *
 * This mirrors what the catalogue shows and MUST be the only place the price
 * rule lives, so checkout, reorder, and the catalogue can never drift:
 *   - dual-unit products use their sleeve/box price (a per-customer custom
 *     price does NOT apply to unit-priced products)
 *   - otherwise: the per-customer custom price when entitled, else the base
 *     unit cost
 */

export type LineUnit = "Sleeve" | "Box" | null;

export type PriceableProduct = {
	unitCost: number;
	hasUnitOptions: boolean;
	sleevePrice: number | null;
	boxPrice: number | null;
};

/** Normalises a free-form unit string against the product's capability. */
export function normalizeUnit(
	product: { hasUnitOptions: boolean },
	unit: string | null | undefined,
): LineUnit {
	if (!product.hasUnitOptions) return null;
	return unit === "Box" ? "Box" : "Sleeve";
}

export function resolveLinePrice(
	product: PriceableProduct,
	entitlementCustomUnitCost: number | null | undefined,
	unit: LineUnit,
): number {
	if (product.hasUnitOptions) {
		const price = unit === "Box" ? product.boxPrice : product.sleevePrice;
		return Number(price ?? 0);
	}
	return Number(entitlementCustomUnitCost ?? product.unitCost);
}

/** Rounds a monetary value to 2 decimal places. */
export function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}
