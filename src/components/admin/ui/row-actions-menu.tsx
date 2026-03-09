"use client";

import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowActionItem<T> = {
	key: string;
	label: string;
	icon?: ReactNode;
	variant?: "default" | "destructive";
	disabled?: boolean | ((row: T) => boolean);
	hidden?: boolean | ((row: T) => boolean);
	onSelect: (row: T) => void | Promise<void>;
};

interface RowActionsMenuProps<T> {
	row: T;
	items: RowActionItem<T>[];
	disabled?: boolean;
	triggerLabel?: string;
}

function resolveRowFlag<T>(
	value: boolean | ((row: T) => boolean) | undefined,
	row: T,
): boolean {
	if (typeof value === "function") return value(row);
	return Boolean(value);
}

export function RowActionsMenu<T>({
	row,
	items,
	disabled = false,
	triggerLabel = "Open actions",
}: RowActionsMenuProps<T>) {
	const visibleItems = items.filter(
		(item) => !resolveRowFlag(item.hidden, row),
	);
	const triggerDisabled = disabled || visibleItems.length === 0;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					disabled={triggerDisabled}
				>
					<span className="sr-only">{triggerLabel}</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{visibleItems.map((item) => (
					<DropdownMenuItem
						key={item.key}
						variant={item.variant}
						disabled={resolveRowFlag(item.disabled, row)}
						onClick={() => {
							void item.onSelect(row);
						}}
					>
						{item.icon}
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
