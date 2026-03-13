// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductData } from "@/actions/products/fetch-products-action";

export interface CartItem {
	handle: string;
	sku: string;
	quantity: number;
	description: string;
	total: number;
	unitCost: number;
	imageUrl?: string | null;
}

export type ProductTableStore = ProductData & {
	quantity: number;
	total: number;
};

interface CartStore {
	maybeSelectedProducts: Map<string, CartItem>;
	selectedProductHandles: Set<string>;
	cart: CartItem[];
	cartSize: number;
	totalCost: number;
	pendingFavouriteName: string | null;

	setQuantity: (cartInfo: CartItem) => void;
	getQuantity: (handle: string) => number;
	clearCart: () => void;

	getIsProductSelected: (handle: string) => boolean;
	toggleProduct: (handle: string) => void;
	canSelectProduct: (handle: string) => boolean;

	toggleAllProducts: (selectAll: boolean, products: ProductData[]) => void;
	areAllProductsSelected: (products: ProductData[]) => boolean;
	areSomeProductsSelected: (products: ProductData[]) => boolean;

	getCart: () => CartItem[];
	getTotalCartCost: () => number;

	prepareCartForCheckout: () => void;
	populateCartFromOrder: (items: CartItem[]) => void;
	mergeCartFromOrder: (items: CartItem[]) => void;
	isCartSheetOpen: boolean;
	setCartSheetOpen: (open: boolean) => void;
	setPendingFavouriteName: (name: string | null) => void;
}

const MAX_QUANTITY = 999;

const prepareCheckoutState = (
	selectedProductHandles: Set<string>,
	maybeSelectedProducts: Map<string, CartItem>,
) => {
	const cart = Array.from(maybeSelectedProducts.values())
		.map((item) => (selectedProductHandles.has(item.handle) ? item : null))
		.filter((item): item is CartItem => Boolean(item));

	const totalCost =
		Math.round(cart.reduce((sum, item) => sum + item.total, 0) * 100) / 100;

	return {
		cart,
		cartSize: cart.length,
		totalCost,
	};
};

export const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			maybeSelectedProducts: new Map(),
			selectedProductHandles: new Set(),
			cart: [],
			cartSize: 0,
			totalCost: 0,
			isCartSheetOpen: false,
			pendingFavouriteName: null,

			setQuantity: (cartInfo) => {
				set((state) => {
					const newMap = new Map(state.maybeSelectedProducts);
					const { quantity, handle, unitCost } = cartInfo;
					const totalCost = Math.round(quantity * unitCost * 100) / 100;
					const newSet = new Set(state.selectedProductHandles);

					if (quantity <= 0) {
						newMap.delete(handle);
						newSet.delete(handle);
						return {
							maybeSelectedProducts: newMap,
							selectedProductHandles: newSet,
						};
					}

					newMap.set(handle, { ...cartInfo, total: totalCost });

					return {
						maybeSelectedProducts: newMap,
						selectedProductHandles: newSet,
					};
				});
			},

			getQuantity: (handle) => {
				return get().maybeSelectedProducts.get(handle)?.quantity || 0;
			},

			clearCart: () => {
				set({
					maybeSelectedProducts: new Map(),
					selectedProductHandles: new Set(),
					cart: [],
					cartSize: 0,
					totalCost: 0,
					isCartSheetOpen: false,
					pendingFavouriteName: null,
				});
			},

			setPendingFavouriteName: (name) => set({ pendingFavouriteName: name }),

			getIsProductSelected: (handle) => {
				return get().selectedProductHandles.has(handle);
			},

			toggleProduct: (handle) => {
				set((state) => {
					const newSet = new Set(state.selectedProductHandles);
					if (newSet.has(handle)) {
						newSet.delete(handle);
					} else {
						newSet.add(handle);
					}
					return { selectedProductHandles: newSet };
				});
			},

			canSelectProduct: (handle) => {
				return get().maybeSelectedProducts.has(handle);
			},

			toggleAllProducts: (selectAll, products) => {
				set((state) => {
					if (selectAll) {
						const newMap = new Map(state.maybeSelectedProducts);
						const newSet = new Set(state.selectedProductHandles);

						for (const product of products) {
							if (!newMap.has(product.handle)) {
								newMap.set(product.handle, {
									handle: product.handle,
									sku: product.sku,
									description: product.description,
									unitCost: product.unitCost,
									quantity: 1,
									total: product.unitCost,
								});
							}
							newSet.add(product.handle);
						}

						return {
							maybeSelectedProducts: newMap,
							selectedProductHandles: newSet,
						};
					} else {
						return {
							maybeSelectedProducts: new Map(),
							selectedProductHandles: new Set(),
						};
					}
				});
			},

			areAllProductsSelected: (products) => {
				const { selectedProductHandles } = get();
				if (products.length === 0) return false;
				return products.every((p) => selectedProductHandles.has(p.handle));
			},

			areSomeProductsSelected: (products) => {
				const { selectedProductHandles } = get();
				if (products.length === 0) return false;
				const count = products.filter((p) =>
					selectedProductHandles.has(p.handle),
				).length;
				return count > 0 && count < products.length;
			},

			getCart: () => get().cart,

			getTotalCartCost: () => get().totalCost,

			prepareCartForCheckout: () => {
				set((state) => {
					const { selectedProductHandles, maybeSelectedProducts } = state;
					return prepareCheckoutState(
						selectedProductHandles,
						maybeSelectedProducts,
					);
				});
			},

			populateCartFromOrder: (items: CartItem[]) => {
				const newMap = new Map<string, CartItem>();
				const newSet = new Set<string>();

				for (const item of items) {
					newMap.set(item.handle, item);
					newSet.add(item.handle);
				}

				const totalCost =
					Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) /
					100;

				set({
					maybeSelectedProducts: newMap,
					selectedProductHandles: newSet,
					cart: items,
					cartSize: items.length,
					totalCost,
					pendingFavouriteName: null,
				});
			},

			mergeCartFromOrder: (items: CartItem[]) => {
				set((state) => {
					const newMap = new Map(state.maybeSelectedProducts);
					const newSet = new Set(state.selectedProductHandles);

					for (const incoming of items) {
						const existing = newMap.get(incoming.handle);
						const quantity = Math.min(
							MAX_QUANTITY,
							(existing?.quantity ?? 0) + incoming.quantity,
						);
						const total = Math.round(quantity * incoming.unitCost * 100) / 100;

						newMap.set(incoming.handle, {
							...incoming,
							quantity,
							total,
						});
						newSet.add(incoming.handle);
					}

					return {
						maybeSelectedProducts: newMap,
						selectedProductHandles: newSet,
						...prepareCheckoutState(newSet, newMap),
					};
				});
			},

			setCartSheetOpen: (open) => {
				set({
					isCartSheetOpen: open,
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
					return {
						state: {
							...state,
							maybeSelectedProducts: new Map(
								Object.entries(state.maybeSelectedProducts || {}),
							),
							selectedProductHandles: new Set(
								state.selectedProductHandles || [],
							) as Set<string>,
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
								selectedProductHandles: Array.from(
									value.state.selectedProductHandles,
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
