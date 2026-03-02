"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CatalogQuantityControlProps {
	quantity: number;
	max?: number;
	onDecrement: () => void;
	onIncrement: () => void;
	onChange: (next: number) => void;
	disabled?: boolean;
}

const clampQuantity = (value: number, max: number) => {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(max, Math.floor(value)));
};

export const CatalogQuantityControl = ({
	quantity,
	max = 999,
	onDecrement,
	onIncrement,
	onChange,
	disabled = false,
}: CatalogQuantityControlProps) => {
	const safeQuantity = clampQuantity(quantity, max);

	const handleInputChange = (value: string) => {
		const trimmed = value.trim();
		const parsed = trimmed === "" ? 0 : Number.parseInt(trimmed, 10);
		onChange(clampQuantity(parsed, max));
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				onClick={onDecrement}
				disabled={disabled || safeQuantity <= 0}
				aria-label="Decrease quantity"
				className="rounded-none"
			>
				<Minus className="h-4 w-4" />
			</Button>
			<Input
				type="number"
				value={safeQuantity === 0 ? "" : safeQuantity}
				placeholder="0"
				min={0}
				max={max}
				onChange={(event) => handleInputChange(event.target.value)}
				disabled={disabled}
				aria-label="Quantity"
				className="h-8 w-16 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
			/>
			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				onClick={onIncrement}
				disabled={disabled || safeQuantity >= max}
				aria-label="Increase quantity"
				className="rounded-none"
			>
				<Plus className="h-4 w-4" />
			</Button>
		</div>
	);
};
