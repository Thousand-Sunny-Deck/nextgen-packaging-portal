import { create } from "zustand";

export type ProductDraftItem = {
	localId: string;
	sku: string;
	description: string;
	unitCost: number;
};

export type ProductDraftMode = "manual" | "csv";

type CreateProductStore = {
	draft: Map<string, ProductDraftItem>;
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

export const useCreateProductStore = create<CreateProductStore>((set) => ({
	draft: new Map(),
	mode: "manual",

	addItem: (item) =>
		set((state) => {
			const localId = crypto.randomUUID();
			const next = new Map(state.draft);
			next.set(localId, { localId, ...item });
			return { draft: next };
		}),

	removeItem: (localId) =>
		set((state) => {
			const next = new Map(state.draft);
			next.delete(localId);
			return { draft: next };
		}),

	updateItem: (localId, data) =>
		set((state) => {
			const next = new Map(state.draft);
			if (next.has(localId)) next.set(localId, { localId, ...data });
			return { draft: next };
		}),

	clearDraft: () => set({ draft: new Map() }),

	setMode: (mode) => set({ mode }),
}));
