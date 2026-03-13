"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

interface CatalogImageZoomProps {
	imageUrl: string;
	name?: string | null;
	onClose: () => void;
}

const CatalogImageZoom = ({
	imageUrl,
	name,
	onClose,
}: CatalogImageZoomProps) => {
	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	return (
		<div
			className="fixed inset-0 z-[10000] flex cursor-zoom-out items-center justify-center bg-black/95"
			onClick={onClose}
		>
			<img
				src={imageUrl}
				alt={name ?? "Product image"}
				className="max-h-[90vh] max-w-[90vw] rounded-md shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			/>
		</div>
	);
};

// TODO: Figure out what to do for "adding to cart"
export const CatalogCard = ({
	item,
	onQuantityChange,
	onToggleSelect,
}: CatalogCardProps) => {
	const [isZoomed, setIsZoomed] = useState(false);

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
						<div
							className="h-full w-full cursor-zoom-in"
							onClick={(e) => {
								e.stopPropagation();
								setIsZoomed(true);
							}}
						>
							<Image
								src={item.imageUrl}
								alt={item.name}
								width={320}
								height={320}
								sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
								className="h-full w-full object-cover"
								loading="lazy"
							/>
						</div>
						{isZoomed && (
							<CatalogImageZoom
								imageUrl={item.imageUrl}
								name={item.name}
								onClose={() => setIsZoomed(false)}
							/>
						)}
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
