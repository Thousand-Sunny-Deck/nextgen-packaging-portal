"use client";

import { useEffect, useState } from "react";
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
	const [currentStep, setCurrentStep] = useState(0);

	const { getCart, getTotalCartCost } = useCartStore();

	useEffect(() => {
		setIsClient(true);
		setCart(getCart());
		setTotalCartCost(getTotalCartCost());
	}, [getCart, getTotalCartCost]);

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
	const isOrderState = props.checkoutState === "order";

	return (
		<div className="w-[40%] border flex flex-col items-start">
			<ProgressBar steps={steps} currentStep={currentStep} />
			<OrderSummary
				cartSize={cart.length}
				totalCost={totalCartCost}
				showBillingInfo={isOrderState}
			/>

			<div className="flex flex-col items-center justify-center w-full p-6 gap-2">
				{isCartState && (
					<Button
						size="default"
						className="w-[150px]"
						onClick={() => {
							props.setCheckoutState("billing");
							setCurrentStep(1);
						}}
					>
						Proceed next
					</Button>
				)}
				{isBilling && (
					<>
						<Button
							size="default"
							className="w-[150px]"
							onClick={() => {
								props.setCheckoutState("order");
								setCurrentStep(2);
							}}
						>
							Proceed next
						</Button>
						<Button
							size="default"
							variant="secondary"
							className="w-[150px]"
							onClick={() => {
								props.setCheckoutState("cart");
								setCurrentStep(0);
							}}
						>
							Order summary
						</Button>
					</>
				)}
				{isOrderState && (
					<>
						<Button
							className="w-[150px]"
							onClick={() => props.setCheckoutState("shipped")}
						>
							Place Order
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default OrderInfo;
