"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory } from "@/actions/spike/categories-actions";
import { slugify } from "@/lib/utils";

interface CategoryCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: () => void;
}

export function CategoryCreateDialog({
	open,
	onOpenChange,
	onCreated,
}: CategoryCreateDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [sortOrder, setSortOrder] = useState("0");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handle = slugify(name);

	const reset = () => {
		setName("");
		setDescription("");
		setSortOrder("0");
		setError(null);
	};

	const handleClose = () => {
		if (submitting) return;
		reset();
		onOpenChange(false);
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		setError(null);
		try {
			const result = await createCategory({
				name,
				description,
				sortOrder: Number.parseInt(sortOrder || "0", 10),
			});
			if (!result.success) {
				setError(result.error || "Failed to create category.");
				return;
			}
			toast.success("Category created.");
			reset();
			onCreated();
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (submitting) return;
				if (!nextOpen) handleClose();
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Category</DialogTitle>
					<DialogDescription>
						Categories group products in the shop. The handle is generated from
						the name.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="space-y-1.5">
						<Label htmlFor="category-name">Name</Label>
						<Input
							id="category-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="e.g. Food Packaging"
						/>
						{handle && (
							<p className="text-xs text-slate-400">
								Handle: <span className="font-mono">{handle}</span>
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="category-description">Description (optional)</Label>
						<Input
							id="category-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Short description"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="category-sort">Sort order</Label>
						<Input
							id="category-sort"
							type="number"
							step="1"
							className="w-28"
							value={sortOrder}
							onChange={(event) => setSortOrder(event.target.value)}
						/>
						<p className="text-xs text-slate-400">
							Lower numbers appear first in the shop.
						</p>
					</div>

					{error && (
						<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{error}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={submitting}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={submitting || !handle}>
						{submitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating...
							</>
						) : (
							"Create Category"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
