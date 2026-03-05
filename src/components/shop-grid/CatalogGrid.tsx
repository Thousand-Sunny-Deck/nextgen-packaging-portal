"use client";

import { ProductData } from "@/actions/products/fetch-products-action";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CatalogCard } from "./CatalogCard";
import { catalogColumns, getCardViewModel } from "./catalog-columns";
import { CoolCartSheet } from "./CoolCartSheet";
import { CatalogRow } from "./types";

interface CatalogGridProps {
	products: ProductData[];
	emptyMessage?: string;
}

const MAX_QUANTITY = 999;

const toCartItem = (product: ProductData, quantity: number): CartItem => ({
	handle: product.handle,
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
	const [isCartOpen, setIsCartOpen] = useState(false);
	const {
		maybeSelectedProducts,
		selectedProductHandles,
		setQuantity,
		getIsProductSelected,
		prepareCartForCheckout,
		toggleProduct,
	} = useCartStore();
	const router = useRouter();
	const pathname = usePathname();

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
	const imageByHandle = useMemo(
		() =>
			new Map(
				products.map((product) => [product.handle, product.imageUrl ?? null]),
			),
		[products],
	);
	const cartItems = useMemo<CartItem[]>(
		() =>
			Array.from(selectedProductHandles)
				.map((handle) => maybeSelectedProducts.get(handle))
				.filter((item): item is CartItem => Boolean(item)),
		[selectedProductHandles, maybeSelectedProducts],
	);
	const cartSize = cartItems.length;
	const cartSubtotal = useMemo(
		() =>
			cartItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
		[cartItems],
	);

	const handleCardQuantityChange = (product: ProductData, quantity: number) => {
		const safeQuantity = Math.max(
			0,
			Math.min(MAX_QUANTITY, Math.floor(quantity)),
		);
		setQuantity(toCartItem(product, safeQuantity));
	};

	const handleCartQuantityChange = (handle: string, quantity: number) => {
		const existing = maybeSelectedProducts.get(handle);
		if (!existing) return;

		const safeQuantity = Math.max(
			0,
			Math.min(MAX_QUANTITY, Math.floor(quantity)),
		);
		setQuantity({ ...existing, quantity: safeQuantity });
	};

	const handleRemoveFromCart = (handle: string) => {
		const existing = maybeSelectedProducts.get(handle);
		if (!existing) return;
		setQuantity({ ...existing, quantity: 0 });
	};

	const handleCheckout = () => {
		const match = pathname.match(/^\/dashboard\/([^/]+)(?:\/.*)?$/);
		const uuid = match?.[1];
		if (!uuid) return;

		prepareCartForCheckout();
		setIsCartOpen(false);
		router.push(`/dashboard/${uuid}/order/checkout`);
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
								onQuantityChange={(next) =>
									handleCardQuantityChange(product, next)
								}
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

			<CoolCartSheet
				isOpen={isCartOpen}
				onOpenChange={setIsCartOpen}
				cartItems={cartItems}
				cartSize={cartSize}
				cartSubtotal={cartSubtotal}
				imageByHandle={imageByHandle}
				onQuantityChange={handleCartQuantityChange}
				onDelete={handleRemoveFromCart}
				onCheckout={handleCheckout}
			/>
		</div>
	);
};
