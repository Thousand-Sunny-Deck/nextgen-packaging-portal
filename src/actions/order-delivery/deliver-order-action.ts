"use server";

import { OrderSummaryInfo } from "@/components/checkout/order/order-summary";
import { BillingInfoItem as BillingInfoPayload } from "@/lib/store/billing-info-store";
import { CartItem } from "@/lib/store/product-store";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { orderPayloadSchema } from "@/app/api/orders/validate-request";
import {
	storePreparedOrderInDb,
	updateStateForOrder,
} from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";
import { inngest } from "@/inngest/client";

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
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			return {
				ok: false,
				error: "Unauthorized",
			};
		}

		const payload: OrderPayload = {
			cart: cart,
			billingInfo: billingInfo,
		};

		const validationResult = orderPayloadSchema.safeParse(payload);

		if (!validationResult.success) {
			const errors = validationResult.error.issues.map((err) => {
				const path = err.path.join(".");
				return path ? `${path}: ${err.message}` : err.message;
			});

			return {
				ok: false,
				error: errors.join(", "),
			};
		}

		const order = await storePreparedOrderInDb(payload, session.user.id);

		try {
			await inngest.send({
				name: "invoice/generate",
				data: {
					orderId: order.orderId,
					userId: order.userId,
					email: order.customerEmail,
				},
			});
		} catch (inngestError) {
			console.error("Failed to queue invoice generation:", inngestError);
			await updateStateForOrder(
				order.orderId,
				order.userId!,
				OrderStatus.FAILED,
			);
			return {
				ok: false,
				error: "Failed to process order. Please try again.",
			};
		}

		return {
			ok: true,
		};
	} catch (err: unknown) {
		console.error("Error in preparePayloadAndFire:", err);
		return {
			ok: false,
			error: "Something went wrong",
		};
	}
};
