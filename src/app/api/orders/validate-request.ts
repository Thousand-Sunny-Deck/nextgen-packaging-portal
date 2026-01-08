import z from "zod";

// ABN validation helper
const validateABN = (abn: string): boolean => {
	const cleanABN = abn.replace(/\s/g, "");
	if (!/^\d{11}$/.test(cleanABN)) {
		return false;
	}
	// Full ABN checksum validation
	// const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
	const abnDigits = cleanABN.split("").map(Number);
	return abnDigits.length === 11;
	// abnDigits[0] -= 1;
	// const sum = abnDigits.reduce((total, digit, index) => {
	// 	return total + digit * weights[index];
	// }, 0);
	// return sum % 89 === 0;
};

// Zod schemas
const cartItemSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	quantity: z
		.number()
		.int("Quantity must be an integer")
		.positive("Quantity must be positive"),
	description: z.string().min(1, "Description is required"),
	total: z.number().nonnegative("Total must be non-negative"),
	unitCost: z.number().nonnegative("Unit cost must be non-negative"),
});

const orderSummaryInfoSchema = z.object({
	subTotal: z.number().nonnegative("Subtotal must be non-negative"),
	totalCost: z.number().nonnegative("Total cost must be non-negative"),
	extraCost: z.record(z.string(), z.number().nonnegative()),
	cartSize: z
		.number()
		.int("Cart size must be an integer")
		.nonnegative("Cart size must be non-negative"),
});

const cartPayloadSchema = z.object({
	items: z.array(cartItemSchema).min(1, "Cart must contain at least one item"),
	extraCartInfo: orderSummaryInfoSchema,
});

const billingInfoSchema = z.object({
	email: z.string().email("Invalid email address"),
	organization: z.string().min(1, "Organization name is required"),
	address: z
		.string()
		.min(10, "Billing address must be at least 10 characters long"),
	ABN: z
		.string()
		.refine(
			(abn) => validateABN(abn),
			"ABN must be a valid 11-digit Australian Business Number",
		),
});

export const orderPayloadSchema = z.object({
	cart: cartPayloadSchema,
	billingInfo: billingInfoSchema,
});
