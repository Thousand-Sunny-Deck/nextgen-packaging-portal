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
	cart: CartItem[];
	cartSize: number;
	totalCost: number;

	setQuantity: (cartInfo: CartItem) => void;
	getQuantity: (sku: string) => number;
	clearCart: () => void;

	// is Row checked?
	getIsProductSelected: (sku: string) => boolean;

	// Onchange -> toggle product
	toggleProduct: (sku: string) => void;

	// can select product
	canSelectProduct: (sku: string) => boolean;

	// Toggle all enabled products (select/deselect all)
	toggleAllProducts: (selectAll: boolean) => void;

	// Get all enabled SKUs
	getEnabledSkus: () => string[];

	// Check if all enabled products are selected
	areAllEnabledProductsSelected: () => boolean;

	// Check if some but not all enabled products are selected
	areSomeEnabledProductsSelected: () => boolean;

	getCart: () => CartItem[];
	getTotalCartCost: () => number;

	prepareCartForCheckout: () => void;
}

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			maybeSelectedProducts: new Map(),
			selectedProductSkus: new Set(),
			cart: [],
			cartSize: 0,
			totalCost: 0,

			setQuantity: (cartInfo) => {
				set((state) => {
					const newMap = new Map(state.maybeSelectedProducts);
					const { quantity, sku, unitCost } = cartInfo;
					const totalCost = Math.round(quantity * unitCost * 100) / 100;
					const newSet = new Set(state.selectedProductSkus);

					if (quantity <= 0) {
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

					newSet.add(sku);

					return {
						maybeSelectedProducts: newMap,
						selectedProductSkus: newSet,
					};
				});
			},

			getQuantity: (sku) => {
				return get().maybeSelectedProducts.get(sku)?.quantity || 0;
			},

			// TODO: when User checks out successfully, we need to call this
			clearCart: () => {
				set({
					maybeSelectedProducts: new Map(),
					selectedProductSkus: new Set(),
					cart: [],
					cartSize: 0,
					totalCost: 0,
				});
			},

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

			toggleAllProducts: (selectAll) => {
				set((state) => {
					const enabledSkus = Array.from(state.maybeSelectedProducts.keys());
					const newSet = new Set(state.selectedProductSkus);

					if (selectAll) {
						// Add all enabled SKUs to selection
						enabledSkus.forEach((sku) => newSet.add(sku));
					} else {
						// Remove all enabled SKUs from selection
						enabledSkus.forEach((sku) => newSet.delete(sku));
					}

					return {
						selectedProductSkus: newSet,
					};
				});
			},

			getEnabledSkus: () => {
				const { maybeSelectedProducts } = get();
				return Array.from(maybeSelectedProducts.keys());
			},

			areAllEnabledProductsSelected: () => {
				const { maybeSelectedProducts, selectedProductSkus } = get();
				const enabledSkus = Array.from(maybeSelectedProducts.keys());

				if (enabledSkus.length === 0) return false;

				return enabledSkus.every((sku) => selectedProductSkus.has(sku));
			},

			areSomeEnabledProductsSelected: () => {
				const { maybeSelectedProducts, selectedProductSkus } = get();
				const enabledSkus = Array.from(maybeSelectedProducts.keys());

				if (enabledSkus.length === 0) return false;

				const selectedCount = enabledSkus.filter((sku) =>
					selectedProductSkus.has(sku),
				).length;

				return selectedCount > 0 && selectedCount < enabledSkus.length;
			},

			getCart: () => {
				const { cart } = get();
				return cart;
			},

			getTotalCartCost: () => {
				const { totalCost } = get();
				return totalCost;
			},

			prepareCartForCheckout: () => {
				set((state) => {
					const { selectedProductSkus, maybeSelectedProducts } = state;
					const arr = Array.from(maybeSelectedProducts.values());
					const cart = arr
						.map((item) => {
							const sku = item.sku;
							if (selectedProductSkus.has(sku)) {
								return item;
							} else return null;
						})
						.filter((x) => x !== null);

					const totalCost =
						Math.round(cart.reduce((sum, item) => sum + item.total, 0) * 100) /
						100;

					return {
						cart: cart,
						cartSize: cart.length,
						totalCost: totalCost,
					};
				});
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
