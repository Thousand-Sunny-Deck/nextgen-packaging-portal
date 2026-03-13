"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { env } from "@/lib/env-validation/env";

export type FavItem = {
	name: string;
	quantity: number;
	handle: string;
	imageUrl: string | null;
};

export type FavouriteOrderData = {
	id: string;
	name: string;
	createdAt: Date;
	items: FavItem[];
};

export type FetchFavouritesResponse =
	| { success: true; data: FavouriteOrderData[] }
	| { success: false; error: string };

export async function fetchFavouritesAction(): Promise<FetchFavouritesResponse> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return { success: false, error: "Unauthorized" };

	const userId = session.user.id;

	const favourites = await prisma.favouriteOrder.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		include: {
			order: {
				include: { items: true },
			},
		},
	});

	const allHandles = [
		...new Set(
			favourites.flatMap((fav) => fav.order.items.map((item) => item.handle)),
		),
	];

	const [products, entitlements] = await Promise.all([
		prisma.product.findMany({
			where: { handle: { in: allHandles } },
			select: { handle: true, imageUrl: true },
		}),
		prisma.userProductEntitlement.findMany({
			where: { userId, product: { handle: { in: allHandles } } },
			select: {
				customImageUrl: true,
				product: { select: { handle: true } },
			},
		}),
	]);

	const productImageByHandle = new Map(
		products.map((p) => [p.handle, p.imageUrl]),
	);
	const entitlementImageByHandle = new Map(
		entitlements.map((e) => [e.product.handle, e.customImageUrl]),
	);

	const cloudfrontUrl = env.CLOUDFRONT_URL ?? "";
	const resolveImageUrl = (handle: string): string | null => {
		const custom = entitlementImageByHandle.get(handle);
		const base = productImageByHandle.get(handle);
		const rawHandle = custom ?? base ?? null;
		return rawHandle && cloudfrontUrl ? `${cloudfrontUrl}/${rawHandle}` : null;
	};

	const data: FavouriteOrderData[] = favourites.map((fav) => ({
		id: fav.id,
		name: fav.name,
		createdAt: fav.createdAt,
		items: fav.order.items.map((item) => ({
			name: item.description,
			quantity: item.quantity,
			handle: item.handle,
			imageUrl: resolveImageUrl(item.handle),
		})),
	}));

	return { success: true, data };
}
