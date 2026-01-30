"use client";

import CartSummary from "./cart/cart-summary";
import OrderInfo from "./order/order-info";
import BillingAddressSelector from "./billing/billing-address-selector";
import EmptyCartState from "./empty-cart-state";
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

	return (
		<div className="w-full mt-10 flex justify-between gap-4 md:gap-6 lg:gap-8">
			{/* Current Cart info*/}
			{(isReviewOrderState || isOrderState) && <CartSummary cart={cart} />}
			{isBillingState && (
				<BillingAddressSelector
					email={userMetadata.email}
					onBillingComplete={goToOrder}
				/>
			)}

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
	);
};

export default CheckoutForm;
