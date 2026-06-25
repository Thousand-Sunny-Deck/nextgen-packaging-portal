// RecentOrderCard.tsx
import React from "react";
import { Loader2, Heart, CalendarDays } from "lucide-react";
import { RecentOrderItem } from "@/actions/order-delivery/fetch-orders-action";
import { getDisplayOrderId } from "@/lib/utils";
import { formatDeliveryDate } from "@/lib/schemas/delivery";

interface RecentOrderCardProps {
	orderId: string;
	invoiceId: string;
	items: RecentOrderItem[];
	price: number;
	timeAgo: string;
	onReorder: () => void;
	isLoading?: boolean;
	isFavourited?: boolean;
	isFavouriting?: boolean;
	onFavourite?: () => void;
	deliveryDate?: string | null;
	notes?: string | null;
}

const RecentOrderCard = ({
	items,
	price,
	timeAgo,
	onReorder,
	invoiceId,
	isLoading = false,
	isFavourited = false,
	isFavouriting = false,
	onFavourite,
	deliveryDate = null,
	notes = null,
}: RecentOrderCardProps) => {
	const displayInvoiceId = getDisplayOrderId(invoiceId, "recent");
	return (
		<div className="bg-white rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-slate-50">
			{/* Left side - Order info and items */}
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-3 mb-2">
					<h3 className="font-semibold text-md">#{displayInvoiceId}</h3>
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

				{/* Requested delivery + note */}
				{deliveryDate && (
					<p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
						<CalendarDays className="h-3.5 w-3.5" />
						Delivery: {formatDeliveryDate(deliveryDate)}
					</p>
				)}
				{notes && (
					<p className="mt-1 text-xs italic text-neutral-400 line-clamp-2">
						“{notes}”
					</p>
				)}
			</div>

			{/* Right side - Price, heart, and re-order button */}
			<div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0">
				<p className="font-bold text-md">AU ${price.toFixed(2)}</p>

				<button
					onClick={onFavourite}
					disabled={isFavourited || isFavouriting}
					aria-label={isFavourited ? "Already saved" : "Save as favourite"}
					className="p-2 rounded-lg hover:bg-neutral-100 transition-colors disabled:cursor-not-allowed"
				>
					{isFavouriting ? (
						<Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
					) : (
						<Heart
							className={`h-4 w-4 ${isFavourited ? "fill-red-400 text-red-400" : "text-neutral-400 hover:text-red-400"}`}
						/>
					)}
				</button>

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
