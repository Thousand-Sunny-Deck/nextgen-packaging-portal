"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { revalidatePath } from "next/cache";

export type SaveFavouriteResponse =
	| { success: true }
	| { success: false; error: string };

export async function saveFavouriteAction(
	orderId: string,
	name: string,
): Promise<SaveFavouriteResponse> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return { success: false, error: "Unauthorized" };

	const userId = session.user.id;
	const trimmedName = name.trim().slice(0, 50);
	if (!trimmedName) return { success: false, error: "Name is required" };

	const order = await prisma.order.findFirst({
		where: { orderId, userId },
		select: { id: true },
	});

	if (!order) return { success: false, error: "Order not found" };

	await prisma.favouriteOrder.create({
		data: { userId, orderId: order.id, name: trimmedName },
	});

	revalidatePath(`/dashboard/${userId}/favourites`);
	return { success: true };
}
