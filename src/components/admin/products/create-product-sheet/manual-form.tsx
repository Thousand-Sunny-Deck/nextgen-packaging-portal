"use client";

import { useState, useRef } from "react";
import { PackagePlus, ImagePlus, Upload, X } from "lucide-react";
import z from "zod";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	useCreateProductStore,
	MAX_PRODUCT_DRAFT,
	type ProductDraftItem,
} from "@/lib/store/create-product-store";
import { ProductDraftCard } from "./product-draft-card";
import Image from "next/image";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const productSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	description: z.string().min(1, "Description is required"),
	unitCost: z
		.number("Unit cost must be a number")
		.positive("Unit cost must be greater than 0"),
});

export function ManualForm() {
	const { draft, addItem, removeItem, updateItem } = useCreateProductStore();

	const [sku, setSku] = useState("");
	const [description, setDescription] = useState("");
	const [unitCost, setUnitCost] = useState("");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [editingLocalId, setEditingLocalId] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const atLimit = draft.size >= MAX_PRODUCT_DRAFT;
	const draftItems = [...draft.values()];

	const resetForm = () => {
		setSku("");
		setDescription("");
		setUnitCost("");
		setImageFile(null);
		setImagePreview(null);
		setFormError(null);
		setImageError(null);
		setEditingLocalId(null);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!ACCEPTED_TYPES.includes(file.type)) {
			setImageError("Only PNG, JPG, or WebP images are accepted.");
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			setImageError("Image must be under 5 MB.");
			return;
		}
		setImageError(null);
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
		// reset the input so the same file can be re-selected after clearing
		e.target.value = "";
	};

	const clearImage = () => {
		setImageFile(null);
		setImagePreview(null);
		setImageError(null);
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

		const handle = slugify(`${parsed.data.sku} ${parsed.data.description}`);

		const duplicate = draftItems.some(
			(i) =>
				slugify(`${i.sku} ${i.description}`) === handle &&
				i.localId !== editingLocalId,
		);
		if (duplicate) {
			setFormError("This product is already in the draft.");
			return;
		}

		const itemData = {
			...parsed.data,
			imageFile: imageFile ?? undefined,
			imagePreview: imagePreview ?? undefined,
		};

		if (editingLocalId) {
			updateItem(editingLocalId, itemData);
		} else {
			addItem(itemData);
		}

		resetForm();
	};

	const handleEdit = (item: ProductDraftItem) => {
		setSku(item.sku);
		setDescription(item.description);
		setUnitCost(String(item.unitCost));
		setImageFile(item.imageFile ?? null);
		setImagePreview(item.imagePreview ?? null);
		setFormError(null);
		setImageError(null);
		setEditingLocalId(item.localId);
	};

	const handleRemove = (localId: string) => {
		if (editingLocalId === localId) resetForm();
		removeItem(localId);
	};

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

				{/* Image picker */}
				<div className="space-y-1.5">
					<Label>
						Product Image{" "}
						<span className="text-slate-400 font-normal">(optional)</span>
					</Label>

					{imagePreview ? (
						<div className="relative w-full h-44 rounded-lg border border-slate-200 overflow-hidden">
							<Image
								src={imagePreview}
								alt="preview"
								fill
								className="object-cover"
							/>
							<button
								type="button"
								onClick={clearImage}
								className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
							>
								<X size={12} />
							</button>
						</div>
					) : (
						<div
							onClick={() => fileInputRef.current?.click()}
							className="flex flex-col items-center justify-center w-full h-44 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors gap-2"
						>
							<ImagePlus className="h-8 w-8 text-slate-300" />
							<div className="text-center">
								<p className="text-sm font-medium text-slate-500">
									Product Image
								</p>
								<p className="text-xs text-slate-400">
									PNG, JPG, WebP · max 5 MB
								</p>
							</div>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="mt-1 pointer-events-none"
							>
								<Upload size={13} className="mr-1.5" />
								Upload Image
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/webp"
								className="hidden"
								onChange={handleImageChange}
							/>
						</div>
					)}

					{imageError && <p className="text-sm text-red-600">{imageError}</p>}
				</div>

				{formError && <p className="text-sm text-red-600">{formError}</p>}

				{atLimit && !editingLocalId && (
					<p className="text-sm text-slate-500">
						Maximum {MAX_PRODUCT_DRAFT} products per batch.
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
						<Button type="button" variant="outline" onClick={resetForm}>
							Cancel
						</Button>
					)}
				</div>
			</form>

			{/* Draft card grid */}
			{draft.size > 0 && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
						Draft — {draft.size} of {MAX_PRODUCT_DRAFT}
					</p>
					<div className="grid grid-cols-2 gap-3">
						{draftItems.map((item) => (
							<ProductDraftCard
								key={item.localId}
								item={item}
								isEditing={editingLocalId === item.localId}
								onEdit={handleEdit}
								onRemove={handleRemove}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
