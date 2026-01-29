"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/product-store";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";
import { reorderAction } from "@/actions/order-delivery/reorder-action";

export function useReorder() {
	const [reorderingOrderId, setReorderingOrderId] = useState<string | null>(
		null,
	);
	const populateCartFromOrder = useCartStore(
		(state) => state.populateCartFromOrder,
	);
	const setBillingInfo = useBillingInfoStore((state) => state.setBillingInfo);
	const router = useRouter();
	const pathname = usePathname();

	const handleReorder = async (orderId: string) => {
		setReorderingOrderId(orderId);
		toast.success("Preparing your order!");

		try {
			const result = await reorderAction(orderId);

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			const { items, billingInfo } = result.data;

			populateCartFromOrder(items);

			if (billingInfo) {
				setBillingInfo(billingInfo);
			}

			const orderRoute = pathname.replace("home", "order");
			router.push(orderRoute);

			toast.success("Order loaded! Review and proceed to checkout.");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setReorderingOrderId(null);
		}
	};

	const isReordering = (orderId: string) => reorderingOrderId === orderId;

	return { handleReorder, isReordering, reorderingOrderId };
}
