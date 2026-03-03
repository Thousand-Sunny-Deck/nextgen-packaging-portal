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
				"h-8 w-full rounded-none px-2 text-xs sm:h-9 sm:text-sm",
				isSelected ? "font-semibold" : undefined,
			)}
		>
			{isSelected ? "Added to cart" : "Add to cart"}
		</Button>
	);
};
