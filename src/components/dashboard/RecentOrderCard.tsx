// RecentOrderCard.tsx
import React from "react";

export interface OrderItem {
	name: string;
	quantity: number;
}
interface RecentOrderCardProps {
	orderNumber: string;
	items: OrderItem[];
	price: string;
	timeAgo: string;
	onReorder: () => void;
}

const RecentOrderCard = ({
	orderNumber,
	items,
	price,
	timeAgo,
	onReorder,
}: RecentOrderCardProps) => {
	const initialItemsToShow = 3;
	const displayedItems = items.slice(0, initialItemsToShow);

	return (
		<div className="bg-white rounded-lg p-4 flex items-center justify-between gap-6">
			{/* Left side - Order info and items */}
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-3 mb-2">
					<h3 className="font-semibold text-md">Order #{orderNumber}</h3>
					<span className="text-sm text-neutral-400">{timeAgo}</span>
				</div>

				{/* Items list */}
				<div className="space-y-0.5">
					{displayedItems.map((item, index) => (
						<p key={index} className="text-neutral-400 text-sm">
							{item.quantity} X {item.name}
						</p>
					))}
				</div>
			</div>

			{/* Right side - Price and re-order button */}
			<div className="flex items-center gap-6 flex-shrink-0">
				<p className="font-bold text-md">{price}</p>

				<button
					onClick={onReorder}
					className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap"
				>
					Re-order
				</button>
			</div>
		</div>
	);
};

export default RecentOrderCard;
