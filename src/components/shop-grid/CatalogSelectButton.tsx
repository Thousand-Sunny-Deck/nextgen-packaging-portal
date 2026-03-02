"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CatalogSelectButtonProps {
	isSelected: boolean;
	onToggle: () => void;
	disabled?: boolean;
}

export const CatalogSelectButton = ({
	isSelected,
	onToggle,
	disabled = false,
}: CatalogSelectButtonProps) => {
	return (
		<Button
			type="button"
			variant={isSelected ? "default" : "outline"}
			onClick={onToggle}
			disabled={disabled}
			aria-pressed={isSelected}
			className={cn(
				"w-full rounded-none",
				isSelected ? "font-semibold" : undefined,
			)}
		>
			{isSelected ? "Selected" : "Select"}
		</Button>
	);
};
