// store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
	sku: string;
	quantity: number;
}

interface CartStore {
	items: Map<string, CartItem>;
	setQuantity: (sku: string, quantity: number) => void;
	getQuantity: (sku: string) => number;
	clear: () => void;
}

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
