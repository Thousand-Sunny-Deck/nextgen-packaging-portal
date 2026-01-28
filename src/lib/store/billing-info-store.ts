import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BillingInfoItem {
	email: string;
	organization: string;
	address: string;
	ABN: string;
}

interface BillingInfoStore {
	billingInfo: BillingInfoItem | null;
	setBillingInfo: (info: BillingInfoItem) => void;
	clearBillingInfo: () => void;
	hasBillingInfo: () => boolean;
}

export const useBillingInfoStore = create<BillingInfoStore>()(
	persist(
		(set, get) => ({
			billingInfo: null,

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
