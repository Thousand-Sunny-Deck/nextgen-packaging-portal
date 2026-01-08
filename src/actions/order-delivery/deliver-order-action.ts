"use server";

import { OrderSummaryInfo } from "@/components/checkout/order/order-summary";
import { BillingInfoItem as BillingInfoPayload } from "@/lib/store/billing-info-store";
import { CartItem } from "@/lib/store/product-store";

type PdfGenerationPayload = {
	cart: CartPayload;
	billingInfo: BillingInfoPayload;
};

type CartPayload = {
	items: CartItem[];
	extraCartInfo: OrderSummaryInfo;
};

export const preparePayloadAndFire = async (
	cart: CartPayload,
	billingInfo: BillingInfoPayload,
) => {
	const payload: PdfGenerationPayload = {
		cart: cart,
		billingInfo: billingInfo,
	};

	// TODO: from here on, data is with us and we can start generating pdf
	return payload;
};
