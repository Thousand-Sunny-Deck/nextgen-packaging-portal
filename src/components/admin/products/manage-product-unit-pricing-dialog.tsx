"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	setSpikeProductUnitPricing,
	type SpikeAdminProduct,
} from "@/actions/spike/products-actions";

interface ManageProductUnitPricingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product: SpikeAdminProduct | null;
	onSaved: () => void;
}

export function ManageProductUnitPricingDialog({
	open,
	onOpenChange,
	product,
	onSaved,
}: ManageProductUnitPricingDialogProps) {
	const [enabled, setEnabled] = useState(false);
	const [sleevePrice, setSleevePrice] = useState("");
	const [boxPrice, setBoxPrice] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open || !product) return;
		setEnabled(product.hasUnitOptions);
		setSleevePrice(
			product.sleevePrice != null ? String(product.sleevePrice) : "",
		);
		setBoxPrice(product.boxPrice != null ? String(product.boxPrice) : "");
		setError(null);
	}, [open, product]);

	const handleSave = async () => {
		if (!product) return;

		let parsedSleeve: number | null = null;
		let parsedBox: number | null = null;

		if (enabled) {
			parsedSleeve = Number.parseFloat(sleevePrice);
			parsedBox = Number.parseFloat(boxPrice);
			if (
				!Number.isFinite(parsedSleeve) ||
				!Number.isFinite(parsedBox) ||
				parsedSleeve < 0 ||
				parsedBox < 0
			) {
				setError("Enter valid sleeve and box prices.");
				return;
			}
		}

		setSubmitting(true);
		setError(null);
		try {
			const result = await setSpikeProductUnitPricing({
				productId: product.id,
				hasUnitOptions: enabled,
				sleevePrice: parsedSleeve,
				boxPrice: parsedBox,
			});
			if (!result.success) {
				setError(result.error || "Failed to save unit pricing.");
				return;
			}
			toast.success("Unit pricing updated.");
			onSaved();
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save unit pricing.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (submitting) return;
				onOpenChange(next);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Unit pricing</DialogTitle>
					<DialogDescription>
						Sell {product?.sku ?? "this product"} by the sleeve or the box, each
						with its own price.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
						<Checkbox
							checked={enabled}
							onCheckedChange={(checked) => setEnabled(checked === true)}
							className="mt-0.5"
						/>
						<span>
							<span className="block text-sm font-medium text-slate-900">
								Sell by sleeve or box
							</span>
							<span className="block text-xs text-slate-500">
								Customers pick Sleeve or Box (and a quantity) at order time.
								When off, the product uses its single unit cost.
							</span>
						</span>
					</label>

					{enabled && (
						<div className="grid grid-cols-2 gap-3">
							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="sleeve-price"
									className="text-sm font-medium text-slate-700"
								>
									Sleeve price
								</label>
								<Input
									id="sleeve-price"
									type="number"
									step="0.01"
									min="0"
									value={sleevePrice}
									onChange={(event) => setSleevePrice(event.target.value)}
									placeholder="0.00"
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<label
									htmlFor="box-price"
									className="text-sm font-medium text-slate-700"
								>
									Box price
								</label>
								<Input
									id="box-price"
									type="number"
									step="0.01"
									min="0"
									value={boxPrice}
									onChange={(event) => setBoxPrice(event.target.value)}
									placeholder="0.00"
								/>
							</div>
						</div>
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
					<Button onClick={handleSave} disabled={submitting}>
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
