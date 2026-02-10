"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { Loader2, Search, Check, Plus } from "lucide-react";
import {
	getProducts,
	createProduct,
	AdminProduct,
} from "@/actions/admin/products-actions";
import { grantEntitlement } from "@/actions/admin/entitlements-actions";

type AddEntitlementSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	existingProductIds: Set<string>;
	onEntitlementAdded: () => void;
};

export function AddEntitlementSheet({
	open,
	onOpenChange,
	userId,
	existingProductIds,
	onEntitlementAdded,
}: AddEntitlementSheetProps) {
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
		null,
	);
	const [customUnitCost, setCustomUnitCost] = useState("");
	const [granting, setGranting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Create new product inline state
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newSku, setNewSku] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [newUnitCost, setNewUnitCost] = useState("");
	const [creating, setCreating] = useState(false);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const result = await getProducts();
			setProducts(result.products);
			setLoaded(true);
		} catch (err) {
			console.error("Failed to fetch products:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		onOpenChange(isOpen);
		if (isOpen && !loaded) {
			fetchProducts();
		}
		if (!isOpen) {
			setSelectedProduct(null);
			setCustomUnitCost("");
			setSearchQuery("");
			setError(null);
			setShowCreateForm(false);
		}
	};

	const availableProducts = useMemo(
		() => products.filter((p) => !existingProductIds.has(p.id)),
		[products, existingProductIds],
	);

	const filteredProducts = useMemo(() => {
		if (!searchQuery.trim()) return availableProducts;
		const q = searchQuery.toLowerCase();
		return availableProducts.filter(
			(p) =>
				p.sku.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q),
		);
	}, [availableProducts, searchQuery]);

	const handleGrant = async () => {
		if (!selectedProduct) return;
		setGranting(true);
		setError(null);

		const result = await grantEntitlement({
			userId,
			productId: selectedProduct.id,
			customUnitCost: customUnitCost.trim()
				? parseFloat(customUnitCost)
				: undefined,
		});

		if (result.success) {
			onEntitlementAdded();
			onOpenChange(false);
		} else {
			setError(result.error ?? "Failed to grant entitlement");
		}
		setGranting(false);
	};

	const handleCreateAndGrant = async () => {
		if (!newSku.trim() || !newDescription.trim() || !newUnitCost.trim()) return;
		setCreating(true);
		setError(null);

		const createResult = await createProduct({
			sku: newSku.trim(),
			description: newDescription.trim(),
			unitCost: parseFloat(newUnitCost),
		});

		if (!createResult.success) {
			setError(createResult.error ?? "Failed to create product");
			setCreating(false);
			return;
		}

		// Refresh products to get the new product's ID
		const refreshed = await getProducts();
		setProducts(refreshed.products);
		const newProduct = refreshed.products.find((p) => p.sku === newSku.trim());

		if (!newProduct) {
			setError("Product created but could not find it. Try refreshing.");
			setCreating(false);
			return;
		}

		const grantResult = await grantEntitlement({
			userId,
			productId: newProduct.id,
			customUnitCost: customUnitCost.trim()
				? parseFloat(customUnitCost)
				: undefined,
		});

		if (grantResult.success) {
			onEntitlementAdded();
			onOpenChange(false);
		} else {
			setError(grantResult.error ?? "Failed to grant entitlement");
		}
		setCreating(false);
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent
				side="right"
				className="sm:max-w-2xl w-full overflow-y-auto"
			>
				<SheetHeader>
					<SheetTitle>Add Entitlement</SheetTitle>
					<SheetDescription>
						Select a product or create a new one to grant access.
					</SheetDescription>
				</SheetHeader>

				<div className="px-4 pb-4 space-y-4">
					{error && <p className="text-sm text-red-500">{error}</p>}

					{/* Toggle between select existing / create new */}
					<div className="flex items-center gap-2">
						<Button
							variant={!showCreateForm ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setShowCreateForm(false);
								setSelectedProduct(null);
							}}
						>
							Select Existing
						</Button>
						<Button
							variant={showCreateForm ? "default" : "outline"}
							size="sm"
							onClick={() => {
								setShowCreateForm(true);
								setSelectedProduct(null);
							}}
						>
							<Plus className="h-3 w-3 mr-1" />
							Create New
						</Button>
					</div>

					{!showCreateForm ? (
						<>
							{/* Search products */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
								<Input
									placeholder="Search products by SKU or description..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>

							{/* Products list */}
							{loading ? (
								<div className="flex items-center justify-center h-48">
									<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
								</div>
							) : (
								<div className="border rounded-md max-h-80 overflow-y-auto">
									{filteredProducts.length === 0 ? (
										<div className="p-4 text-center text-sm text-gray-500">
											{searchQuery
												? "No products match your search"
												: "All products already entitled"}
										</div>
									) : (
										filteredProducts.map((product) => (
											<button
												key={product.id}
												type="button"
												onClick={() => setSelectedProduct(product)}
												className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-gray-50 flex items-center justify-between text-sm transition-colors ${
													selectedProduct?.id === product.id
														? "bg-blue-50 border-blue-200"
														: ""
												}`}
											>
												<div>
													<span className="font-mono font-medium">
														{product.sku}
													</span>
													<span className="text-gray-500 ml-2">
														{product.description}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-gray-600">
														${product.unitCost.toFixed(2)}
													</span>
													{selectedProduct?.id === product.id && (
														<Check className="h-4 w-4 text-blue-600" />
													)}
												</div>
											</button>
										))
									)}
								</div>
							)}

							{/* Confirm section */}
							{selectedProduct && (
								<div className="border rounded-md p-3 space-y-3 bg-gray-50">
									<div className="text-sm">
										<span className="text-gray-500">Selected: </span>
										<span className="font-mono font-medium">
											{selectedProduct.sku}
										</span>
										<span className="text-gray-500 ml-1">
											- ${selectedProduct.unitCost.toFixed(2)}
										</span>
									</div>
									<div>
										<label className="text-xs text-gray-500">
											Custom Unit Cost (optional)
										</label>
										<Input
											value={customUnitCost}
											onChange={(e) => setCustomUnitCost(e.target.value)}
											placeholder={selectedProduct.unitCost.toFixed(2)}
											className="mt-1 h-8 text-sm w-32"
										/>
									</div>
									<Button
										onClick={handleGrant}
										disabled={granting}
										className="w-full"
									>
										{granting && (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										)}
										Grant Entitlement
									</Button>
								</div>
							)}
						</>
					) : (
						/* Create new product form */
						<div className="space-y-3">
							<div>
								<label className="text-xs text-gray-500">SKU</label>
								<Input
									value={newSku}
									onChange={(e) => setNewSku(e.target.value)}
									placeholder="e.g. PROD-001"
									className="mt-1 h-8 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs text-gray-500">Description</label>
								<Input
									value={newDescription}
									onChange={(e) => setNewDescription(e.target.value)}
									placeholder="Product description"
									className="mt-1 h-8 text-sm"
								/>
							</div>
							<div>
								<label className="text-xs text-gray-500 pr-6">Unit Cost</label>
								<Input
									value={newUnitCost}
									onChange={(e) => setNewUnitCost(e.target.value)}
									placeholder="0.00"
									className="mt-1 h-8 text-sm w-32"
								/>
							</div>
							<div>
								<label className="text-xs text-gray-500">
									Custom Unit Cost for this user (optional)
								</label>
								<Input
									value={customUnitCost}
									onChange={(e) => setCustomUnitCost(e.target.value)}
									placeholder="Leave empty to use base cost"
									className="mt-1 h-8 text-sm w-32"
								/>
							</div>
							<Button
								onClick={handleCreateAndGrant}
								disabled={
									creating ||
									!newSku.trim() ||
									!newDescription.trim() ||
									!newUnitCost.trim()
								}
								className="w-full"
							>
								{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								Create Product & Grant Entitlement
							</Button>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
