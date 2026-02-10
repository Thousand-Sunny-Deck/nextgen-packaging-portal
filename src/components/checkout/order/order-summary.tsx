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
}

const OrderSummary = ({ info, billingInfo }: OrderSummaryProps) => {
	const { subTotal, cartSize, totalCost, extraCost } = info;
	const isBillingState = billingInfo !== null;

	const SummaryContent = ({ showTitle }: { showTitle: boolean }) => (
		<div className="flex flex-col w-full">
			{showTitle && <p className="font-bold text-xl">Order Summary</p>}
			{/* subtotal + service fee, etc */}
			<div className="flex flex-col mt-2">
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

				{/* Billing info (if exists) */}
				{isBillingState && (
					<>
						<div className="flex flex-col mt-2 gap-3">
							<p className="font-md text-sm">Billing details</p>
							<div className="flex flex-col pl-3 gap-1">
								<p className="font-extralight text-sm italic">
									Email: {billingInfo?.email}
								</p>
								<p className="font-extralight text-sm italic">
									Organization: {billingInfo?.organization}
								</p>
								<p className="font-extralight text-sm italic">
									Billing address: {billingInfo?.address}
								</p>
								<p className="font-extralight text-sm italic">
									ABN: {billingInfo?.ABN}
								</p>
							</div>
						</div>

						<hr className="mt-6" />
					</>
				)}
				{/* total */}
				<div className="flex flex-row justify-between mt-2">
					<p className="font-bold text-md">Total</p>
					<p className="font-bold text-md">${totalCost.toFixed(2)}</p>
				</div>
				<hr className="mt-2" />
			</div>
		</div>
	);

	return (
		<div className="mt-4 w-full">
			<details className="lg:hidden border border-slate-200 rounded-lg bg-white">
				<summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
					<span className="font-semibold text-sm">Order Summary</span>
					<span className="font-bold text-sm">${totalCost.toFixed(2)}</span>
				</summary>
				<div className="px-4 pb-4">
					<SummaryContent showTitle={false} />
				</div>
			</details>

			<div className="hidden lg:block px-4 py-2">
				<SummaryContent showTitle />
			</div>
		</div>
	);
};

export default OrderSummary;
