"use server";

import { OrderSummaryInfo } from "@/components/checkout/order/order-summary";
import { BillingInfoItem as BillingInfoPayload } from "@/lib/store/billing-info-store";
import { CartItem } from "@/lib/store/product-store";
import { headers } from "next/headers";

export type OrderPayload = {
	cart: CartPayload;
	billingInfo: BillingInfoPayload;
};

type CartPayload = {
	items: CartItem[];
	extraCartInfo: OrderSummaryInfo;
};

type FireResponse = {
	ok: boolean;
	error?: unknown;
};

export const preparePayloadAndFire = async (
	cart: CartPayload,
	billingInfo: BillingInfoPayload,
): Promise<FireResponse> => {
	const payload: OrderPayload = {
		cart: cart,
		billingInfo: billingInfo,
	};

	console.dir(payload, {
		depth: 100,
	});

	const headersList = await headers();
	const host = headersList.get("host");
	const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
	const baseUrl = `${protocol}://${host}`;

	console.log(baseUrl);

	const response = await fetch(`${baseUrl}/api/orders`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorData = await response.json();
		return {
			ok: false,
			error: errorData.errors || "Failed to process order",
		};
	}

	return {
		ok: true,
	};
};
