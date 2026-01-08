"use client";

import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "./progress-bar";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import OrderSummary, { OrderSummaryInfo } from "./order-summary";
import { CheckoutState } from "../checkout-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { usePathname, useRouter } from "next/navigation";
import { preparePayloadAndFire } from "@/actions/order-delivery/deliver-order-action";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";

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

const getOrderSummaryInfo = (
	totalCost: number,
	cartSize: number,
): OrderSummaryInfo => {
	const subTotal = totalCost;
	const serviceCost = 10;
	let finalCost = 0;
	if (subTotal < 150) {
		finalCost = subTotal + serviceCost;
	} else {
		finalCost = subTotal;
	}

	return {
		subTotal,
		totalCost: finalCost,
		extraCost: {
			serviceFee: finalCost === subTotal ? 0 : serviceCost,
		},
		cartSize: cartSize,
	};
};

const OrderInfo = (props: OrderInfoProps) => {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [totalCartCost, setTotalCartCost] = useState<number>(0);
	const [isClient, setIsClient] = useState(false);
	const [hasOrderPlaced, setHasOrderPlaced] = useState(false);

	const { getCart, getTotalCartCost, clearCart } = useCartStore();
	const { getBillingInfo, clearBillingInfo } = useBillingInfoStore();
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

	const orderSummaryInfo = getOrderSummaryInfo(totalCartCost, cart.length);

	const steps = [
		{ label: "Review Order", completed: true },
		{ label: "Confirm details", completed: false },
		{ label: "Order Placement", completed: false },
	];

	const handlePlaceOrder = async () => {
		setHasOrderPlaced(true);
		props.setCheckoutState("shipped");

		try {
			const cartItems = getCart();
			const billingInfoArray = getBillingInfo();
			const billingInfo = billingInfoArray[0];

			if (!billingInfo) {
				toast.error("Billing information is missing");
				return;
			}

			// prepares the payload and sends it off to the backend for pdf generation
			preparePayloadAndFire(
				{
					items: cartItems,
					extraCartInfo: orderSummaryInfo,
				},
				billingInfo,
			);

			// delete data from localStorage
			clearCart();
			clearBillingInfo();

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
			<OrderSummary info={orderSummaryInfo} />

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
