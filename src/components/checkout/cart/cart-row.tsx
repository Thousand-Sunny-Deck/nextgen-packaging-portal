"use client";

interface CartRowProps {
	description: string;
	quantity: number;
	total: number;
	sku: string;
	unitCost: number;
}

export const CartRow = ({
	description,
	quantity,
	total,
	sku,
	unitCost,
}: CartRowProps) => {
	const textUnderDescription = `${sku} • $${unitCost.toFixed(2)}`;

	return (
		<div className="w-full grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-2 sm:gap-6 items-start px-3 py-3 border-t hover:bg-gray-50">
			{/* Description and undertext */}
			<div className="flex flex-col min-w-0">
				<p className="text-sm font-medium text-gray-900 truncate">
					{description}
				</p>
				<p className="text-xs text-gray-500 mt-0.5 truncate">
					{textUnderDescription}
				</p>
				<p className="text-xs text-gray-500 mt-1 sm:hidden">Qty: {quantity}</p>
			</div>

			{/* Quantity */}
			<div className="hidden sm:block text-sm text-gray-600 whitespace-nowrap">
				Qty: {quantity}
			</div>

			{/* Total */}
			<div className="text-sm font-semibold text-gray-900 text-right min-w-[80px]">
				${total.toFixed(2)}
			</div>
		</div>
	);
};
