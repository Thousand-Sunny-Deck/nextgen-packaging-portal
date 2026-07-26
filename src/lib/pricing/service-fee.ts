/**
 * Flat service fee charged on every order for customers flagged with
 * `User.chargeServiceFee`. All other customers pay no service fee.
 */
export const SERVICE_FEE_AMOUNT = 10;

export function calculateServiceFee(chargeServiceFee: boolean): number {
	return chargeServiceFee ? SERVICE_FEE_AMOUNT : 0;
}
