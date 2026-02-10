"use client";

import CartSummary from "./cart/cart-summary";
import OrderInfo from "./order/order-info";
import BillingAddressSelector from "./billing/billing-address-selector";
import EmptyCartState from "./empty-cart-state";
import OrderSummary from "./order/order-summary";
import { ProgressBar } from "./order/progress-bar";
import { Button } from "@/components/ui/button";
import { useCheckoutFlow } from "@/hooks/use-checkout-flow";

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

	const mobileActionLabel = isReviewOrderState
		? "Proceed next"
		: isBillingState
			? "Order summary"
			: "Place Order";

	const mobileActionDisabled = isReviewOrderState
		? !canProceedToBilling
		: isBillingState
			? false
			: isLoading || !canPlaceOrder;

	const handleMobileAction = () => {
		if (isReviewOrderState) {
			goToBilling();
			return;
		}
		if (isBillingState) {
			goToCart();
			return;
		}
		if (isOrderState) {
			void placeOrder();
		}
	};

	return (
		<div className="w-full mt-6 md:mt-10 flex flex-col lg:flex-row lg:justify-between gap-4 md:gap-6 lg:gap-8">
			<div className="lg:hidden">
				<ProgressBar steps={progressSteps} currentStep={currentStepIndex} />
			</div>

			<div className="w-full lg:w-[60%]">
				{/* Current Cart info*/}
				{(isReviewOrderState || isOrderState) && <CartSummary cart={cart} />}
				{isBillingState && (
					<BillingAddressSelector
						email={userMetadata.email}
						onBillingComplete={goToOrder}
					/>
				)}
			</div>

			<div className="hidden lg:block lg:w-[40%]">
				{/* Summary Info and checkout */}
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

			<div className="lg:hidden">
				<OrderSummary info={orderSummary} billingInfo={billingInfo} />
			</div>

			<div className="h-24 lg:hidden" />

			<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden z-50">
				<div className="flex items-center justify-between max-w-lg mx-auto">
					<div>
						<p className="text-xs text-gray-500">Total</p>
						<p className="text-lg font-bold">
							${orderSummary.totalCost.toFixed(2)}
						</p>
					</div>
					<Button onClick={handleMobileAction} disabled={mobileActionDisabled}>
						{mobileActionLabel}
					</Button>
				</div>
				{isOrderState && (
					<div className="mt-2 flex justify-end max-w-lg mx-auto">
						<Button
							variant="link"
							className="h-auto p-0 text-xs font-light"
							disabled={isLoading}
							onClick={goToBilling}
						>
							Edit Billing Info
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CheckoutForm;
