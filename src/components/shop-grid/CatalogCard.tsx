"use client";

import { CatalogCardViewModel } from "./types";
import { CatalogQuantityControl } from "./CatalogQuantityControl";
import { CatalogSelectButton } from "./CatalogSelectButton";
import Image from "next/image";

interface CatalogCardProps {
	item: CatalogCardViewModel;
	onQuantityChange: (next: number) => void;
	onToggleSelect: () => void;
}

const MAX_QUANTITY = 999;
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
// TODO: Figure out what to do for "adding to cart"
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
					<>
						<Image
							src={item.imageUrl}
							alt={item.name}
							width={320}
							height={320}
							sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
							className="h-full w-full object-cover cursor-zoom-in"
							loading="lazy"
							onClick={(e) => {
								e.stopPropagation();
								document.body.style.overflow = "hidden";
								const overlay = document.createElement("div");
								overlay.style.position = "fixed";
								overlay.style.inset = "0";
								overlay.style.background = "rgba(0,0,0,0.95)";
								overlay.style.display = "flex";
								overlay.style.alignItems = "center";
								overlay.style.justifyContent = "center";
								overlay.style.zIndex = "10000";
								overlay.style.cursor = "zoom-out";

								const img = document.createElement("img");
								const imageUrl = item.imageUrl;
								if (!imageUrl) return;
								img.src = imageUrl;
								img.alt = item.name ?? "Product image";
								img.style.maxWidth = "90vw";
								img.style.maxHeight = "90vh";
								img.style.boxShadow = "0 4px 40px rgba(0,0,0,0.25)";
								img.style.borderRadius = "0.5rem";

								// Clicking on background closes the overlay
								overlay.onclick = () => {
									document.body.style.overflow = "";
									document.body.removeChild(overlay);
								};
								// Prevent clicking image from closing overlay
								img.onclick = (ev) => ev.stopPropagation();

								overlay.appendChild(img);
								document.body.appendChild(overlay);
							}}
						/>
					</>
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
