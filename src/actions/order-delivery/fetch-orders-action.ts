import { env } from "@/lib/env-validation/env";
import { getCookieHeader } from "./common";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import {
	fetchActiveOrdersForUser,
	fetchRecentOrdersForUser,
} from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";
import { OrderItem } from "@/generated/prisma/client";

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

export const fetchActiveOrders = async (): Promise<ActiveOrder[]> => {
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
export interface RecentOrder {
	orderId: string;
	timeAgo: string;
	items: RecentOrderItem[];
	price: number;
	invoiceId: string;
}

export interface RecentOrderItem {
	name: string;
	quantity: number;
}

export const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session || !session.user) {
		return [];
	}

	const userId = session.user.id;
	const recentOrdersForUser = await fetchRecentOrdersForUser(userId);

	const recentOrder = recentOrdersForUser.map((order): RecentOrder => {
		return {
			invoiceId: order.invoiceId,
			orderId: order.orderId,
			timeAgo: calculateTimeAgo(order.updatedAt),
			price: order.totalOrderCost,
			items: constructRecentOrderItems(order.items),
		};
	});

	return recentOrder;
};

const calculateTimeAgo = (timestamp: Date): string => {
	const now = new Date();
	const diffMs = now.getTime() - timestamp.getTime();

	const dayMs = 1000 * 60 * 60 * 24;
	const days = Math.floor(diffMs / dayMs);

	if (days < 30) {
		if (days === 0) return "1d";
		return `${days}d`;
	}

	const months = Math.floor(days / 30);
	if (months < 12) {
		return `${months}m`;
	}

	const years = Math.floor(months / 12);
	return `${years}y`;
};

const constructRecentOrderItems = (items: OrderItem[]): RecentOrderItem[] => {
	const lastThreeOrders = items.slice(0, 3);
	return lastThreeOrders.map((item) => {
		return {
			name: item.description,
			quantity: item.quantity,
		};
	});
};
