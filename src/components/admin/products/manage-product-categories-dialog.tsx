"use client";

import { useEffect, useState } from "react";
import { FolderTree, Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	getSpikeProductCategories,
	setSpikeProductCategories,
	type SpikeAssignableCategory,
} from "@/actions/spike/categories-actions";

interface ManageProductCategoriesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productId: string | null;
	productSku: string | null;
	onSaved: () => void;
}

export function ManageProductCategoriesDialog({
	open,
	onOpenChange,
	productId,
	productSku,
	onSaved,
}: ManageProductCategoriesDialogProps) {
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [categories, setCategories] = useState<SpikeAssignableCategory[]>([]);
	const [selected, setSelected] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!open || !productId) return;

		let cancelled = false;
		setLoading(true);
		setError(null);

		getSpikeProductCategories({ productId })
			.then((result) => {
				if (cancelled) return;
				if (!result.success || !result.categories) {
					setError(result.error || "Failed to load categories.");
					setCategories([]);
					setSelected(new Set());
					return;
				}
				setCategories(result.categories);
				setSelected(
					new Set(result.categories.filter((c) => c.assigned).map((c) => c.id)),
				);
			})
			.catch((err) => {
				if (cancelled) return;
				setError(
					err instanceof Error ? err.message : "Failed to load categories.",
				);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [open, productId]);

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSave = async () => {
		if (!productId) return;
		setSubmitting(true);
		setError(null);
		try {
			const result = await setSpikeProductCategories({
				productId,
				categoryIds: Array.from(selected),
			});
			if (!result.success) {
				setError(result.error || "Failed to save categories.");
				return;
			}
			toast.success("Product categories updated.");
			onSaved();
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save categories.",
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
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Manage Categories</DialogTitle>
					<DialogDescription>
						Choose the categories for {productSku ?? "this product"}.
					</DialogDescription>
				</DialogHeader>

				<div className="py-2">
					{loading ? (
						<div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading categories...
						</div>
					) : categories.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
							<FolderTree className="h-8 w-8 text-slate-300" />
							<p className="text-sm text-slate-500">
								No categories exist yet. Create one in the Categories page
								first.
							</p>
						</div>
					) : (
						<div className="max-h-72 space-y-1 overflow-y-auto pr-1">
							{categories.map((category) => (
								<label
									key={category.id}
									className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-50"
								>
									<Checkbox
										checked={selected.has(category.id)}
										onCheckedChange={() => toggle(category.id)}
									/>
									<span className="text-sm text-slate-900">
										{category.name}
									</span>
									<span className="ml-auto font-mono text-xs text-slate-400">
										{category.handle}
									</span>
								</label>
							))}
						</div>
					)}

					{error && (
						<div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{error}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={submitting}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={submitting || loading || categories.length === 0}
					>
						{submitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
