"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

export type CancelOrderResult =
	| { success: true }
	| { success: false; error: string };

export async function cancelOrderAction(
	orderId: string,
): Promise<CancelOrderResult> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return { success: false, error: "Unauthorized" };
	}

	const order = await prisma.order.findFirst({
		where: { orderId, userId: session.user.id },
		select: { id: true, status: true },
	});

	if (!order) {
		return { success: false, error: "Order not found." };
	}

	if (order.status !== OrderStatus.AWAITING_APPROVAL) {
		return {
			success: false,
			error:
				"This order has already been approved and can no longer be cancelled.",
		};
	}

	await prisma.order.update({
		where: { id: order.id },
		data: {
			status: OrderStatus.CANCELLED,
			cancelledAt: new Date(),
			updatedAt: new Date(),
		},
	});

	return { success: true };
}
