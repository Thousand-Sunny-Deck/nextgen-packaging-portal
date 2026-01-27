"use client";

import RecentOrderCard, { OrderItem } from "./RecentOrderCard";

export interface RecentOrder {
	id: number;
	orderNumber: string;
	timeAgo: string;
	items: OrderItem[];
	price: string;
}

const RecentOrdersSection = () => {
	const recentOrders: RecentOrder[] = [
		{
			id: 1,
			orderNumber: "123",
			timeAgo: "2d",
			items: [
				{ name: "Clear PLA Unbranded Cups", quantity: 2 },
				{ name: "Clear PLA Unbranded Cups", quantity: 3 },
			],
			price: "AU$0.01",
		},
		{
			id: 2,
			orderNumber: "123",
			timeAgo: "2d",
			items: [
				{ name: "Clear PLA Unbranded Cups", quantity: 2 },
				{ name: "Clear PLA Unbranded Cups", quantity: 3 },
			],
			price: "AU$0.01",
		},
		{
			id: 3,
			orderNumber: "123",
			timeAgo: "2d",
			items: [
				{ name: "Clear PLA Unbranded Cups", quantity: 2 },
				{ name: "Clear PLA Unbranded Cups", quantity: 3 },
			],
			price: "AU$0.01",
		},
	];

	const onReorder = (id: number) => {
		console.log(recentOrders.at(id));
	};

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
							onReorder={() => onReorder(order.id)}
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
