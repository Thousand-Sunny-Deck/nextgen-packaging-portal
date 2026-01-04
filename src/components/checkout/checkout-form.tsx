"use client";

import { useState } from "react";
import CartSummary from "./cart/cart-summary";
import OrderInfo from "./order/order-info";

export type CheckoutState = "cart" | "billing" | "order" | "shipped";

const CheckoutForm = () => {
	const [checkoutState, setCheckoutState] = useState<CheckoutState>("cart");

	const updateCheckoutState = (state: CheckoutState) => {
		switch (state) {
			case "cart":
				setCheckoutState("cart");
				break;
			case "billing":
				setCheckoutState("billing");
				break;
			case "order":
				setCheckoutState("order");
				break;
			case "shipped":
				setCheckoutState("shipped");
				break;
			default:
				// optionally handle an unknown state
				break;
		}
	};

	const isReviewOrderState = checkoutState === "cart";
	// const isConfirmDetailsState = checkoutState === "confirm-details";
	const isOrderState = checkoutState === "order";

	return (
		<div className="w-full mt-10 flex justify-between gap-6">
			{/* Current Cart info*/}
			{(isReviewOrderState || isOrderState) && <CartSummary />}

			{/* Summary Info and checkout */}
			<OrderInfo
				setCheckoutState={updateCheckoutState}
				checkoutState={checkoutState}
			/>
		</div>
	);
};

export default CheckoutForm;
