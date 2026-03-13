"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";

export type FavItem = {
	name: string;
	quantity: number;
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

	const data: FavouriteOrderData[] = favourites.map((fav) => ({
		id: fav.id,
		name: fav.name,
		createdAt: fav.createdAt,
		items: fav.order.items.map((item) => ({
			name: item.description,
			quantity: item.quantity,
		})),
	}));

	return { success: true, data };
}
