"use client";

import { ProgressBar } from "./progress-bar";
import OrderSummary, { OrderSummaryInfo } from "./order-summary";
import { Button } from "@/components/ui/button";
import { BillingInfoItem } from "@/lib/store/billing-info-store";
import { CheckoutState, ProgressStep } from "@/hooks/use-checkout-flow";

interface OrderInfoProps {
	currentStep: CheckoutState;
	currentStepIndex: number;
	progressSteps: ProgressStep[];
	orderSummary: OrderSummaryInfo;
	billingInfo: BillingInfoItem | null;
	isLoading: boolean;
	canProceedToBilling: boolean;
	canPlaceOrder: boolean;
	onGoToBilling: () => void;
	onGoToCart: () => void;
	onPlaceOrder: () => Promise<void>;
}

const OrderInfo = (props: OrderInfoProps) => {
	const {
		currentStep,
		currentStepIndex,
		progressSteps,
		orderSummary,
		billingInfo,
		isLoading,
		canProceedToBilling,
		canPlaceOrder,
		onGoToBilling,
		onGoToCart,
		onPlaceOrder,
	} = props;

	const isCartState = currentStep === "cart";
	const isBilling = currentStep === "billing";
	const isOrderState = currentStep === "order" || currentStep === "shipped";

	return (
		<div className="w-full md:w-[42%] lg:w-[40%] border flex flex-col items-start">
			<ProgressBar steps={progressSteps} currentStep={currentStepIndex} />
			<OrderSummary info={orderSummary} billingInfo={billingInfo} />

			<div className="flex flex-col items-center justify-center w-full p-6 gap-2">
				{isCartState && (
					<Button
						size="default"
						className="w-[150px]"
						onClick={onGoToBilling}
						disabled={!canProceedToBilling}
					>
						Proceed next
					</Button>
				)}
				{isBilling && (
					<Button
						size="default"
						variant="secondary"
						className="w-[150px]"
						onClick={onGoToCart}
					>
						Order summary
					</Button>
				)}
				{isOrderState && (
					<>
						<Button
							className="w-[150px]"
							disabled={isLoading || !canPlaceOrder}
							onClick={onPlaceOrder}
						>
							Place Order
						</Button>
						<Button
							variant="link"
							className="w-[150px] font-light text-sm"
							disabled={isLoading}
							onClick={onGoToBilling}
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
