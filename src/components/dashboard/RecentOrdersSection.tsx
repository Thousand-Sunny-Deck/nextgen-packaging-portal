"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RecentOrder } from "@/actions/order-delivery/fetch-orders-action";
import { saveFavouriteAction } from "@/actions/favourites/save-favourite-action";
import RecentOrderCard from "./RecentOrderCard";
import { useReorder } from "@/hooks/use-reorder";
import { FavouriteNameModal } from "@/components/favourites/FavouriteNameModal";

interface RecentOrderSectionProps {
	recentOrders: RecentOrder[];
}

const RecentOrdersSection = (props: RecentOrderSectionProps) => {
	const { handleReorder, isReordering } = useReorder();
	const [favouriteTargetOrderId, setFavouriteTargetOrderId] = useState<
		string | null
	>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [savedOrderIds, setSavedOrderIds] = useState<Set<string>>(new Set());

	const handleFavourite = (orderId: string) => {
		setFavouriteTargetOrderId(orderId);
	};

	const handleSaveFavourite = async (name: string) => {
		if (!favouriteTargetOrderId) return;
		setIsSaving(true);
		try {
			const result = await saveFavouriteAction(favouriteTargetOrderId, name);
			if (result.success) {
				toast.success("Saved to favourites!");
				setSavedOrderIds((prev) => new Set(prev).add(favouriteTargetOrderId));
				setFavouriteTargetOrderId(null);
			} else {
				toast.error(result.error ?? "Failed to save favourite.");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="bg-orange-50 rounded-xl p-4">
			{/* Section header */}
			<h2 className="text-lg font-bold mb-4">Recent</h2>

			{/* Order cards container - vertically stacked */}
			{props.recentOrders.length > 0 ? (
				<div className="space-y-4">
					{props.recentOrders.map((order) => (
						<RecentOrderCard
							key={order.orderId}
							orderId={order.orderId}
							invoiceId={order.invoiceId}
							items={order.items}
							price={order.price}
							timeAgo={order.timeAgo}
							onReorder={() => handleReorder(order.orderId)}
							isLoading={isReordering(order.orderId)}
							isFavourited={
								order.isFavourited || savedOrderIds.has(order.orderId)
							}
							isFavouriting={
								favouriteTargetOrderId === order.orderId && isSaving
							}
							onFavourite={() => handleFavourite(order.orderId)}
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

			<FavouriteNameModal
				open={favouriteTargetOrderId !== null}
				onOpenChange={(open) => {
					if (!open) setFavouriteTargetOrderId(null);
				}}
				onSave={handleSaveFavourite}
				isSaving={isSaving}
			/>
		</div>
	);
};

export default RecentOrdersSection;
