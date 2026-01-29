import { ActiveOrder } from "@/actions/order-delivery/fetch-orders-action";
import { getDisplayOrderId } from "@/lib/utils";

const ActiveOrderCard = ({ orderId, price, status }: ActiveOrder) => {
	const displayId = getDisplayOrderId(orderId);

	const statusConfig = {
		"Order Placed": {
			color: "bg-green-500",
		},
		Processing: {
			color: "bg-orange-400",
		},
		Failed: {
			color: "bg-red-500",
		},
	};

	return (
		<div className="bg-white rounded-lg p-2 flex items-center justify-between hover:bg-slate-50">
			{/* Left side - Order number and price stacked */}
			<div className="flex flex-col gap-1">
				<h3 className="font-bold text-md">Order #{displayId}</h3>
				<p className="text-neutral-600">{`AU $${price}`}</p>
			</div>

			{/* Right side - Status badge */}
			<div className="flex items-center gap-2">
				<span
					className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}
				></span>
				<span className="font-medium text-sm">{status}</span>
			</div>
		</div>
	);
};

export default ActiveOrderCard;
