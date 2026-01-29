"use server";

import { auth } from "@/lib/config/auth";
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { headers } from "next/headers";
import { CartItem } from "@/lib/store/product-store";
import { BillingInfoItem } from "@/lib/store/billing-info-store";

export type ReorderResponse =
	| {
			success: true;
			data: {
				items: CartItem[];
				billingInfo: BillingInfoItem | null;
			};
	  }
	| {
			success: false;
			message: string;
	  };

export async function reorderAction(orderId: string): Promise<ReorderResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return {
			success: false,
			message: "Unauthorized",
		};
	}

	const userId = session.user.id;

	// Fetch order - userId check ensures user can only access their own orders
	const order = await fetchOrderByUserAndOrderId(orderId, userId);

	if (!order) {
		return {
			success: false,
			message: "Order not found",
		};
	}

	return {
		success: true,
		data: {
			items: order.items.map((item) => ({
				sku: item.sku,
				quantity: item.quantity,
				description: item.description,
				total: item.total,
				unitCost: item.unitCost,
			})),
			billingInfo: order.billingAddress
				? {
						email: order.billingAddress.email,
						organization: order.billingAddress.organization,
						address: order.billingAddress.address,
						ABN: order.billingAddress.ABN,
					}
				: null,
		},
	};
}
