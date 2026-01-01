import { create } from "zustand";

export interface Product {
	sku: string;
	description: string;
	price1: string;
	price2: string;
	quantity: number;
	total: number;
	quantity1: string;
	price3: string;
	quantity2: string;
}

interface ProductStore {
	products: Product[];
	selectedProductIds: Set<string>;
	setProducts: (products: Product[]) => void;
	toggleProduct: (sku: string) => void;
	// updateQuantity: (sku: string, type: string) => void;
	// calculateTotalPriceForProduct: () => number;
	// calculateTotalPriceForOrder: () => number;
	toggleAll: () => void;
	clearSelection: () => void;
	getSelectedProducts: () => Product[];
}

export const useProductStore = create<ProductStore>((set, get) => ({
	products: [],
	selectedProductIds: new Set(),

	setProducts: (products) => set({ products }),

	toggleProduct: (sku) =>
		set((state) => {
			const newSet = new Set(state.selectedProductIds);
			newSet.has(sku) ? newSet.delete(sku) : newSet.add(sku);
			return { selectedProductIds: newSet };
		}),

	toggleAll: () =>
		set((state) => ({
			selectedProductIds:
				state.selectedProductIds.size === state.products.length
					? new Set()
					: new Set(state.products.map((p) => p.sku)),
		})),

	clearSelection: () => set({ selectedProductIds: new Set() }),

	getSelectedProducts: () => {
		const { products, selectedProductIds } = get();
		return products.filter((product) => selectedProductIds.has(product.sku));
	},
}));
