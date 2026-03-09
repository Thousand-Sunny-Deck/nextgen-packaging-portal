import { create } from "zustand";

export type EntitlementDraftItem = {
	productId: string;
	sku: string;
	description: string;
	unitCost: number;
	// Custom overrides — empty string means "use product default" (stored as null)
	customSku: string;
	customDescription: string;
	customUnitCost: string;
};

export const MAX_ENTITLEMENTS_DRAFT = 30;

type AddEntitlementsStore = {
	draft: Map<string, EntitlementDraftItem>; // keyed by productId
	userId: string | null;

	setUserId: (userId: string) => void;
	addItem: (item: EntitlementDraftItem) => void;
	removeItem: (productId: string) => void;
	updateItem: (
		productId: string,
		patch: Partial<
			Pick<
				EntitlementDraftItem,
				"customSku" | "customDescription" | "customUnitCost"
			>
		>,
	) => void;
	clearDraft: () => void;
	isInDraft: (productId: string) => boolean;
};

export const useAddEntitlementsStore = create<AddEntitlementsStore>(
	(set, get) => ({
		draft: new Map(),
		userId: null,

		setUserId: (userId) => {
			if (get().userId !== userId) {
				set({ userId, draft: new Map() });
			}
		},

		addItem: (item) =>
			set((state) => {
				if (state.draft.size >= MAX_ENTITLEMENTS_DRAFT) return state;
				const next = new Map(state.draft);
				next.set(item.productId, item);
				return { draft: next };
			}),

		removeItem: (productId) =>
			set((state) => {
				const next = new Map(state.draft);
				next.delete(productId);
				return { draft: next };
			}),

		updateItem: (productId, patch) =>
			set((state) => {
				const next = new Map(state.draft);
				const existing = next.get(productId);
				if (existing) next.set(productId, { ...existing, ...patch });
				return { draft: next };
			}),

		clearDraft: () => set({ draft: new Map() }),

		isInDraft: (productId) => get().draft.has(productId),
	}),
);
