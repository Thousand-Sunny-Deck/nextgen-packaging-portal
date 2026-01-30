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
		}),
		{
			name: "billing-info-storage",
		},
	),
);
