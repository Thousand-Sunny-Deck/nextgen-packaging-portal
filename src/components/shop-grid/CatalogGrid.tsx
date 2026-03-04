"use client";

import { ProductData } from "@/actions/products/fetch-products-action";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { CatalogCard } from "./CatalogCard";
import { catalogColumns, getCardViewModel } from "./catalog-columns";
import { CatalogRow } from "./types";

interface CatalogGridProps {
	products: ProductData[];
	emptyMessage?: string;
}

const MAX_QUANTITY = 999;

const toCartItem = (product: ProductData, quantity: number): CartItem => ({
	sku: product.sku,
	description: product.description,
	quantity,
	total: quantity * Number(product.unitCost),
	unitCost: Number(product.unitCost),
});

export const CatalogGrid = ({
	products,
	emptyMessage = "No products found.",
}: CatalogGridProps) => {
	const {
		maybeSelectedProducts,
		setQuantity,
		getIsProductSelected,
		toggleProduct,
	} = useCartStore();

	const rows = useMemo<CatalogRow[]>(() => {
		return products.map((product) => {
			const quantity = maybeSelectedProducts.get(product.handle)?.quantity ?? 0;
			return {
				...product,
				quantity,
				total: Number(product.unitCost) * quantity,
				isSelected: getIsProductSelected(product.handle),
			};
		});
	}, [products, maybeSelectedProducts, getIsProductSelected]);

	const table = useReactTable({
		data: rows,
		columns: catalogColumns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.handle,
	});

	const visibleRows = table.getCoreRowModel().rows;
	const hasRows = visibleRows.length > 0;

	const handleQuantityChange = (product: ProductData, quantity: number) => {
		const safeQuantity = Math.max(
			0,
			Math.min(MAX_QUANTITY, Math.floor(quantity)),
		);
		const wasSelected = getIsProductSelected(product.handle);
		setQuantity(toCartItem(product, safeQuantity));

		// Keep quantity updates as a middle state; explicit button click adds to cart.
		if (safeQuantity > 0 && !wasSelected) {
			toggleProduct(product.handle);
		}
	};

	return (
		<div className="w-full">
			{hasRows ? (
				<div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
					{visibleRows.map((row) => {
						const product = row.original;
						const item = getCardViewModel(product);

						return (
							<CatalogCard
								key={product.handle}
								item={item}
								onQuantityChange={(next) => handleQuantityChange(product, next)}
								onToggleSelect={() => toggleProduct(product.handle)}
							/>
						);
					})}
				</div>
			) : (
				<div className="border border-dashed p-6 text-center text-sm text-muted-foreground">
					{emptyMessage}
				</div>
			)}
		</div>
	);
};
