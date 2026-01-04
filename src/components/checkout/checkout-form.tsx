"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "./progress-bar";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import OrderSummary from "./order-summary";

const CheckoutForm = () => {
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
	return (
		<div className="w-[40%] border flex flex-col items-start">
			<ProgressBar steps={steps} currentStep={currentStep} />
			<OrderSummary cartSize={cart.length} totalCost={totalCartCost} />
			{/* Demo buttons */}
			<div className="flex gap-4 justify-center mt-8">
				<button
					onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
					className="px-4 py-2 bg-gray-200 rounded"
				>
					Previous
				</button>
				<button
					onClick={() =>
						setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
					}
					className="px-4 py-2 bg-black text-white rounded"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default CheckoutForm;
