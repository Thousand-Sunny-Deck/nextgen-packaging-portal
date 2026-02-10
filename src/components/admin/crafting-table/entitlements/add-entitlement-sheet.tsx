"use client";

import { useState, useCallback } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	Loader2,
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Package,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
	getAvailableProducts,
	batchGrantEntitlements,
	type AvailableProduct,
	type GrantEntitlementEntry,
} from "@/actions/admin/entitlements-actions";
import { GrantProductsDataTable } from "./grant-products-data-table";
import { grantProductsColumns } from "./grant-products-columns";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductCustomization {
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
}

type Step = "select" | "review";

interface AddEntitlementSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	onEntitlementsGranted: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddEntitlementSheet({
	open,
	onOpenChange,
	userId,
	onEntitlementsGranted,
}: AddEntitlementSheetProps) {
	const [step, setStep] = useState<Step>("select");

	// Products loading
	const [products, setProducts] = useState<AvailableProduct[]>([]);
	const [productsLoaded, setProductsLoaded] = useState(false);
	const [productsLoading, setProductsLoading] = useState(false);

	// Selections: productId → customization
	const [selections, setSelections] = useState<
		Map<string, ProductCustomization>
	>(new Map());

	// Submitting
	const [isSubmitting, setIsSubmitting] = useState(false);

	// ─── Load Products ─────────────────────────────────────────────────────

	const loadProducts = useCallback(async () => {
		setProductsLoading(true);
		try {
			const result = await getAvailableProducts(userId);
			setProducts(result.products);
			setProductsLoaded(true);
		} catch (error) {
			console.error("Failed to load products:", error);
			toast.error("Failed to load products");
		} finally {
			setProductsLoading(false);
		}
	}, [userId]);

	// ─── Selection Helpers ─────────────────────────────────────────────────

	const toggleProduct = useCallback((productId: string) => {
		setSelections((prev) => {
			const next = new Map(prev);
			if (next.has(productId)) {
				next.delete(productId);
			} else {
				next.set(productId, {
					customSku: null,
					customDescription: null,
					customUnitCost: null,
				});
			}
			return next;
		});
	}, []);

	const selectAllAvailable = useCallback(() => {
		setSelections((prev) => {
			const next = new Map(prev);
			for (const product of products) {
				if (!product.alreadyEntitled && !next.has(product.id)) {
					next.set(product.id, {
						customSku: null,
						customDescription: null,
						customUnitCost: null,
					});
				}
			}
			return next;
		});
	}, [products]);

	const deselectAll = useCallback(() => {
		setSelections(new Map());
	}, []);

	const updateCustomization = useCallback(
		(productId: string, partial: Partial<ProductCustomization>) => {
			setSelections((prev) => {
				const next = new Map(prev);
				const existing = next.get(productId);
				if (existing) {
					next.set(productId, { ...existing, ...partial });
				}
				return next;
			});
		},
		[],
	);

	// ─── Submit ────────────────────────────────────────────────────────────

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			const entries: GrantEntitlementEntry[] = Array.from(
				selections.entries(),
			).map(([productId, custom]) => ({
				productId,
				customSku: custom.customSku,
				customDescription: custom.customDescription,
				customUnitCost: custom.customUnitCost,
			}));

			const result = await batchGrantEntitlements({
				userId,
				entries,
			});

			if (!result.success) {
				toast.error(result.error || "Failed to grant entitlements");
				return;
			}

			toast.success(
				`Successfully entitled ${entries.length} product${entries.length > 1 ? "s" : ""}`,
			);
			confetti({
				particleCount: 200,
				spread: 70,
				origin: { x: 0, y: 0.6 },
			});
			confetti({
				particleCount: 200,
				spread: 70,
				origin: { x: 1, y: 0.6 },
			});

			onEntitlementsGranted();
			handleClose();
		} catch (error) {
			console.error("Failed to grant entitlements:", error);
			toast.error("Failed to grant entitlements");
		} finally {
			setIsSubmitting(false);
		}
	};

	// ─── Reset & Close ─────────────────────────────────────────────────────

	const handleClose = () => {
		if (isSubmitting) return;
		setStep("select");
		setSelections(new Map());
		setProducts([]);
		setProductsLoaded(false);
		onOpenChange(false);
	};

	const selectedCount = selections.size;

	return (
		<Sheet
			open={open}
			onOpenChange={(v) => {
				if (isSubmitting) return;
				if (!v) handleClose();
			}}
		>
			<SheetContent
				side="right"
				className="!w-full !max-w-full sm:!max-w-3xl flex flex-col"
				showCloseButton={!isSubmitting}
			>
				{/* ── Header ── */}
				<SheetHeader>
					<SheetTitle>
						{step === "select"
							? "Add Entitlements"
							: `Review (${selectedCount} selected)`}
					</SheetTitle>
					<SheetDescription>
						{step === "select"
							? "Select products to entitle to this user. You can customise fields per product."
							: "Review the products below before confirming."}
					</SheetDescription>
				</SheetHeader>

				{/* ── Body ── */}
				<div className="flex-1 overflow-y-auto px-4">
					{step === "select" && (
						<SelectStep
							products={products}
							productsLoaded={productsLoaded}
							productsLoading={productsLoading}
							loadProducts={loadProducts}
							selections={selections}
							toggleProduct={toggleProduct}
							selectAllAvailable={selectAllAvailable}
							deselectAll={deselectAll}
							updateCustomization={updateCustomization}
						/>
					)}

					{step === "review" && (
						<ReviewStep
							products={products}
							selections={selections}
							isSubmitting={isSubmitting}
						/>
					)}
				</div>

				{/* ── Footer ── */}
				<SheetFooter className="flex-row justify-between border-t pt-4">
					{step === "select" ? (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								onClick={() => setStep("review")}
								disabled={selectedCount === 0}
							>
								Next ({selectedCount})
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outline"
								onClick={() => setStep("select")}
								disabled={isSubmitting}
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button onClick={handleConfirm} disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Granting...
									</>
								) : (
									<>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										Confirm {selectedCount} Entitlement
										{selectedCount > 1 ? "s" : ""}
									</>
								)}
							</Button>
						</>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

// ─── Select Step (placeholder for Step 3 table) ─────────────────────────────

function SelectStep({
	products,
	productsLoaded,
	productsLoading,
	loadProducts,
	selections,
	toggleProduct,
	selectAllAvailable,
	deselectAll,
	updateCustomization,
}: {
	products: AvailableProduct[];
	productsLoaded: boolean;
	productsLoading: boolean;
	loadProducts: () => void;
	selections: Map<string, ProductCustomization>;
	toggleProduct: (id: string) => void;
	selectAllAvailable: () => void;
	deselectAll: () => void;
	updateCustomization: (
		id: string,
		partial: Partial<ProductCustomization>,
	) => void;
}) {
	if (!productsLoaded) {
		return (
			<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
				<Package className="h-12 w-12 text-gray-300 mb-4" />
				<p className="text-gray-500 mb-4">Load products to get started</p>
				<Button onClick={loadProducts} disabled={productsLoading}>
					{productsLoading ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<Package className="h-4 w-4 mr-2" />
					)}
					Load Products
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{selections.size} product{selections.size !== 1 ? "s" : ""} selected
				</p>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" onClick={deselectAll}>
						Deselect All
					</Button>
					<Button variant="outline" size="sm" onClick={selectAllAvailable}>
						Select All Available
					</Button>
				</div>
			</div>

			<GrantProductsDataTable
				columns={grantProductsColumns}
				data={products}
				selections={selections}
				toggleProduct={toggleProduct}
				updateCustomization={updateCustomization}
			/>
		</div>
	);
}

// ─── Review Step (placeholder for Step 4) ────────────────────────────────────

function ReviewStep({
	products,
	selections,
	isSubmitting,
}: {
	products: AvailableProduct[];
	selections: Map<string, ProductCustomization>;
	isSubmitting: boolean;
}) {
	const productsById = new Map(products.map((p) => [p.id, p]));

	return (
		<div
			className={`space-y-4 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
		>
			<p className="text-sm text-muted-foreground">
				The following {selections.size} product
				{selections.size !== 1 ? "s" : ""} will be entitled to this user:
			</p>

			<div className="space-y-2">
				{Array.from(selections.entries()).map(([productId, custom]) => {
					const product = productsById.get(productId);
					if (!product) return null;
					return (
						<div
							key={productId}
							className="rounded-md border p-3 text-sm space-y-1"
						>
							<p className="font-medium font-mono">{product.sku}</p>
							<p className="text-muted-foreground">{product.description}</p>
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<span>Base cost: ${product.unitCost.toFixed(2)}</span>
								{custom.customSku && (
									<span>Custom SKU: {custom.customSku}</span>
								)}
								{custom.customDescription && (
									<span>Custom desc: {custom.customDescription}</span>
								)}
								{custom.customUnitCost !== null && (
									<span>Custom cost: ${custom.customUnitCost.toFixed(2)}</span>
								)}
								{!custom.customSku &&
									!custom.customDescription &&
									custom.customUnitCost === null && (
										<span className="italic">Using defaults</span>
									)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
