"use client";

import { ProductData } from "@/actions/products/fetch-products-action";
import { CartItem, cartLineKey, useCartStore } from "@/lib/store/product-store";
import { CatalogCard } from "./CatalogCard";
import { CatalogCardViewModel, CatalogUnit } from "./types";

interface CatalogGridProps {
	products: ProductData[];
	emptyMessage?: string;
}

const MAX_QUANTITY = 999;

const unitPrice = (product: ProductData, unit?: CatalogUnit): number => {
	if (unit === "Sleeve") return Number(product.sleevePrice ?? 0);
	if (unit === "Box") return Number(product.boxPrice ?? 0);
	return Number(product.unitCost);
};

const toCartItem = (
	product: ProductData,
	quantity: number,
	unit?: CatalogUnit,
): CartItem => {
	const price = unitPrice(product, unit);
	return {
		handle: product.handle,
		sku: product.sku,
		description: unit
			? `${product.description} (${unit})`
			: product.description,
		quantity,
		total: quantity * price,
		unitCost: price,
		imageUrl: product.imageUrl ?? null,
		unit: unit ?? null,
	};
};

const clampQuantity = (value: number) =>
	Math.max(0, Math.min(MAX_QUANTITY, Math.floor(value)));

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

	const handleQuantityChange = (
		product: ProductData,
		quantity: number,
		unit?: CatalogUnit,
	) => {
		setQuantity(toCartItem(product, clampQuantity(quantity), unit));
	};

	const handleToggleSelect = (product: ProductData, unit?: CatalogUnit) => {
		const key = cartLineKey({ handle: product.handle, unit: unit ?? null });
		if (getIsProductSelected(key)) {
			return;
		}
		const existingQty = maybeSelectedProducts.get(key)?.quantity ?? 0;
		const nextQty = existingQty > 0 ? existingQty : 1;
		setQuantity(toCartItem(product, nextQty, unit));
		toggleProduct(key);
	};

	const buildViewModel = (product: ProductData): CatalogCardViewModel => {
		const stateFor = (unit?: CatalogUnit) => {
			const key = cartLineKey({ handle: product.handle, unit: unit ?? null });
			return {
				price: unitPrice(product, unit),
				quantity: maybeSelectedProducts.get(key)?.quantity ?? 0,
				isSelected: getIsProductSelected(key),
			};
		};

		const base = {
			sku: product.sku,
			name: product.description,
			imageUrl: product.imageUrl ?? null,
			unitCost: Number(product.unitCost),
		};

		if (product.hasUnitOptions) {
			return {
				...base,
				quantity: 0,
				isSelected: false,
				unitOptions: {
					sleeve: stateFor("Sleeve"),
					box: stateFor("Box"),
				},
			};
		}

		const single = stateFor();
		return {
			...base,
			quantity: single.quantity,
			isSelected: single.isSelected,
			unitOptions: null,
		};
	};

	const hasRows = products.length > 0;

	return (
		<div className="w-full">
			{hasRows ? (
				<div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
					{products.map((product) => (
						<CatalogCard
							key={product.handle}
							item={buildViewModel(product)}
							onQuantityChange={(next, unit) =>
								handleQuantityChange(product, next, unit)
							}
							onToggleSelect={(unit) => handleToggleSelect(product, unit)}
						/>
					))}
				</div>
			) : (
				<div className="border border-dashed p-6 text-center text-sm text-muted-foreground">
					{emptyMessage}
				</div>
			)}
		</div>
	);
};
