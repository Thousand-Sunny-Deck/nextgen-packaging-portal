"use client";

import { useState } from "react";
import { Pencil, Trash2, PackagePlus } from "lucide-react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	useProductDraftStore,
	type ProductDraftItem,
} from "@/lib/store/product-draft-store";

export const MAX_MANUAL = 10;

const productSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	description: z.string().min(1, "Description is required"),
	unitCost: z
		.number({ invalid_type_error: "Unit cost must be a number" })
		.positive("Unit cost must be greater than 0"),
});

export function ManualForm() {
	const { draft, addItem, removeItem, updateItem } = useProductDraftStore();

	const [sku, setSku] = useState("");
	const [description, setDescription] = useState("");
	const [unitCost, setUnitCost] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [editingLocalId, setEditingLocalId] = useState<string | null>(null);

	const atLimit = draft.length >= MAX_MANUAL;

	const resetForm = () => {
		setSku("");
		setDescription("");
		setUnitCost("");
		setFormError(null);
		setEditingLocalId(null);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const parsed = productSchema.safeParse({
			sku: sku.trim(),
			description: description.trim(),
			unitCost: parseFloat(unitCost),
		});

		if (!parsed.success) {
			setFormError(parsed.error.issues[0].message);
			return;
		}

		const skuLower = parsed.data.sku.toLowerCase();

		// Duplicate SKU check within draft (exclude item being edited)
		const duplicate = draft.some(
			(i) => i.sku.toLowerCase() === skuLower && i.localId !== editingLocalId,
		);
		if (duplicate) {
			setFormError("This SKU is already in the draft.");
			return;
		}

		if (editingLocalId) {
			updateItem(editingLocalId, parsed.data);
		} else {
			addItem(parsed.data);
		}

		resetForm();
	};

	const handleEdit = (item: ProductDraftItem) => {
		setSku(item.sku);
		setDescription(item.description);
		setUnitCost(String(item.unitCost));
		setFormError(null);
		setEditingLocalId(item.localId);
	};

	const handleCancelEdit = () => resetForm();

	return (
		<div className="space-y-6 py-4 max-w-lg mx-auto">
			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="sku">SKU</Label>
					<Input
						id="sku"
						value={sku}
						onChange={(e) => setSku(e.target.value)}
						placeholder="BOX-A1"
						disabled={atLimit && !editingLocalId}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Input
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Premium cardboard box"
						disabled={atLimit && !editingLocalId}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="unitCost">Unit Cost ($)</Label>
					<Input
						id="unitCost"
						type="number"
						step="0.01"
						min="0"
						value={unitCost}
						onChange={(e) => setUnitCost(e.target.value)}
						placeholder="9.99"
						disabled={atLimit && !editingLocalId}
					/>
				</div>

				{formError && <p className="text-sm text-red-600">{formError}</p>}

				{atLimit && !editingLocalId && (
					<p className="text-sm text-slate-500">
						Maximum {MAX_MANUAL} products per batch.
					</p>
				)}

				<div className="flex gap-2">
					<Button
						type="submit"
						disabled={atLimit && !editingLocalId}
						className="flex-1"
					>
						<PackagePlus className="mr-2 h-4 w-4" />
						{editingLocalId ? "Update Product" : "Add to Draft"}
					</Button>
					{editingLocalId && (
						<Button type="button" variant="outline" onClick={handleCancelEdit}>
							Cancel
						</Button>
					)}
				</div>
			</form>

			{/* Draft list */}
			{draft.length > 0 && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
						Draft — {draft.length} of {MAX_MANUAL}
					</p>
					<div className="space-y-2">
						{draft.map((item) => (
							<div
								key={item.localId}
								className={`flex items-center justify-between rounded-md border px-3 py-2 ${
									editingLocalId === item.localId
										? "border-orange-300 bg-orange-50"
										: "border-slate-200 bg-slate-50"
								}`}
							>
								<div>
									<p className="text-sm font-medium text-slate-900 font-mono">
										{item.sku}
									</p>
									<p className="text-xs text-slate-500">{item.description}</p>
									<p className="text-xs text-slate-400">
										${item.unitCost.toFixed(2)}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => handleEdit(item)}
										className="text-slate-400 hover:text-slate-700 transition-colors"
									>
										<Pencil size={14} />
									</button>
									<button
										type="button"
										onClick={() => {
											if (editingLocalId === item.localId) resetForm();
											removeItem(item.localId);
										}}
										className="text-slate-400 hover:text-red-500 transition-colors"
									>
										<Trash2 size={14} />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
