import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BillingInfoItem {
	email: string;
	organization: string;
	address: string;
	ABN: string;
}

export interface BillingInfoItemWithId extends BillingInfoItem {
	id: string;
}

interface BillingInfoStore {
	billingInfo: BillingInfoItem | null;
	billingInfos: BillingInfoItemWithId[];
	setBillingInfo: (info: BillingInfoItem) => void;
	clearBillingInfo: () => void;
	hasBillingInfo: () => boolean;
	addBillingInfo: (info: BillingInfoItem) => void;
	updateBillingInfo: (id: string, info: BillingInfoItem) => void;
	deleteBillingInfo: (id: string) => void;
}

export const useBillingInfoStore = create<BillingInfoStore>()(
	persist(
		(set, get) => ({
			billingInfo: null,
			billingInfos: [],

			setBillingInfo: (info) => {
				set({ billingInfo: info });
			},

			clearBillingInfo: () => {
				set({ billingInfo: null });
			},

			hasBillingInfo: () => {
				return get().billingInfo !== null;
			},

			addBillingInfo: (info) => {
				const newItem: BillingInfoItemWithId = {
					...info,
					id: crypto.randomUUID(),
				};
				set((state) => ({
					billingInfos: [...state.billingInfos, newItem],
				}));
			},

			updateBillingInfo: (id, info) => {
				set((state) => ({
					billingInfos: state.billingInfos.map((item) =>
						item.id === id ? { ...info, id } : item,
					),
				}));
			},

			deleteBillingInfo: (id) => {
				set((state) => ({
					billingInfos: state.billingInfos.filter((item) => item.id !== id),
				}));
			},
		}),
		{
			name: "billing-info-storage",
		},
	),
);
