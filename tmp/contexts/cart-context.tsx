// "use client";

// import * as React from "react";
// import type { ProductRow } from "@/app/dashboard/[uuid]/order/page";

// interface CartItem {
// 	product: ProductRow;
// 	quantity: number;
// 	selected: boolean;
// }

// interface CartContextType {
// 	items: Map<number, CartItem>;
// 	addItem: (index: number, product: ProductRow) => void;
// 	updateQuantity: (index: number, quantity: number) => void;
// 	toggleSelection: (index: number) => void;
// 	removeItem: (index: number) => void;
// 	getItem: (index: number) => CartItem | undefined;
// 	getSelectedItems: () => CartItem[];
// 	hasSelectedItems: () => boolean;
// 	clearCart: () => void;
// }

// const CartContext = React.createContext<CartContextType | undefined>(undefined);

// const CART_STORAGE_KEY = "nextgen-packaging-cart";

// // Helper functions to serialize/deserialize cart items
// function saveCartToStorage(items: Map<number, CartItem>) {
// 	try {
// 		const serialized = Array.from(items.entries()).map(([index, item]) => [
// 			index,
// 			item,
// 		]);
// 		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serialized));
// 	} catch (error) {
// 		console.error("Failed to save cart to localStorage:", error);
// 	}
// }

// function loadCartFromStorage(): Map<number, CartItem> {
// 	try {
// 		const stored = localStorage.getItem(CART_STORAGE_KEY);
// 		if (stored) {
// 			const parsed = JSON.parse(stored) as Array<[number, CartItem]>;
// 			return new Map(parsed);
// 		}
// 	} catch (error) {
// 		console.error("Failed to load cart from localStorage:", error);
// 	}
// 	return new Map();
// }

// export function CartProvider({ children }: { children: React.ReactNode }) {
// 	const [items, setItems] = React.useState<Map<number, CartItem>>(new Map());
// 	const [isHydrated, setIsHydrated] = React.useState(false);

// 	// Load from localStorage after mount to avoid hydration mismatch
// 	React.useEffect(() => {
// 		const savedItems = loadCartFromStorage();
// 		if (savedItems.size > 0) {
// 			setItems(savedItems);
// 		}
// 		setIsHydrated(true);
// 	}, []);

// 	// Save to localStorage whenever items change (but only after hydration)
// 	React.useEffect(() => {
// 		if (isHydrated && typeof window !== "undefined") {
// 			saveCartToStorage(items);
// 		}
// 	}, [items, isHydrated]);

// 	const addItem = React.useCallback((index: number, product: ProductRow) => {
// 		setItems((prev) => {
// 			const newMap = new Map(prev);
// 			if (!newMap.has(index)) {
// 				newMap.set(index, {
// 					product,
// 					quantity: 0,
// 					selected: false,
// 				});
// 			}
// 			return newMap;
// 		});
// 	}, []);

// 	const updateQuantity = React.useCallback(
// 		(index: number, quantity: number) => {
// 			setItems((prev) => {
// 				const newMap = new Map(prev);
// 				const item = newMap.get(index);
// 				if (item) {
// 					newMap.set(index, {
// 						...item,
// 						quantity: Math.max(0, quantity),
// 					});
// 				}
// 				return newMap;
// 			});
// 		},
// 		[],
// 	);

// 	const toggleSelection = React.useCallback((index: number) => {
// 		setItems((prev) => {
// 			const newMap = new Map(prev);
// 			const item = newMap.get(index);
// 			if (item) {
// 				newMap.set(index, {
// 					...item,
// 					selected: !item.selected,
// 				});
// 			}
// 			return newMap;
// 		});
// 	}, []);

// 	const removeItem = React.useCallback((index: number) => {
// 		setItems((prev) => {
// 			const newMap = new Map(prev);
// 			newMap.delete(index);
// 			return newMap;
// 		});
// 	}, []);

// 	const getItem = React.useCallback(
// 		(index: number) => {
// 			return items.get(index);
// 		},
// 		[items],
// 	);

// 	const getSelectedItems = React.useCallback(() => {
// 		return Array.from(items.values()).filter(
// 			(item) => item.selected && item.quantity > 0,
// 		);
// 	}, [items]);

// 	const hasSelectedItems = React.useCallback(() => {
// 		return Array.from(items.values()).some(
// 			(item) => item.selected && item.quantity > 0,
// 		);
// 	}, [items]);

// 	const clearCart = React.useCallback(() => {
// 		setItems(new Map());
// 		if (typeof window !== "undefined") {
// 			localStorage.removeItem(CART_STORAGE_KEY);
// 		}
// 	}, []);

// 	const value = React.useMemo(
// 		() => ({
// 			items,
// 			addItem,
// 			updateQuantity,
// 			toggleSelection,
// 			removeItem,
// 			getItem,
// 			getSelectedItems,
// 			hasSelectedItems,
// 			clearCart,
// 		}),
// 		[
// 			items,
// 			addItem,
// 			updateQuantity,
// 			toggleSelection,
// 			removeItem,
// 			getItem,
// 			getSelectedItems,
// 			hasSelectedItems,
// 			clearCart,
// 		],
// 	);

// 	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// }

// export function useCart() {
// 	const context = React.useContext(CartContext);
// 	if (context === undefined) {
// 		throw new Error("useCart must be used within a CartProvider");
// 	}
// 	return context;
// }
