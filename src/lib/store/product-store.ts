// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductData } from "../products/products";

export interface CartItem {
	sku: string;
	quantity: number;
	description: string;
	total: number;
	unitCost: number;
}

export type ProductTableStore = ProductData & {
	quantity: number;
	total: number;
};

interface CartStore {
	maybeSelectedProducts: Map<string, CartItem>;
	selectedProductSkus: Set<string>;
	setQuantity: (cartInfo: CartItem) => void;
	getQuantity: (sku: string) => number;
	clear: () => void;

	// is Row checked?
	getIsProductSelected: (sku: string) => boolean;

	// Onchange -> toggle product
	toggleProduct: (sku: string) => void;

	// can select product
	canSelectProduct: (sku: string) => boolean;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			maybeSelectedProducts: new Map(),
			selectedProductSkus: new Set(),

			setQuantity: (cartInfo) => {
				set((state) => {
					const newMap = new Map(state.maybeSelectedProducts);
					const { quantity, sku, unitCost } = cartInfo;
					const totalCost = quantity * unitCost;

					if (quantity <= 0) {
						const newSet = new Set(state.selectedProductSkus);
						newMap.delete(sku);
						newSet.delete(sku);
						return {
							maybeSelectedProducts: newMap,
							selectedProductSkus: newSet,
						};
					}

					newMap.set(sku, {
						...cartInfo,
						total: totalCost,
					});

					return {
						maybeSelectedProducts: newMap,
					};
				});
			},

			getQuantity: (sku) => {
				return get().maybeSelectedProducts.get(sku)?.quantity || 0;
			},

			clear: () => set({ maybeSelectedProducts: new Map() }),

			getIsProductSelected: (sku) => {
				const { selectedProductSkus } = get();
				return selectedProductSkus.has(sku);
			},

			toggleProduct: (sku) => {
				set((state) => {
					const selectedProductSkus = state.selectedProductSkus;
					const newSet = new Set(selectedProductSkus);

					if (newSet.has(sku)) {
						newSet.delete(sku);
					} else {
						newSet.add(sku);
					}

					return {
						selectedProductSkus: newSet,
					};
				});
			},

			canSelectProduct: (sku) => {
				const { maybeSelectedProducts } = get();
				return maybeSelectedProducts.has(sku);
			},
		}),
		{
			name: "cart-storage",
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					const { state } = JSON.parse(str);
					const newSet = new Set(
						state.selectedProductSkus || [],
					) as Set<string>;
					return {
						state: {
							...state,
							maybeSelectedProducts: new Map(
								Object.entries(state.maybeSelectedProducts || {}),
							),
							selectedProductSkus: newSet,
						},
					};
				},
				setItem: (name, value) => {
					localStorage.setItem(
						name,
						JSON.stringify({
							state: {
								...value.state,
								maybeSelectedProducts: Object.fromEntries(
									value.state.maybeSelectedProducts,
								),
								selectedProductSkus: Array.from(
									value.state.selectedProductSkus,
								),
							},
						}),
					);
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
