"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "./progress-bar";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import OrderSummary from "./order-summary";
import { CheckoutState } from "../checkout-form";
import { Button } from "@/components/ui/button";

interface OrderInfoProps {
	setCheckoutState: (state: CheckoutState) => void;
	checkoutState: CheckoutState;
}

const OrderInfo = (props: OrderInfoProps) => {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [totalCartCost, setTotalCartCost] = useState<number>(0);
	const [isClient, setIsClient] = useState(false);

	const { getCart, getTotalCartCost } = useCartStore();

	useEffect(() => {
		setIsClient(true);
		setCart(getCart());
		setTotalCartCost(getTotalCartCost());
	}, [getCart, getTotalCartCost]);

	const currentStep = useMemo(() => {
		switch (props.checkoutState) {
			case "cart":
				return 0;
			case "billing":
				return 1;
			case "order":
			case "shipped":
				return 2;
			default:
				return 0;
		}
	}, [props.checkoutState]);

	if (!isClient) {
		return null; // or a loading skeleton
	}

	const steps = [
		{ label: "Review Order", completed: true },
		{ label: "Confirm details", completed: false },
		{ label: "Order Placement", completed: false },
	];

	const isCartState = props.checkoutState === "cart";
	const isBilling = props.checkoutState === "billing";
	const isOrderState =
		props.checkoutState === "order" || props.checkoutState === "shipped";

	return (
		<div className="w-[40%] border flex flex-col items-start">
			<ProgressBar steps={steps} currentStep={currentStep} />
			<OrderSummary cartSize={cart.length} totalCost={totalCartCost} />

			<div className="flex flex-col items-center justify-center w-full p-6 gap-2">
				{isCartState && (
					<Button
						size="default"
						className="w-[150px]"
						onClick={() => props.setCheckoutState("billing")}
					>
						Proceed next
					</Button>
				)}
				{isBilling && (
					<Button
						size="default"
						variant="secondary"
						className="w-[150px]"
						onClick={() => props.setCheckoutState("cart")}
					>
						Order summary
					</Button>
				)}
				{isOrderState && (
					<>
						<Button
							className="w-[150px]"
							disabled={props.checkoutState === "shipped"}
							onClick={() => props.setCheckoutState("shipped")}
						>
							Place Order
						</Button>
						<Button
							variant="link"
							className="w-[150px] font-light text-sm"
							disabled={props.checkoutState === "shipped"}
							onClick={() => props.setCheckoutState("billing")}
						>
							Edit Billing Info
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default OrderInfo;
