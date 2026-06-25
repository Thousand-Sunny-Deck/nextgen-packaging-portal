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

/**
 * Per-customer price overrides (from an entitlement). Any null falls back to the
 * product's price. Pass null for shop (non-entitled) lines.
 */
export type EntitlementPricing = {
	customUnitCost: number | null;
	customSleevePrice: number | null;
	customBoxPrice: number | null;
} | null;

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
	entitlement: EntitlementPricing,
	unit: LineUnit,
): number {
	if (product.hasUnitOptions) {
		if (unit === "Box") {
			return Number(entitlement?.customBoxPrice ?? product.boxPrice ?? 0);
		}
		return Number(entitlement?.customSleevePrice ?? product.sleevePrice ?? 0);
	}
	return Number(entitlement?.customUnitCost ?? product.unitCost);
}

/** Rounds a monetary value to 2 decimal places. */
export function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}
