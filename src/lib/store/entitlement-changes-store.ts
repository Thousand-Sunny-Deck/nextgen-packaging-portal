import { create } from "zustand";

export interface PendingEdit {
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
}

interface EntitlementChangesStore {
	// State
	pendingEdits: Map<string, PendingEdit>;
	pendingRevocations: Set<string>;

	// Edit actions
	addEdit: (entitlementId: string, edit: PendingEdit) => void;
	removeEdit: (entitlementId: string) => void;

	// Revocation actions
	addRevocation: (entitlementId: string) => void;
	removeRevocation: (entitlementId: string) => void;

	// Queries
	hasChanges: () => boolean;
	getChangeCount: () => number;
	isEdited: (entitlementId: string) => boolean;
	isRevoked: (entitlementId: string) => boolean;

	// Bulk
	clearAll: () => void;
}

export const useEntitlementChangesStore = create<EntitlementChangesStore>()(
	(set, get) => ({
		pendingEdits: new Map(),
		pendingRevocations: new Set(),

		addEdit: (entitlementId, edit) => {
			set((state) => {
				const newEdits = new Map(state.pendingEdits);
				newEdits.set(entitlementId, edit);
				return { pendingEdits: newEdits };
			});
		},

		removeEdit: (entitlementId) => {
			set((state) => {
				const newEdits = new Map(state.pendingEdits);
				newEdits.delete(entitlementId);
				return { pendingEdits: newEdits };
			});
		},

		addRevocation: (entitlementId) => {
			set((state) => {
				const newRevocations = new Set(state.pendingRevocations);
				newRevocations.add(entitlementId);
				return { pendingRevocations: newRevocations };
			});
		},

		removeRevocation: (entitlementId) => {
			set((state) => {
				const newRevocations = new Set(state.pendingRevocations);
				newRevocations.delete(entitlementId);
				return { pendingRevocations: newRevocations };
			});
		},

		hasChanges: () => {
			const { pendingEdits, pendingRevocations } = get();
			return pendingEdits.size > 0 || pendingRevocations.size > 0;
		},

		getChangeCount: () => {
			const { pendingEdits, pendingRevocations } = get();
			return pendingEdits.size + pendingRevocations.size;
		},

		isEdited: (entitlementId) => {
			return get().pendingEdits.has(entitlementId);
		},

		isRevoked: (entitlementId) => {
			return get().pendingRevocations.has(entitlementId);
		},

		clearAll: () => {
			set({ pendingEdits: new Map(), pendingRevocations: new Set() });
		},
	}),
);
