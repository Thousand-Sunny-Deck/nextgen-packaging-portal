// ActiveOrderCard.jsx
const ActiveOrderCard = ({
	orderNumber,
	price,
	status,
}: {
	orderNumber: string;
	price: string;
	status: "Order Placed" | "Processing";
}) => {
	// Status configuration - colors and labels
	const statusConfig = {
		"Order Placed": {
			color: "bg-red-500",
			label: "Order Placed",
		},
		Processing: {
			color: "bg-orange-400",
			label: "Processing",
		},
		// Add more statuses as needed
	};

	const currentStatus = statusConfig[status] || statusConfig["Processing"];

	return (
		<div className="bg-white rounded-lg p-2 flex items-center justify-between hover:bg-slate-50">
			{/* Left side - Order number and price stacked */}
			<div className="flex flex-col gap-1">
				<h3 className="font-bold text-md">Order #{orderNumber}</h3>
				<p className="text-neutral-600">{price}</p>
			</div>

			{/* Right side - Status badge */}
			<div className="flex items-center gap-2">
				<span className={`w-2 h-2 rounded-full ${currentStatus.color}`}></span>
				<span className="font-medium text-sm">{currentStatus.label}</span>
			</div>
		</div>
	);
};

export default ActiveOrderCard;
