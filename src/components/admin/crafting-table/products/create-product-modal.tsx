"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
	createProduct,
	CreateProductInput,
} from "@/actions/admin/products-actions";
import { toast } from "sonner";

interface CreateProductModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProductCreated: () => void;
}

type Step = "form" | "confirm";

export function CreateProductModal({
	open,
	onOpenChange,
	onProductCreated,
}: CreateProductModalProps) {
	const [step, setStep] = useState<Step>("form");
	const [loading, setLoading] = useState(false);

	// Form state
	const [sku, setSku] = useState("");
	const [description, setDescription] = useState("");
	const [unitCost, setUnitCost] = useState("");

	const resetForm = () => {
		setStep("form");
		setSku("");
		setDescription("");
		setUnitCost("");
	};

	const handleClose = () => {
		resetForm();
		onOpenChange(false);
	};

	const handleSubmitForm = (e: React.FormEvent) => {
		e.preventDefault();
		if (!sku.trim() || !description.trim() || !unitCost.trim()) {
			toast.error("All fields are required");
			return;
		}
		const cost = parseFloat(unitCost);
		if (isNaN(cost) || cost < 0) {
			toast.error("Unit cost must be a valid positive number");
			return;
		}
		setStep("confirm");
	};

	const handleConfirm = async () => {
		setLoading(true);

		const input: CreateProductInput = {
			sku: sku.trim(),
			description: description.trim(),
			unitCost: parseFloat(unitCost),
		};

		try {
			const result = await createProduct(input);

			if (result.success) {
				toast.success("Product created successfully");
				onProductCreated();
				handleClose();
			} else {
				toast.error(result.error || "Failed to create product");
				setStep("form");
			}
		} catch {
			toast.error("Failed to create product");
			setStep("form");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				{step === "form" && (
					<>
						<DialogHeader>
							<DialogTitle>Create New Product</DialogTitle>
							<DialogDescription>
								Add a new product to the catalog.
							</DialogDescription>
						</DialogHeader>

						<form onSubmit={handleSubmitForm} className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="sku">SKU *</Label>
								<Input
									id="sku"
									value={sku}
									onChange={(e) => setSku(e.target.value)}
									placeholder="PKG-SM-001"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description *</Label>
								<Input
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Small Packaging Box (10x10x10)"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="unitCost">Unit Cost *</Label>
								<Input
									id="unitCost"
									type="number"
									step="0.01"
									min="0"
									value={unitCost}
									onChange={(e) => setUnitCost(e.target.value)}
									placeholder="5.99"
									required
								/>
							</div>

							<DialogFooter className="pt-4">
								<Button type="button" variant="outline" onClick={handleClose}>
									Cancel
								</Button>
								<Button type="submit">Continue</Button>
							</DialogFooter>
						</form>
					</>
				)}

				{step === "confirm" && (
					<>
						<DialogHeader>
							<DialogTitle>Confirm Product Creation</DialogTitle>
							<DialogDescription>
								Are you sure you want to create this product?
							</DialogDescription>
						</DialogHeader>

						<div className="py-4">
							<div className="bg-gray-50 rounded-md p-4 space-y-2">
								<p>
									<span className="text-gray-500">SKU:</span>{" "}
									<span className="font-mono font-medium">{sku}</span>
								</p>
								<p>
									<span className="text-gray-500">Description:</span>{" "}
									<span className="font-medium">{description}</span>
								</p>
								<p>
									<span className="text-gray-500">Unit Cost:</span>{" "}
									<span className="font-medium">
										${parseFloat(unitCost).toFixed(2)}
									</span>
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep("form")}
								disabled={loading}
							>
								Back
							</Button>
							<Button onClick={handleConfirm} disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Yes, Create Product"
								)}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
