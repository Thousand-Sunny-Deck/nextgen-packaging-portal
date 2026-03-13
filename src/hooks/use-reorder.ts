"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/product-store";
import { reorderAction } from "@/actions/order-delivery/reorder-action";

export function useReorder() {
	const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(
		null,
	);
	const mergeCartFromOrder = useCartStore((state) => state.mergeCartFromOrder);
	const setCartSheetOpen = useCartStore((state) => state.setCartSheetOpen);

	const handleReorder = async (orderId: string) => {
		setReorderingOrderId(orderId);
		toast.success("Preparing your order!");

		try {
			const result = await reorderAction(orderId);

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			const { items, addedCount, skippedCount } = result.data;

			if (addedCount === 0) {
				toast.message("No items available to reorder.");
				return;
			}

			mergeCartFromOrder(items);
			setCartSheetOpen(true);

			if (skippedCount > 0) {
				toast.warning("Some items could not be added.");
			}
			toast.success("Order loaded into cart.");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setReorderingOrderId(null);
		}
	};

	const isReordering = (orderId: string) => reorderingOrderId === orderId;

	return { handleReorder, isReordering, reorderingOrderId };
}
