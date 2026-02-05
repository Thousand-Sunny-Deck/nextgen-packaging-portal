"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Loader2, Package } from "lucide-react";
import { ProductsDataTable } from "./products-data-table";
import { productsColumns } from "./products-columns";
import { CreateProductModal } from "./create-product-modal";
import { getProducts, AdminProduct } from "@/actions/admin/products-actions";

export function ProductsTab() {
	const [products, setProducts] = useState<AdminProduct[]>([]);
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const result = await getProducts();
			setProducts(result.products);
			setLoaded(true);
		} catch (error) {
			console.error("Failed to fetch products:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleProductCreated = () => {
		fetchProducts();
	};

	return (
		<div className="space-y-4">
			{/* Header with buttons */}
			<div className="flex items-center justify-end gap-2">
				<Button variant="outline" onClick={fetchProducts} disabled={loading}>
					{loading ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4 mr-2" />
					)}
					{loaded ? "Refresh" : "Load Products"}
				</Button>
				<Button onClick={() => setCreateModalOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Create Product
				</Button>
			</div>

			{/* Data table or empty state */}
			{!loaded ? (
				<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
					<Package className="h-12 w-12 text-gray-300 mb-4" />
					<p className="text-gray-500 mb-4">
						Click Load Products to fetch data
					</p>
				</div>
			) : (
				<ProductsDataTable columns={productsColumns} data={products} />
			)}

			{/* Create product modal */}
			<CreateProductModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
				onProductCreated={handleProductCreated}
			/>
		</div>
	);
}
