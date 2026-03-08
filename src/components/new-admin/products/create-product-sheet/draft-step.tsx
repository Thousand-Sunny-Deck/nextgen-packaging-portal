"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	useCreateProductStore,
	type ProductDraftMode,
} from "@/lib/store/create-product-store";
import { ModeToggle } from "./mode-toggle";
import { ManualForm } from "./manual-form";
import { CsvUpload } from "./csv-upload";

export function ProductDraftStep() {
	const { mode, draft, setMode, clearDraft } = useCreateProductStore();
	const [pendingSwitch, setPendingSwitch] = useState<ProductDraftMode | null>(
		null,
	);

	const handleRequestSwitch = (to: ProductDraftMode) => {
		if (to === mode) return;
		if (mode === "manual" && draft.size > 0) {
			setPendingSwitch(to);
		} else {
			setMode(to);
		}
	};

	const handleConfirmSwitch = () => {
		if (!pendingSwitch) return;
		clearDraft();
		setMode(pendingSwitch);
		setPendingSwitch(null);
	};

	return (
		<div className="py-4">
			<div className="max-w-lg mx-auto space-y-4">
				<ModeToggle mode={mode} onRequestSwitch={handleRequestSwitch} />

				{pendingSwitch && (
					<div className="flex items-start gap-3 rounded-md border border-orange-200 bg-orange-50 px-4 py-3">
						<AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
						<div className="flex-1">
							<p className="text-sm text-orange-800">
								Your {draft.size} queued product
								{draft.size > 1 ? "s" : ""} will be lost. Switch anyway?
							</p>
							<div className="flex gap-2 mt-2">
								<Button
									size="sm"
									variant="outline"
									onClick={() => setPendingSwitch(null)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleConfirmSwitch}
									className="bg-orange-500 hover:bg-orange-600 text-white"
								>
									Switch
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>

			{mode === "manual" ? <ManualForm /> : <CsvUpload />}
		</div>
	);
}
