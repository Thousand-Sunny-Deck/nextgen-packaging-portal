"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import {
	reorderAction,
	ReorderResponse,
} from "@/actions/order-delivery/reorder-action";

export type AddFavouriteToCartResponse = ReorderResponse;

export async function addFavouriteToCartAction(
	favouriteId: string,
): Promise<AddFavouriteToCartResponse> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return { success: false, message: "Unauthorized" };

	const userId = session.user.id;

	const favourite = await prisma.favouriteOrder.findFirst({
		where: { id: favouriteId, userId },
		select: { order: { select: { orderId: true } } },
	});

	if (!favourite) return { success: false, message: "Favourite not found" };

	return reorderAction(favourite.order.orderId);
}
