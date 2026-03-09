"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	useAddEntitlementsStore,
	MAX_ENTITLEMENTS_DRAFT,
} from "@/lib/store/add-entitlements-store";
import type { SpikeAvailableProduct } from "@/actions/spike/entitlements-actions";
import { parseEntitlementCsv } from "./parser";

interface CsvImportButtonProps {
	products: SpikeAvailableProduct[];
	loading: boolean;
	onErrors: (errors: string[]) => void;
}

export function CsvImportButton({
	products,
	loading,
	onErrors,
}: CsvImportButtonProps) {
	const { draft, addItem } = useAddEntitlementsStore();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const processFile = (file: File) => {
		if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
			onErrors(["Only .csv files are accepted."]);
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result;
			if (typeof text !== "string") return;

			const existingDraftProductIds = new Set(draft.keys());
			const result = parseEntitlementCsv(
				text,
				products,
				existingDraftProductIds,
			);

			if (!result.ok) {
				onErrors(result.errors);
				return;
			}

			const slotsRemaining = MAX_ENTITLEMENTS_DRAFT - draft.size;
			if (result.matches.length > slotsRemaining) {
				onErrors([
					`CSV would add ${result.matches.length} products but only ${slotsRemaining} slot${slotsRemaining !== 1 ? "s" : ""} remain in the draft (max ${MAX_ENTITLEMENTS_DRAFT}).`,
				]);
				return;
			}

			onErrors([]);
			for (const product of result.matches) {
				addItem({
					productId: product.id,
					sku: product.sku,
					description: product.description,
					unitCost: product.unitCost,
					customSku: "",
					customDescription: "",
					customUnitCost: "",
					source: "csv",
				});
			}
		};
		reader.readAsText(file);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
		e.target.value = "";
	};

	const atLimit = draft.size >= MAX_ENTITLEMENTS_DRAFT;

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={loading || atLimit}
				onClick={() => {
					onErrors([]);
					fileInputRef.current?.click();
				}}
				className="shrink-0"
			>
				<Upload size={14} className="mr-1.5" />
				Import CSV
			</Button>
			<input
				ref={fileInputRef}
				type="file"
				accept=".csv"
				className="hidden"
				onChange={handleFileChange}
			/>
		</>
	);
}
