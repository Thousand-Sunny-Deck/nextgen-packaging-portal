"use server";

import { auth } from "@/lib/config/auth";
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { headers } from "next/headers";
import { CartItem } from "@/lib/store/product-store";
import { prisma } from "@/lib/config/prisma";
import { env } from "@/lib/env-validation/env";

export type ReorderResponse =
	| {
			success: true;
			data: {
				items: CartItem[];
				addedCount: number;
				skippedCount: number;
				requestedCount: number;
			};
	  }
	| {
			success: false;
			message: string;
	  };

const toImageUrl = (imageUrl: string | null | undefined) => {
	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";
	return imageUrl && cloudfrontUrl ? `${cloudfrontUrl}/${imageUrl}` : null;
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

	const requestedCount = order.items.length;

	if (requestedCount === 0) {
		return {
			success: true,
			data: {
				items: [],
				addedCount: 0,
				skippedCount: 0,
				requestedCount: 0,
			},
		};
	}

	const handles = Array.from(new Set(order.items.map((item) => item.handle)));

	const [products, entitlements] = await prisma.$transaction([
		prisma.product.findMany({
			where: {
				handle: {
					in: handles,
				},
			},
			select: {
				handle: true,
				sku: true,
				description: true,
				unitCost: true,
				imageUrl: true,
			},
		}),
		prisma.userProductEntitlement.findMany({
			where: {
				userId,
				product: {
					handle: {
						in: handles,
					},
				},
			},
			select: {
				customSku: true,
				customDescription: true,
				customUnitCost: true,
				customImageUrl: true,
				product: {
					select: {
						handle: true,
					},
				},
			},
		}),
	]);

	const productByHandle = new Map(
		products.map((product) => [product.handle, product]),
	);
	const entitlementByHandle = new Map(
		entitlements.map((entitlement) => [
			entitlement.product.handle,
			entitlement,
		]),
	);

	const items: CartItem[] = [];
	let skippedCount = 0;

	for (const orderItem of order.items) {
		const product = productByHandle.get(orderItem.handle);
		if (!product) {
			skippedCount += 1;
			continue;
		}

		const entitlement = entitlementByHandle.get(orderItem.handle);
		const unitCost = Number(entitlement?.customUnitCost ?? product.unitCost);
		const quantity = orderItem.quantity;
		const total = Math.round(quantity * unitCost * 100) / 100;

		items.push({
			handle: orderItem.handle,
			sku: entitlement?.customSku ?? product.sku,
			quantity,
			description: entitlement?.customDescription ?? product.description,
			total,
			unitCost,
			imageUrl: toImageUrl(
				entitlement?.customImageUrl ?? product.imageUrl ?? undefined,
			),
		});
	}

	return {
		success: true,
		data: {
			items,
			addedCount: items.length,
			skippedCount,
			requestedCount,
		},
	};
}
