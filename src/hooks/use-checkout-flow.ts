"use client";

import { useState, useEffect, useCallback } from "react";
import { useCartStore, CartItem } from "@/lib/store/product-store";
import {
	useBillingInfoStore,
	BillingInfoItem,
} from "@/lib/store/billing-info-store";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { usePathname, useRouter } from "next/navigation";
import { preparePayloadAndFire } from "@/actions/order-delivery/deliver-order-action";
import { saveFavouriteAction } from "@/actions/favourites/save-favourite-action";
import { features } from "@/config/features";

export type CheckoutState = "cart" | "billing" | "order" | "shipped";

export interface ProgressStep {
	label: string;
	completed: boolean;
}

export interface OrderSummaryInfo {
	subTotal: number;
	totalCost: number;
	extraCost: Record<string, number>;
	cartSize: number;
}

interface UseCheckoutFlowReturn {
	// State
	currentStep: CheckoutState;
	isHydrated: boolean;
	isLoading: boolean;
	showApprovalConfirmationModal: boolean;

	// Cart data (from store)
	cart: CartItem[];
	cartSize: number;
	totalCost: number;
	orderSummary: OrderSummaryInfo;

	// Billing data (from store)
	billingInfo: BillingInfoItem | null;
	hasBillingInfo: boolean;

	// Computed
	isCartEmpty: boolean;
	canProceedToBilling: boolean;
	canPlaceOrder: boolean;

	// Actions
	goToCart: () => void;
	goToBilling: () => void;
	goToOrder: () => void;
	placeOrder: () => Promise<void>;
	confirmApprovalAndFireOrder: () => Promise<void>;
	dismissApprovalConfirmationModal: () => void;

	// Progress
	progressSteps: ProgressStep[];
	currentStepIndex: number;
}

const getDashboardBasePath = (path: string) => {
	const segments = path.split("/").filter(Boolean);
	if (segments.length >= 2 && segments[0] === "dashboard") {
		return `/dashboard/${segments[1]}`;
	}
	return "/";
};

const calculateOrderSummary = (
	totalCost: number,
	cartSize: number,
): OrderSummaryInfo => {
	const subTotal = totalCost;
	const serviceFee = subTotal < 150 ? 10 : 0;
	const adjustedSubTotal = subTotal + serviceFee;
	const tax = Math.round(adjustedSubTotal * 0.1 * 100) / 100;
	const finalCost = adjustedSubTotal + tax;

	return {
		subTotal,
		totalCost: finalCost,
		extraCost: {
			serviceFee,
			tax,
		},
		cartSize: cartSize,
	};
};

export const useCheckoutFlow = (): UseCheckoutFlowReturn => {
	const [currentStep, setCurrentStep] = useState<CheckoutState>("cart");
	const [isHydrated, setIsHydrated] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showApprovalConfirmationModal, setShowApprovalConfirmationModal] =
		useState(false);

	const pathname = usePathname();
	const router = useRouter();

	// Store subscriptions
	const {
		cart,
		cartSize,
		totalCost,
		getCart,
		clearCart,
		pendingFavouriteName,
	} = useCartStore();
	const { billingInfo, hasBillingInfo, clearBillingInfo } =
		useBillingInfoStore();

	// Hydration handling
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// Computed values
	const isCartEmpty = cart.length === 0;
	const canProceedToBilling = !isCartEmpty;
	const canPlaceOrder = !isCartEmpty && hasBillingInfo();

	// Order summary calculation
	const orderSummary = calculateOrderSummary(totalCost, cartSize);

	// Progress steps
	const currentStepIndex =
		currentStep === "cart"
			? 0
			: currentStep === "billing"
				? 1
				: currentStep === "order" || currentStep === "shipped"
					? 2
					: 0;

	const progressSteps: ProgressStep[] = [
		{ label: "Review Order", completed: currentStepIndex > 0 },
		{ label: "Confirm details", completed: currentStepIndex > 1 },
		{ label: "Order Placement", completed: currentStepIndex > 2 },
	];

	// Navigation actions with validation
	const goToCart = useCallback(() => {
		setCurrentStep("cart");
	}, []);

	const goToBilling = useCallback(() => {
		if (!canProceedToBilling) {
			toast.error("Cart is empty. Add items before proceeding.");
			return;
		}
		setCurrentStep("billing");
	}, [canProceedToBilling]);

	const goToOrder = useCallback(() => {
		if (!hasBillingInfo()) {
			toast.error("Please complete billing information first.");
			return;
		}
		setCurrentStep("order");
	}, [hasBillingInfo]);

	// Internal: actual API firing logic, shared between both paths
	const fireOrder = useCallback(async () => {
		setIsLoading(true);
		setCurrentStep("shipped");

		try {
			const cartItems = getCart();
			const currentBillingInfo = billingInfo;

			if (!currentBillingInfo) {
				toast.error("Billing information is missing");
				setIsLoading(false);
				return;
			}

			const response = await preparePayloadAndFire(
				{
					items: cartItems,
					extraCartInfo: orderSummary,
				},
				currentBillingInfo,
			);

			if (!response.ok || response.error) {
				setIsLoading(false);
				throw new Error(`Something went wrong. ${response.error}`);
			}

			// Save favourite before clearing cart (name lives in cart store)
			if (pendingFavouriteName && response.orderId) {
				saveFavouriteAction(response.orderId, pendingFavouriteName).catch(
					(err) => console.error("Failed to save favourite:", err),
				);
			}

			// Clear stores (also clears pendingFavouriteName)
			clearCart();
			clearBillingInfo();

			if (response.pendingApproval) {
				toast.success("Your order has been submitted for review.");
			} else {
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
			}

			// Redirect to dashboard home
			const baseDashboardPath = getDashboardBasePath(pathname);
			router.push(`${baseDashboardPath}/home`);
		} catch {
			toast.error("Something went wrong. Please contact us.");
			setIsLoading(false);
		}
	}, [
		getCart,
		billingInfo,
		orderSummary,
		pendingFavouriteName,
		clearCart,
		clearBillingInfo,
		pathname,
		router,
	]);

	// Public: called by "Place Order" button
	const placeOrder = useCallback(async () => {
		if (!canPlaceOrder) {
			toast.error("Cannot place order. Missing cart items or billing info.");
			return;
		}

		if (features.adminApprovalRequired) {
			setShowApprovalConfirmationModal(true);
			return;
		}

		await fireOrder();
	}, [canPlaceOrder, fireOrder]);

	// Public: called by modal "Submit for Review" button
	const confirmApprovalAndFireOrder = useCallback(async () => {
		setShowApprovalConfirmationModal(false);
		await fireOrder();
	}, [fireOrder]);

	const dismissApprovalConfirmationModal = useCallback(() => {
		setShowApprovalConfirmationModal(false);
	}, []);

	return {
		// State
		currentStep,
		isHydrated,
		isLoading,
		showApprovalConfirmationModal,

		// Cart data
		cart,
		cartSize,
		totalCost,
		orderSummary,

		// Billing data
		billingInfo,
		hasBillingInfo: hasBillingInfo(),

		// Computed
		isCartEmpty,
		canProceedToBilling,
		canPlaceOrder,

		// Actions
		goToCart,
		goToBilling,
		goToOrder,
		placeOrder,
		confirmApprovalAndFireOrder,
		dismissApprovalConfirmationModal,

		// Progress
		progressSteps,
		currentStepIndex,
	};
};
