"use client";

import * as React from "react";
import type { ProductRow } from "@/app/dashboard/[uuid]/orders/page";

interface CartItem {
	product: ProductRow;
	quantity: number;
	selected: boolean;
}

interface CartContextType {
	items: Map<number, CartItem>;
	addItem: (index: number, product: ProductRow) => void;
	updateQuantity: (index: number, quantity: number) => void;
	toggleSelection: (index: number) => void;
	removeItem: (index: number) => void;
	getItem: (index: number) => CartItem | undefined;
	getSelectedItems: () => CartItem[];
	hasSelectedItems: () => boolean;
	clearCart: () => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = React.useState<Map<number, CartItem>>(new Map());

	const addItem = React.useCallback((index: number, product: ProductRow) => {
		setItems((prev) => {
			const newMap = new Map(prev);
			if (!newMap.has(index)) {
				newMap.set(index, {
					product,
					quantity: 0,
					selected: false,
				});
			}
			return newMap;
		});
	}, []);

	const updateQuantity = React.useCallback(
		(index: number, quantity: number) => {
			setItems((prev) => {
				const newMap = new Map(prev);
				const item = newMap.get(index);
				if (item) {
					newMap.set(index, {
						...item,
						quantity: Math.max(0, quantity),
					});
				}
				return newMap;
			});
		},
		[],
	);

	const toggleSelection = React.useCallback((index: number) => {
		setItems((prev) => {
			const newMap = new Map(prev);
			const item = newMap.get(index);
			if (item) {
				newMap.set(index, {
					...item,
					selected: !item.selected,
				});
			}
			return newMap;
		});
	}, []);

	const removeItem = React.useCallback((index: number) => {
		setItems((prev) => {
			const newMap = new Map(prev);
			newMap.delete(index);
			return newMap;
		});
	}, []);

	const getItem = React.useCallback(
		(index: number) => {
			return items.get(index);
		},
		[items],
	);

	const getSelectedItems = React.useCallback(() => {
		return Array.from(items.values()).filter(
			(item) => item.selected && item.quantity > 0,
		);
	}, [items]);

	const hasSelectedItems = React.useCallback(() => {
		return Array.from(items.values()).some(
			(item) => item.selected && item.quantity > 0,
		);
	}, [items]);

	const clearCart = React.useCallback(() => {
		setItems(new Map());
	}, []);

	const value = React.useMemo(
		() => ({
			items,
			addItem,
			updateQuantity,
			toggleSelection,
			removeItem,
			getItem,
			getSelectedItems,
			hasSelectedItems,
			clearCart,
		}),
		[
			items,
			addItem,
			updateQuantity,
			toggleSelection,
			removeItem,
			getItem,
			getSelectedItems,
			hasSelectedItems,
			clearCart,
		],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = React.useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}
