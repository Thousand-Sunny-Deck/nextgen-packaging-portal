import { create } from "zustand";

export type ProductDraftItem = {
	localId: string;
	sku: string;
	description: string;
	unitCost: number;
};

export type ProductDraftMode = "manual" | "csv";

type ProductDraftStore = {
	draft: ProductDraftItem[];
	mode: ProductDraftMode;
	addItem: (item: Omit<ProductDraftItem, "localId">) => void;
	removeItem: (localId: string) => void;
	updateItem: (
		localId: string,
		data: Omit<ProductDraftItem, "localId">,
	) => void;
	clearDraft: () => void;
	setMode: (mode: ProductDraftMode) => void;
};

export const useProductDraftStore = create<ProductDraftStore>((set) => ({
	draft: [],
	mode: "manual",

	addItem: (item) =>
		set((state) => ({
			draft: [...state.draft, { localId: crypto.randomUUID(), ...item }],
		})),

	removeItem: (localId) =>
		set((state) => ({
			draft: state.draft.filter((i) => i.localId !== localId),
		})),

	updateItem: (localId, data) =>
		set((state) => ({
			draft: state.draft.map((i) =>
				i.localId === localId ? { ...i, ...data } : i,
			),
		})),

	clearDraft: () => set({ draft: [] }),

	setMode: (mode) => set({ mode }),
}));
