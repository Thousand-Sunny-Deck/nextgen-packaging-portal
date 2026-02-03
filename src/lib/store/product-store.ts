// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductData } from "@/actions/products/fetch-products-action";

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

	// Toggle all products (select/deselect all)
	toggleAllProducts: (selectAll: boolean, products: ProductData[]) => void;

	// Check if all products are selected
	areAllProductsSelected: (products: ProductData[]) => boolean;

	// Check if some but not all products are selected
	areSomeProductsSelected: (products: ProductData[]) => boolean;

	getCart: () => CartItem[];
	getTotalCartCost: () => number;

	prepareCartForCheckout: () => void;
	populateCartFromOrder: (items: CartItem[]) => void;
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

			toggleAllProducts: (selectAll, products) => {
				set((state) => {
					if (selectAll) {
						// Select all products and set quantity to 1
						const newMap = new Map(state.maybeSelectedProducts);
						const newSet = new Set(state.selectedProductSkus);

						for (const product of products) {
							const existing = newMap.get(product.sku);
							if (!existing) {
								// Product not in cart, add with quantity 1
								newMap.set(product.sku, {
									sku: product.sku,
									description: product.description,
									unitCost: product.unitCost,
									quantity: 1,
									total: product.unitCost,
								});
							}
							newSet.add(product.sku);
						}

						return {
							maybeSelectedProducts: newMap,
							selectedProductSkus: newSet,
						};
					} else {
						// Deselect all products and clear quantities
						return {
							maybeSelectedProducts: new Map(),
							selectedProductSkus: new Set(),
						};
					}
				});
			},

			areAllProductsSelected: (products) => {
				const { selectedProductSkus } = get();

				if (products.length === 0) return false;

				return products.every((product) =>
					selectedProductSkus.has(product.sku),
				);
			},

			areSomeProductsSelected: (products) => {
				const { selectedProductSkus } = get();

				if (products.length === 0) return false;

				const selectedCount = products.filter((product) =>
					selectedProductSkus.has(product.sku),
				).length;

				return selectedCount > 0 && selectedCount < products.length;
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

			populateCartFromOrder: (items: CartItem[]) => {
				const newMap = new Map<string, CartItem>();
				const newSet = new Set<string>();

				for (const item of items) {
					newMap.set(item.sku, item);
					newSet.add(item.sku);
				}

				const totalCost =
					Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) /
					100;

				set({
					maybeSelectedProducts: newMap,
					selectedProductSkus: newSet,
					cart: items,
					cartSize: items.length,
					totalCost: totalCost,
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
