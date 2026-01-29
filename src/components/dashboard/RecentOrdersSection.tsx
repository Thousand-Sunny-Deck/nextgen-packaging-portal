"use client";

import { RECENT_ORDERS } from "@/lib/mock-data/temp";
import RecentOrderCard, { OrderItem } from "./RecentOrderCard";
import { useReorder } from "@/hooks/use-reorder";

export interface RecentOrder {
	id: number;
	orderNumber: string;
	timeAgo: string;
	items: OrderItem[];
	price: string;
}

const RecentOrdersSection = () => {
	const recentOrders = RECENT_ORDERS;
	const { handleReorder, isReordering } = useReorder();

	return (
		<div className="bg-orange-50 rounded-xl p-4">
			{/* Section header */}
			<h2 className="text-lg font-bold mb-4">Recent</h2>

			{/* Order cards container - vertically stacked */}
			{recentOrders.length > 0 ? (
				<div className="space-y-4">
					{recentOrders.map((order) => (
						<RecentOrderCard
							key={order.id}
							orderNumber={order.orderNumber}
							items={order.items}
							price={order.price}
							timeAgo={order.timeAgo}
							onReorder={() => handleReorder(order.orderNumber)}
							isLoading={isReordering(order.orderNumber)}
						/>
					))}
				</div>
			) : (
				/* Empty state */
				<div className="border border-dashed border-neutral-300 bg-white rounded-lg p-12 text-center">
					<p className="text-neutral-600 font-medium">No recent orders</p>
					<p className="text-sm text-neutral-400 mt-2">
						Orders from the last 30 days will appear here
					</p>
				</div>
			)}
		</div>
	);
};

export default RecentOrdersSection;
