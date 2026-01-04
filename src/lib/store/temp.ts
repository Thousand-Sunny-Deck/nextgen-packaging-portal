import { create } from "zustand";

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
