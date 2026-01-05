"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "./progress-bar";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import OrderSummary from "./order-summary";
import { CheckoutState } from "../checkout-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { usePathname, useRouter } from "next/navigation";

interface OrderInfoProps {
	setCheckoutState: (state: CheckoutState) => void;
	checkoutState: CheckoutState;
}

const getDashboardBasePath = (path: string) => {
	const segments = path.split("/").filter(Boolean);
	if (segments.length >= 2 && segments[0] === "dashboard") {
		return `/dashboard/${segments[1]}`;
	}
	return "/";
};

const OrderInfo = (props: OrderInfoProps) => {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [totalCartCost, setTotalCartCost] = useState<number>(0);
	const [isClient, setIsClient] = useState(false);
	const [hasOrderPlaced, setHasOrderPlaced] = useState(false);

	const { getCart, getTotalCartCost } = useCartStore();
	const pathname = usePathname();
	const router = useRouter();

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

	const handlePlaceOrder = async () => {
		setHasOrderPlaced(true);
		props.setCheckoutState("shipped");

		try {
			// TODO: call await prepareAndFire();

			toast.success("Your order has been placed successfully.");
			confetti({
				particleCount: 200,
				spread: 70,
				origin: { x: 0, y: 0.6 },
			});
			confetti({
				particleCount: 200,
				spread: 70,
				origin: { x: 1, y: 0.6 },
			});

			const baseDashboardPath = getDashboardBasePath(pathname);
			router.push(`${baseDashboardPath}/home`);
			return;

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e: unknown) {
			toast.error("Something went wrong. Please contact us.");
		}
	};

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
						{/**TODO: onclick handler here that will place the order, server action. Also, clear all localstorage once placed order
						 */}
						<Button
							className="w-[150px]"
							disabled={hasOrderPlaced}
							onClick={handlePlaceOrder}
						>
							Place Order
						</Button>
						<Button
							variant="link"
							className="w-[150px] font-light text-sm"
							disabled={hasOrderPlaced}
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
