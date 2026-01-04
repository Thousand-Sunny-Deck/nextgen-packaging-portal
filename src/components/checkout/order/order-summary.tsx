"use client";

import { useBillingInfoStore } from "@/lib/store/billing-info-store";

interface OrderSummaryProps {
	cartSize: number;
	totalCost: number;
}

const OrderSummary = ({ cartSize, totalCost }: OrderSummaryProps) => {
	const shouldAddServiceFee = totalCost < 150;
	const serviceFee = 10;
	const finalTotalCost = shouldAddServiceFee
		? totalCost + serviceFee
		: totalCost;

	const { getBillingInfo } = useBillingInfoStore();
	const billingInfoArr = getBillingInfo();
	const isBillingState = billingInfoArr.length === 0 ? false : true;
	const billingInfo = billingInfoArr.at(0);

	return (
		<div className="mt-4 px-4 py-2 flex flex-col w-full">
			<p className="font-bold text-xl">Order Summary</p>
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
						<p className="font-semibold text-sm">${totalCost}</p>
					</div>
					<div className="pl-3 flex flex-row justify-between mt-2">
						<p className="font-extralight text-sm italic">Shipping</p>
						<p className="font-semibold text-sm">${0}</p>
					</div>

					<div className="pl-3 flex flex-row justify-between mt-2">
						<p className="font-extralight text-sm italic">Service Fee</p>
						<p className="font-semibold text-sm">
							${shouldAddServiceFee ? serviceFee : 0}
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
					<p className="font-bold text-md">${finalTotalCost}</p>
				</div>
				<hr className="mt-2" />
			</div>
		</div>
	);
};

export default OrderSummary;
