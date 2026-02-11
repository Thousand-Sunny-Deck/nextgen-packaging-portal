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
		<div className="w-full grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[1fr_auto_auto] gap-3 md:gap-6 items-start px-4 md:px-3 py-3 border-t hover:bg-gray-50">
			<div className="flex flex-col min-w-0">
				<p className="text-sm font-medium text-gray-900 truncate">
					{description}
				</p>
				<p className="text-xs text-gray-500 mt-0.5 truncate">
					{textUnderDescription}
				</p>
				<p className="text-xs text-gray-600 mt-1 md:hidden">Qty: {quantity}</p>
			</div>

			<div className="hidden md:block text-sm text-gray-600 whitespace-nowrap">
				Qty: {quantity}
			</div>

			<div className="text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
				${total.toFixed(2)}
			</div>
		</div>
	);
};
