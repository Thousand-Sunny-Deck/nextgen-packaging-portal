import { env } from "@/lib/env-validation/env";
import { getCookieHeader } from "./common";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import {
	fetchActiveOrdersForUser,
	// fetchRecentOrdersForUser,
} from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";

export const fetchOrdersForUser = async () => {
	const cookies = await getCookieHeader();
	const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/orders`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: cookies,
		},
	});

	if (!response.ok) {
		const errorData = await response.json();
		return {
			ok: false,
			error: errorData.message || errorData.errors || "Failed to fetch orders",
			status: response.status,
		};
	}

	const body = await response.json();

	return {
		ok: true,
		data: body.data,
	};
};

export type ActiveOrder = {
	orderId: string;
	price: number;
	status: "Order Placed" | "Processing" | "Failed";
};

const mapOrderStatusToActiveOrder = (
	status: OrderStatus,
): ActiveOrder["status"] => {
	switch (status) {
		case "PENDING":
		case "PROCESSING":
		case "PDF_GENERATED":
		case "PDF_STORED":
			return "Processing";
		case "EMAIL_SENT":
			return "Order Placed";
		case "FAILED":
			return "Failed";
		default:
			return "Processing";
	}
};

export const fetchActiveOrders = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return [];
	}

	const userId = session.user.id;
	const activeOrdersForUser = await fetchActiveOrdersForUser(userId);

	const activeOrders = activeOrdersForUser.map((order): ActiveOrder => {
		return {
			orderId: order.orderId,
			price: order.totalOrderCost,
			status: mapOrderStatusToActiveOrder(order.status),
		};
	});

	return activeOrders;
};

// export const fetchRecentOrders = async () => {
// 	const session = await auth.api.getSession({
// 		headers: await headers(),
// 	});

// 	if (!session || !session.user) {
// 		return [];
// 	}

// 	const userId = session.user.id;
// 	const recentOrdersForUser = await fetchRecentOrdersForUser(userId);
// };
