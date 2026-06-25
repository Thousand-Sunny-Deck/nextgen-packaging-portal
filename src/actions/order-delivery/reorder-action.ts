"use server";

import { auth } from "@/lib/config/auth";
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { headers } from "next/headers";
import { CartItem } from "@/lib/store/product-store";
import { prisma } from "@/lib/config/prisma";
import { env } from "@/lib/env-validation/env";
import {
	normalizeUnit,
	resolveLinePrice,
	roundMoney,
} from "@/lib/pricing/resolve-line-price";

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

	if (order.status === "AWAITING_APPROVAL") {
		return {
			success: false,
			message:
				"This order is pending approval. If you need changes, contact support or wait for approval.",
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
				hasUnitOptions: true,
				sleevePrice: true,
				boxPrice: true,
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
				customSleevePrice: true,
				customBoxPrice: true,
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
		const unit = normalizeUnit(product, orderItem.unit);
		const baseDescription =
			entitlement?.customDescription ?? product.description;

		// Shared, server-authoritative pricing rule (sleeve/box, or custom price).
		const unitCost = resolveLinePrice(
			product,
			entitlement
				? {
						customUnitCost: entitlement.customUnitCost,
						customSleevePrice: entitlement.customSleevePrice,
						customBoxPrice: entitlement.customBoxPrice,
					}
				: null,
			unit,
		);
		const description = unit ? `${baseDescription} (${unit})` : baseDescription;
		const quantity = orderItem.quantity;
		const total = roundMoney(quantity * unitCost);

		items.push({
			handle: orderItem.handle,
			sku: entitlement?.customSku ?? product.sku,
			quantity,
			description,
			total,
			unitCost,
			imageUrl: toImageUrl(
				entitlement?.customImageUrl ?? product.imageUrl ?? undefined,
			),
			unit,
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
