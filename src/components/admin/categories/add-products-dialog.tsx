"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, PackageSearch, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
	addSpikeProductsToCategory,
	getSpikeAssignableProducts,
	type SpikeAssignableProduct,
} from "@/actions/spike/categories-actions";

interface AddProductsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	categoryId: string | null;
	categoryName: string | null;
	onSaved: () => void;
}

export function AddProductsDialog({
	open,
	onOpenChange,
	categoryId,
	categoryName,
	onSaved,
}: AddProductsDialogProps) {
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<SpikeAssignableProduct[]>([]);
	const [truncated, setTruncated] = useState(false);
	// Ticked in this session. Products already in the category stay checked and
	// disabled, so the dialog only ever adds.
	const [selected, setSelected] = useState<Set<string>>(new Set());

	const load = useCallback(
		async (query: string) => {
			if (!categoryId) return;
			setLoading(true);
			setError(null);
			try {
				const result = await getSpikeAssignableProducts({
					categoryId,
					search: query,
				});
				if (!result.success || !result.products) {
					setError(result.error || "Failed to load products.");
					setProducts([]);
					return;
				}
				setProducts(result.products);
				setTruncated(Boolean(result.truncated));
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load products.",
				);
			} finally {
				setLoading(false);
			}
		},
		[categoryId],
	);

	// Reset per opening, then search as the admin types.
	useEffect(() => {
		if (!open) return;
		setSearch("");
		setSelected(new Set());
	}, [open, categoryId]);

	useEffect(() => {
		if (!open) return;
		const timer = setTimeout(() => load(search), 250);
		return () => clearTimeout(timer);
	}, [open, search, load]);

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
		if (!categoryId || selected.size === 0) return;
		setSubmitting(true);
		setError(null);
		try {
			const result = await addSpikeProductsToCategory({
				categoryId,
				productIds: Array.from(selected),
			});
			if (!result.success) {
				setError(result.error || "Failed to add products.");
				return;
			}
			const added = result.added ?? 0;
			toast.success(
				`${added} product${added === 1 ? "" : "s"} added to ${categoryName ?? "the category"}.`,
			);
			onSaved();
			onOpenChange(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add products.");
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
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Add Products</DialogTitle>
					<DialogDescription>
						Search the catalogue and tick the products to add to{" "}
						{categoryName ?? "this category"}. Customers only see a category
						once it contains products they can browse.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-2">
					<div className="relative">
						<Search
							size={14}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search SKU or description..."
							className="pl-9"
							aria-label="Search products"
						/>
					</div>

					{loading ? (
						<div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading products...
						</div>
					) : products.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
							<PackageSearch className="h-8 w-8 text-slate-300" />
							<p className="text-sm text-slate-500">
								{search
									? `No products match "${search}".`
									: "No products found."}
							</p>
						</div>
					) : (
						<div className="max-h-72 space-y-1 overflow-y-auto pr-1">
							{products.map((product) => (
								<label
									key={product.id}
									className={`flex items-center gap-3 rounded-md px-2 py-2 ${
										product.assigned
											? "opacity-50"
											: "cursor-pointer hover:bg-slate-50"
									}`}
								>
									<Checkbox
										checked={product.assigned || selected.has(product.id)}
										disabled={product.assigned}
										onCheckedChange={() => toggle(product.id)}
									/>
									<span className="font-mono text-xs text-slate-700">
										{product.sku}
									</span>
									<span className="truncate text-sm text-slate-900">
										{product.description}
									</span>
									{product.assigned && (
										<span className="ml-auto shrink-0 text-xs text-slate-400">
											already added
										</span>
									)}
								</label>
							))}
						</div>
					)}

					{truncated && !loading && (
						<p className="text-xs text-slate-400">
							Showing the first 50 matches — narrow the search to see more.
						</p>
					)}

					{error && (
						<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
						disabled={submitting || selected.size === 0}
					>
						{submitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							`Add ${selected.size || ""}`.trim()
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
