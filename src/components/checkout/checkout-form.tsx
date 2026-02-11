"use client";

import CartSummary from "./cart/cart-summary";
import OrderInfo from "./order/order-info";
import BillingAddressSelector from "./billing/billing-address-selector";
import EmptyCartState from "./empty-cart-state";
import { useCheckoutFlow } from "@/hooks/use-checkout-flow";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
	userMetadata: {
		email: string;
	};
}

const CheckoutForm = ({ userMetadata }: CheckoutFormProps) => {
	const {
		currentStep,
		isHydrated,
		isLoading,
		cart,
		orderSummary,
		billingInfo,
		isCartEmpty,
		canProceedToBilling,
		canPlaceOrder,
		goToCart,
		goToBilling,
		goToOrder,
		placeOrder,
		progressSteps,
		currentStepIndex,
	} = useCheckoutFlow();

	// Wait for hydration before rendering
	if (!isHydrated) {
		return null;
	}

	// Show empty cart state if cart is empty
	if (isCartEmpty) {
		return <EmptyCartState />;
	}

	const isReviewOrderState = currentStep === "cart";
	const isBillingState = currentStep === "billing";
	const isOrderState = currentStep === "order" || currentStep === "shipped";
	const isPlacingOrder = currentStep === "shipped" || isLoading;
	const mobilePrimaryLabel = isReviewOrderState
		? "Continue to Billing"
		: isBillingState
			? "Continue to Order"
			: isPlacingOrder
				? "Placing order..."
				: "Place Order";
	const mobilePrimaryDisabled = isReviewOrderState
		? !canProceedToBilling
		: isBillingState
			? !canPlaceOrder
			: isPlacingOrder || !canPlaceOrder;
	const mobileSecondaryLabel = isBillingState
		? "Back to Cart"
		: isOrderState
			? "Edit Billing"
			: null;
	const mobilePrimaryAction = isReviewOrderState
		? goToBilling
		: isBillingState
			? goToOrder
			: placeOrder;
	const mobileSecondaryAction = isBillingState
		? goToCart
		: isOrderState
			? goToBilling
			: null;

	return (
		<div className="w-full mt-10">
			<div className="hidden md:flex justify-between gap-4 md:gap-6 lg:gap-8">
				{(isReviewOrderState || isOrderState) && <CartSummary cart={cart} />}
				{isBillingState && (
					<BillingAddressSelector
						email={userMetadata.email}
						onBillingComplete={goToOrder}
					/>
				)}
				<OrderInfo
					currentStep={currentStep}
					currentStepIndex={currentStepIndex}
					progressSteps={progressSteps}
					orderSummary={orderSummary}
					billingInfo={billingInfo}
					isLoading={isLoading}
					canProceedToBilling={canProceedToBilling}
					canPlaceOrder={canPlaceOrder}
					onGoToBilling={goToBilling}
					onGoToCart={goToCart}
					onPlaceOrder={placeOrder}
				/>
			</div>

			<div className="md:hidden pb-28 flex flex-col gap-4">
				<OrderInfo
					currentStep={currentStep}
					currentStepIndex={currentStepIndex}
					progressSteps={progressSteps}
					orderSummary={orderSummary}
					billingInfo={billingInfo}
					isLoading={isLoading}
					canProceedToBilling={canProceedToBilling}
					canPlaceOrder={canPlaceOrder}
					onGoToBilling={goToBilling}
					onGoToCart={goToCart}
					onPlaceOrder={placeOrder}
				/>
				{(isReviewOrderState || isOrderState) && <CartSummary cart={cart} />}
				{isBillingState && (
					<BillingAddressSelector
						email={userMetadata.email}
						onBillingComplete={goToOrder}
					/>
				)}
			</div>

			<div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden">
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Total</span>
						<span className="font-semibold">
							${orderSummary.totalCost.toFixed(2)}
						</span>
					</div>
					<Button
						className="h-11 w-full"
						disabled={mobilePrimaryDisabled}
						onClick={mobilePrimaryAction}
					>
						{mobilePrimaryLabel}
					</Button>
					{mobileSecondaryLabel && mobileSecondaryAction && (
						<Button
							variant="ghost"
							className="h-11 w-full"
							disabled={isPlacingOrder}
							onClick={mobileSecondaryAction}
						>
							{mobileSecondaryLabel}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default CheckoutForm;
