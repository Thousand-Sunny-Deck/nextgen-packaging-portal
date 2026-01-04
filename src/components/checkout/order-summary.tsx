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

	return (
		<div className="mt-4 px-4 py-2 flex flex-col w-full">
			<p className="font-bold text-xl">Order Summary</p>
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

				<div className="flex flex-row justify-between mt-2">
					<p className="font-bold text-md">Total</p>
					<p className="font-bold text-md">${finalTotalCost}</p>
				</div>
			</div>
		</div>
	);
};

export default OrderSummary;
