"use server";

import { requireSuperAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { OrderStatus } from "@/generated/prisma/enums";
import { inngest } from "@/inngest/client";

export type ApproveOrderResult =
	| { success: true }
	| { success: false; error: string };

export async function approveOrderAction(
	orderId: string,
): Promise<ApproveOrderResult> {
	const admin = await requireSuperAdmin();

	const order = await prisma.order.findUnique({
		where: { orderId },
		select: {
			id: true,
			orderId: true,
			userId: true,
			customerEmail: true,
			status: true,
		},
	});

	if (!order) {
		return { success: false, error: "Order not found." };
	}

	if (order.status !== OrderStatus.AWAITING_APPROVAL) {
		return { success: false, error: "Order is not awaiting approval." };
	}

	await prisma.order.update({
		where: { orderId },
		data: {
			status: OrderStatus.PENDING,
			approvedAt: new Date(),
			approvedBy: admin.userId,
			updatedAt: new Date(),
		},
	});

	await inngest.send({
		name: "invoice/generate",
		data: {
			orderId: order.orderId,
			userId: order.userId,
			email: order.customerEmail,
		},
	});

	return { success: true };
}
