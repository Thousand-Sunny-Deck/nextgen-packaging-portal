import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CheckoutExtras {
	/** `YYYY-MM-DD` requested delivery day, or "" when not yet chosen. */
	deliveryDate: string;
	/** Short customer note for the order. */
	notes: string;
}

interface CheckoutExtrasStore extends CheckoutExtras {
	setDeliveryDate: (deliveryDate: string) => void;
	setNotes: (notes: string) => void;
	clearCheckoutExtras: () => void;
}

export const useCheckoutExtrasStore = create<CheckoutExtrasStore>()(
	persist(
		(set) => ({
			deliveryDate: "",
			notes: "",

			setDeliveryDate: (deliveryDate) => set({ deliveryDate }),
			setNotes: (notes) => set({ notes }),
			clearCheckoutExtras: () => set({ deliveryDate: "", notes: "" }),
		}),
		{
			name: "checkout-extras-storage",
		},
	),
);
