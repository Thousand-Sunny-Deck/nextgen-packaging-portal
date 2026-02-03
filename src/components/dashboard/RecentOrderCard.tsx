// RecentOrderCard.tsx
import React from "react";
import { Loader2 } from "lucide-react";
import { RecentOrderItem } from "@/actions/order-delivery/fetch-orders-action";
import { getDisplayOrderId } from "@/lib/utils";

interface RecentOrderCardProps {
	orderId: string;
	items: RecentOrderItem[];
	price: number;
	timeAgo: string;
	onReorder: () => void;
	isLoading?: boolean;
}

const RecentOrderCard = ({
	orderId,
	items,
	price,
	timeAgo,
	onReorder,
	isLoading = false,
}: RecentOrderCardProps) => {
	const displayOrderId = getDisplayOrderId(orderId, "recent");
	return (
		<div className="bg-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-slate-50">
			{/* Left side - Order info and items */}
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-3 mb-2">
					<h3 className="font-semibold text-md">#{displayOrderId}</h3>
					<span className="text-sm text-neutral-400">{timeAgo}</span>
				</div>

				{/* Items list */}
				<div className="space-y-0.5">
					{items.map((item, index) => (
						<p key={index} className="text-neutral-400 text-sm">
							{item.quantity} X {item.name}
						</p>
					))}
				</div>
			</div>

			{/* Right side - Price and re-order button */}
			<div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-shrink-0">
				<p className="font-bold text-md">AU ${price}</p>

				<button
					onClick={onReorder}
					disabled={isLoading}
					className="bg-black text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading...
						</>
					) : (
						"Re-order"
					)}
				</button>
			</div>
		</div>
	);
};

export default RecentOrderCard;
