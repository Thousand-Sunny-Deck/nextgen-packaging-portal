"use client";

import { BillingInfoItem } from "@/lib/store/billing-info-store";

export type OrderSummaryInfo = {
	subTotal: number;
	totalCost: number;
	extraCost: Record<string, number>;
	cartSize: number;
};

interface OrderSummaryProps {
	info: OrderSummaryInfo;
	billingInfo: BillingInfoItem | null;
	isOrderState: boolean;
}

const OrderSummary = ({
	info,
	billingInfo,
	isOrderState,
}: OrderSummaryProps) => {
	const { subTotal, cartSize, totalCost, extraCost } = info;
	const hasBillingInfo = billingInfo !== null;

	return (
		<div className="mt-4 px-4 py-2 flex flex-col w-full">
			<div className="flex items-center justify-between">
				<p className="font-bold text-xl">Order Summary</p>
				<p className="font-bold text-sm md:hidden">${totalCost.toFixed(2)}</p>
			</div>

			{/* Mobile compact summary */}
			<div className="mt-3 rounded-md border bg-muted/30 p-3 md:hidden">
				<div className="flex items-center justify-between text-sm">
					<p className="text-muted-foreground">Items</p>
					<p className="font-medium">{cartSize} item(s)</p>
				</div>
				<div className="mt-2 flex items-center justify-between text-sm">
					<p className="text-muted-foreground">Sub total</p>
					<p className="font-medium">${subTotal.toFixed(2)}</p>
				</div>
				<div className="mt-2 flex items-center justify-between text-sm">
					<p className="text-muted-foreground">Service fee</p>
					<p className="font-medium">${extraCost["serviceFee"].toFixed(2)}</p>
				</div>
			</div>

			{/* Desktop detailed summary */}
			<div className="hidden md:flex flex-col mt-2">
				<div className="pt-2 flex flex-col">
					<div className="flex flex-row justify-between">
						<p className="font-light text-sm">Total items</p>
						<p className="font-semibold text-sm">{cartSize} item(s)</p>
					</div>
					<hr className="mt-2" />
					<div className="flex flex-row justify-between mt-2">
						<p className="font-light text-sm">Sub total</p>
						<p className="font-semibold text-sm">${subTotal.toFixed(2)}</p>
					</div>
					<div className="pl-3 flex flex-row justify-between mt-2">
						<p className="font-extralight text-sm italic">Shipping</p>
						<p className="font-semibold text-sm">${(0).toFixed(2)}</p>
					</div>
					<div className="pl-3 flex flex-row justify-between mt-2">
						<p className="font-extralight text-sm italic">Service Fee</p>
						<p className="font-semibold text-sm">
							${extraCost["serviceFee"].toFixed(2)}
						</p>
					</div>
					<hr className="mt-2" />
				</div>
			</div>

			{/* Billing details */}
			{hasBillingInfo && (
				<>
					<div
						className={`mt-3 gap-2 ${
							isOrderState ? "flex flex-col" : "hidden md:flex md:flex-col"
						}`}
					>
						<p className="font-medium text-sm">Billing details</p>
						<div className="flex flex-col gap-1">
							<p className="font-light text-sm italic">
								Email: {billingInfo?.email}
							</p>
							<p className="font-light text-sm italic">
								Organization: {billingInfo?.organization}
							</p>
							<p className="font-light text-sm italic">
								Billing address: {billingInfo?.address}
							</p>
							<p className="font-light text-sm italic">
								ABN: {billingInfo?.ABN}
							</p>
						</div>
					</div>
					<hr className="mt-4" />
				</>
			)}

			<div className="flex flex-row justify-between mt-2">
				<p className="font-bold text-md">Total</p>
				<p className="font-bold text-md">${totalCost.toFixed(2)}</p>
			</div>
			<hr className="mt-2" />
		</div>
	);
};

export default OrderSummary;
