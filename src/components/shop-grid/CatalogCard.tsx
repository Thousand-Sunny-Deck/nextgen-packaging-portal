"use client";

import { CatalogCardViewModel } from "./types";
import { CatalogQuantityControl } from "./CatalogQuantityControl";
import { CatalogSelectButton } from "./CatalogSelectButton";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CatalogCardProps {
	item: CatalogCardViewModel;
	onQuantityChange: (next: number) => void;
	onToggleSelect: () => void;
}

const MAX_QUANTITY = 999;

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
		<article
			className={cn(
				"border bg-white p-3 shadow-xs transition-colors",
				item.isSelected
					? "border-primary ring-1 ring-primary/30"
					: "border-border",
			)}
		>
			<div className="mb-3 aspect-square w-full overflow-hidden border bg-muted">
				{item.imageUrl ? (
					<Image
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

			<h3 className="mb-3 line-clamp-2 min-h-10 text-sm font-medium">
				{item.name}
			</h3>

			<div className="mb-3">
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
				disabled={item.quantity <= 0}
			/>
		</article>
	);
};
