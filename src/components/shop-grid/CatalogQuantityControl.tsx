"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";

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
	const [draftValue, setDraftValue] = useState(
		safeQuantity === 0 ? "" : String(safeQuantity),
	);

	useEffect(() => {
		setDraftValue(safeQuantity === 0 ? "" : String(safeQuantity));
	}, [safeQuantity]);

	const inputDisplayValue = useMemo(() => {
		return draftValue === ""
			? ""
			: String(clampQuantity(Number(draftValue), max));
	}, [draftValue, max]);

	const handleInputChange = (value: string) => {
		const trimmed = value.trim();
		if (trimmed === "") {
			setDraftValue("");
			onChange(0);
			return;
		}

		if (!/^\d+$/.test(trimmed)) {
			return;
		}

		setDraftValue(trimmed);
		onChange(clampQuantity(Number.parseInt(trimmed, 10), max));
	};

	return (
		<div className="flex h-9 w-full items-center overflow-hidden rounded-md border border-border bg-white">
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onDecrement}
				disabled={disabled || safeQuantity <= 0}
				aria-label="Decrease quantity"
				className="h-full w-10 rounded-none border-r border-border"
			>
				<Minus className="h-4 w-4" />
			</Button>
			<Input
				type="text"
				inputMode="numeric"
				pattern="[0-9]*"
				value={inputDisplayValue}
				placeholder="0"
				min={0}
				max={max}
				onChange={(event) => handleInputChange(event.target.value)}
				onBlur={() =>
					setDraftValue(safeQuantity === 0 ? "" : String(safeQuantity))
				}
				disabled={disabled}
				aria-label="Quantity"
				className="h-full flex-1 rounded-none border-0 px-1 text-center text-sm shadow-none focus-visible:ring-0"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				onClick={onIncrement}
				disabled={disabled || safeQuantity >= max}
				aria-label="Increase quantity"
				className="h-full w-10 rounded-none border-l border-border"
			>
				<Plus className="h-4 w-4" />
			</Button>
		</div>
	);
};
