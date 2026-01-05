import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BillingInfoItem {
	email: string;
	organization: string;
	address: string;
	ABN: string;
}

interface BillingInfoStore {
	billingInfo: Map<string, BillingInfoItem>;
	clearBillingInfo: () => void;
	setBillingInfo: (info: BillingInfoItem) => void;
	getBillingInfo: () => BillingInfoItem[];
}

export const useBillingInfoStore = create<BillingInfoStore>()(
	persist(
		(set, get) => ({
			billingInfo: new Map(),

			// TODO: once user clicks "Place Order", we need to clear it from here.
			// TODO: once user logs out, this should be called too
			clearBillingInfo: () =>
				set({
					billingInfo: new Map(),
				}),

			setBillingInfo: (info) => {
				set((state) => {
					const newMap = new Map(state.billingInfo);
					const { email } = info;

					if (newMap.has(email)) {
						newMap.delete(email);
					}

					newMap.set(email, {
						...info,
					});

					return {
						billingInfo: newMap,
					};
				});
			},

			getBillingInfo: () => {
				const { billingInfo } = get();
				const arr = Array.from(billingInfo.values());
				return arr;
			},
		}),
		{
			name: "billing-info-storage",
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					const { state } = JSON.parse(str);
					return {
						state: {
							...state,
							billingInfo: new Map(Object.entries(state.billingInfo || {})),
						},
					};
				},
				setItem: (name, value) => {
					localStorage.setItem(
						name,
						JSON.stringify({
							state: {
								...value.state,
								billingInfo: Object.fromEntries(value.state.billingInfo),
							},
						}),
					);
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
