/**
 * Flat service fee for customers flagged with `User.chargeServiceFee`, charged
 * only on small orders. Customers without the flag never pay it.
 */
export const SERVICE_FEE_AMOUNT = 10;

/**
 * Orders at or above this subtotal are exempt. Compared against the pre-GST
 * subtotal of the goods, before the fee itself is added.
 */
export const SERVICE_FEE_THRESHOLD = 150;

export function calculateServiceFee(
	chargeServiceFee: boolean,
	subTotal: number,
): number {
	if (!chargeServiceFee) return 0;
	return subTotal < SERVICE_FEE_THRESHOLD ? SERVICE_FEE_AMOUNT : 0;
}
