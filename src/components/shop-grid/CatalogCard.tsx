"use client";

import { CatalogCardViewModel } from "./types";
import { CatalogQuantityControl } from "./CatalogQuantityControl";
import { CatalogSelectButton } from "./CatalogSelectButton";

interface CatalogCardProps {
	item: CatalogCardViewModel;
	onQuantityChange: (next: number) => void;
	onToggleSelect: () => void;
}

const MAX_QUANTITY = 999;
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const CatalogCard = ({
	item,
	onQuantityChange,
	onToggleSelect,
}: CatalogCardProps) => {
	const handleDecrement = () => {
		onQuantityChange(Math.max(0, item.quantity - 1));
	};

	const handleIncrement = () => {
		onQuantityChange(Math.min(MAX_QUANTITY, item.quantity + 1));
	};

	return (
		<article className="min-w-0 rounded-lg border border-border bg-white p-2.5 shadow-xs transition-colors md:p-3">
			<div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted sm:mb-3 sm:aspect-square">
				{item.imageUrl ? (
					<img
						src={item.imageUrl}
						alt={item.name}
						className="h-full w-full object-cover"
						loading="lazy"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
						No image
					</div>
				)}
			</div>

			<h3 className="mb-1 line-clamp-2 min-h-9 text-xs font-medium sm:text-sm md:min-h-10">
				{item.name}
			</h3>

			<p className="mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
				Unit: {formatCurrency(item.unitCost)}
			</p>

			<div className="mb-2.5 md:mb-3">
				<CatalogQuantityControl
					quantity={item.quantity}
					max={MAX_QUANTITY}
					onDecrement={handleDecrement}
					onIncrement={handleIncrement}
					onChange={onQuantityChange}
				/>
			</div>

			<CatalogSelectButton
				isSelected={item.isSelected}
				onToggle={onToggleSelect}
			/>
		</article>
	);
};
