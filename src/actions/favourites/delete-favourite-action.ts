"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { revalidatePath } from "next/cache";

export type DeleteFavouriteResponse =
	| { success: true }
	| { success: false; error: string };

export async function deleteFavouriteAction(
	favouriteId: string,
): Promise<DeleteFavouriteResponse> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) return { success: false, error: "Unauthorized" };

	const userId = session.user.id;

	const existing = await prisma.favouriteOrder.findFirst({
		where: { id: favouriteId, userId },
	});

	if (!existing) return { success: false, error: "Favourite not found" };

	await prisma.favouriteOrder.delete({ where: { id: favouriteId } });

	revalidatePath(`/dashboard/${userId}/favourites`);
	return { success: true };
}
