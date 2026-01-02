// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductData } from "../products/products";

interface CartItem {
	sku: string;
	quantity: number;
}

export type ProductTableStore = ProductData & {
	quantity: number;
	total: number;
};

interface CartStore {
	items: Map<string, CartItem>;
	setQuantity: (sku: string, quantity: number) => void;
	getQuantity: (sku: string) => number;
	clear: () => void;
}

export interface CartItemBetter {
	sku: string;
	quantity: number;
	description: string;
	total: number;
	unitCost: number;
}

interface CartStoreBetter {
	maybeSelectedProducts: Map<string, CartItemBetter>;
	selectedProductSkus: Set<string>;
	toggleProduct: (productInfo: CartItemBetter) => void;
	clearSelection: () => void;
	getSelectedProducts: () => CartItemBetter[];
	updateQuantity: (productInfo: CartItemBetter) => void;
	getQuantity: (sku: string) => number;
}

export const useCartStoreBetter = create<CartStoreBetter>((set, get) => ({
	products: [],
	maybeSelectedProducts: new Map<string, CartItemBetter>(),
	selectedProductSkus: new Set<string>(),

	toggleProduct: (cartItem: CartItemBetter) =>
		set((state) => {
			const newSet = new Set(state.selectedProductSkus);
			const sku = cartItem.sku;
			if (newSet.has(sku)) {
				newSet.delete(sku);
			} else {
				newSet.add(sku);
			}

			return { selectedProductSkus: newSet };
		}),

	clearSelection: () =>
		set({
			maybeSelectedProducts: new Map(),
		}),

	updateQuantity: (productInfo) =>
		set((state) => {
			const newMap = new Map(state.maybeSelectedProducts);
			const { sku, unitCost, quantity } = productInfo;

			const totalCost = quantity * unitCost;
			newMap.set(sku, {
				...productInfo,
				total: totalCost,
			});

			return {
				maybeSelectedProducts: newMap,
			};
		}),

	getQuantity: (sku) => {
		const { maybeSelectedProducts } = get();
		const quantity = maybeSelectedProducts.get(sku);
		return quantity !== undefined ? quantity.quantity : 0;
	},

	getSelectedProducts: () => {
		const { selectedProductSkus, maybeSelectedProducts } = get();
		const selectedSkus = Array.from(selectedProductSkus.values());
		return selectedSkus
			.map((sku) => {
				return maybeSelectedProducts.get(sku);
			})
			.filter((selectedProduct) => selectedProduct !== undefined);
	},
}));

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			items: new Map(),

			setQuantity: (sku, quantity) => {
				set((state) => {
					const newItems = new Map(state.items);
					if (quantity > 0) {
						newItems.set(sku, { sku, quantity });
					} else {
						newItems.delete(sku);
					}
					return { items: newItems };
				});
			},

			getQuantity: (sku) => {
				return get().items.get(sku)?.quantity || 0;
			},

			clear: () => set({ items: new Map() }),
		}),
		{
			name: "cart-storage",
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					const { state } = JSON.parse(str);
					return {
						state: {
							...state,
							items: new Map(Object.entries(state.items || {})),
						},
					};
				},
				setItem: (name, value) => {
					localStorage.setItem(
						name,
						JSON.stringify({
							state: {
								...value.state,
								items: Object.fromEntries(value.state.items),
							},
						}),
					);
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
