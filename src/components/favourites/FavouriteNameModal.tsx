"use client";

import { useState, useRef, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FavouriteNameModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (name: string) => Promise<void>;
	isSaving?: boolean;
}

export const FavouriteNameModal = ({
	open,
	onOpenChange,
	onSave,
	isSaving = false,
}: FavouriteNameModalProps) => {
	const [name, setName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (open) {
			setName("");
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);

	const handleSave = async () => {
		if (!name.trim()) return;
		await onSave(name.trim());
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleSave();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Save as Favourite</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-neutral-500">
					Give this order a name so you can quickly reorder it later.
				</p>
				<Input
					ref={inputRef}
					placeholder="e.g. Bi-weekly Friday Order"
					value={name}
					onChange={(e) => setName(e.target.value.slice(0, 50))}
					onKeyDown={handleKeyDown}
					disabled={isSaving}
					className="mt-1"
				/>
				<div className="flex justify-end gap-3 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={isSaving || !name.trim()}
					>
						{isSaving ? "Saving..." : "Save"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
