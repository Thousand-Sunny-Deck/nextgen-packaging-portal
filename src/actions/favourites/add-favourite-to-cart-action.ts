"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { CartItem } from "@/lib/store/product-store";
import { env } from "@/lib/env-validation/env";

const toImageUrl = (imageUrl: string | null | undefined) => {
	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";
	return imageUrl && cloudfrontUrl ? `${cloudfrontUrl}/${imageUrl}` : null;
};

export type AddFavouriteToCartResponse =
	| { success: true; data: { items: CartItem[] } }
	| { success: false; error: string };

export async function addFavouriteToCartAction(
	favouriteId: string,
): Promise<AddFavouriteToCartResponse> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return { success: false, error: "Unauthorized" };

	const userId = session.user.id;

	const favourite = await prisma.favouriteOrder.findFirst({
		where: { id: favouriteId, userId },
		include: {
			order: {
				include: { items: true },
			},
		},
	});

	if (!favourite) return { success: false, error: "Favourite not found" };

	const handles = favourite.order.items.map((item) => item.handle);

	// Fetch current prices for exactly these handles — entitled overrides first
	const [entitlements, baseProducts] = await Promise.all([
		prisma.userProductEntitlement.findMany({
			where: { userId, product: { handle: { in: handles } } },
			select: {
				customSku: true,
				customDescription: true,
				customUnitCost: true,
				customImageUrl: true,
				product: {
					select: {
						handle: true,
						sku: true,
						description: true,
						unitCost: true,
						imageUrl: true,
					},
				},
			},
		}),
		prisma.product.findMany({
			where: { handle: { in: handles } },
			select: {
				handle: true,
				sku: true,
				description: true,
				unitCost: true,
				imageUrl: true,
			},
		}),
	]);

	// Build price map — entitled values take precedence over base product
	const baseMap = new Map(baseProducts.map((p) => [p.handle, p]));
	const priceMap = new Map(
		handles.map((handle) => {
			const entitlement = entitlements.find((e) => e.product.handle === handle);
			const base = baseMap.get(handle);
			if (entitlement) {
				return [
					handle,
					{
						sku: entitlement.customSku ?? entitlement.product.sku,
						description:
							entitlement.customDescription ?? entitlement.product.description,
						unitCost:
							entitlement.customUnitCost ?? entitlement.product.unitCost,
						imageUrl: toImageUrl(
							entitlement.customImageUrl ?? entitlement.product.imageUrl,
						),
					},
				];
			}
			if (base) {
				return [
					handle,
					{
						sku: base.sku,
						description: base.description,
						unitCost: base.unitCost,
						imageUrl: toImageUrl(base.imageUrl),
					},
				];
			}
			return [handle, null];
		}),
	);

	const items: CartItem[] = favourite.order.items.map((item) => {
		const current = priceMap.get(item.handle);
		const unitCost = current?.unitCost ?? item.unitCost;
		return {
			handle: item.handle,
			sku: current?.sku ?? item.sku,
			quantity: item.quantity,
			description: current?.description ?? item.description,
			unitCost,
			total: Math.round(item.quantity * unitCost * 100) / 100,
		};
	});

	return { success: true, data: { items } };
}
