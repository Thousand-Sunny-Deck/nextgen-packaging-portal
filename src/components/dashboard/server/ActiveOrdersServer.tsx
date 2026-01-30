import { fetchActiveOrders } from "@/actions/order-delivery/fetch-orders-action";
import ActiveOrderCard from "../ActiveOrderCard";

const ActiveOrdersServer = async () => {
	const activeOrders = await fetchActiveOrders();

	return (
		<div className="bg-orange-50 rounded-xl p-4">
			<h2 className="text-lg font-bold mb-6">Active</h2>
			<div className="space-y-2">
				{activeOrders.length > 0 ? (
					activeOrders.map((order) => (
						<ActiveOrderCard
							key={order.orderId}
							orderId={order.orderId}
							price={order.price}
							status={order.status}
						/>
					))
				) : (
					<div className="py-8 text-center">
						<p className="text-neutral-600 font-medium">No active orders</p>
						<p className="text-sm text-neutral-400 mt-1">
							Your current orders will appear here
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ActiveOrdersServer;
