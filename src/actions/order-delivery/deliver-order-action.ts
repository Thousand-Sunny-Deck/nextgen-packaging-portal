"use server";

import { OrderSummaryInfo } from "@/components/checkout/order/order-summary";
import { env } from "@/lib/env-validation/env";
import { BillingInfoItem as BillingInfoPayload } from "@/lib/store/billing-info-store";
import { CartItem } from "@/lib/store/product-store";
import { cookies } from "next/headers";

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

	const cookies = await getCookieHeader();
	const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/orders`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Cookie: cookies,
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

const getCookieHeader = async (): Promise<string> => {
	const cookieStore = await cookies();

	// ✅ Convert cookies to Cookie header string
	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");

	return cookieHeader;
};
