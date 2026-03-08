"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCreateProductStore } from "@/lib/store/create-product-store";
import { submitProductDraft } from "./submit-product-draft";
import { ProductDraftStep } from "./draft-step";
import { ProductReviewStep } from "./review-step";

type Step = "draft" | "review";

interface CreateProductsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProductsCreated: () => void;
}

export function CreateProductsSheet({
	open,
	onOpenChange,
	onProductsCreated,
}: CreateProductsSheetProps) {
	const { draft, mode, clearDraft } = useCreateProductStore();

	const [step, setStep] = useState<Step>("draft");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Warn on accidental refresh while submitting
	useEffect(() => {
		if (!submitting) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [submitting]);

	const handleClose = () => {
		if (submitting) return;
		setStep("draft");
		setSubmitError(null);
		onOpenChange(false);
		// Note: draft intentionally NOT cleared on close — store persists it
	};

	const handleConfirm = async () => {
		setSubmitting(true);
		setSubmitError(null);
		try {
			const result = await submitProductDraft([...draft.values()]);
			if (!result.success) {
				setSubmitError(result.error);
				return;
			}
			toast.success(
				`${draft.size} product${draft.size > 1 ? "s" : ""} created successfully`,
			);
			clearDraft();
			onProductsCreated();
			handleClose();
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const canProceed = mode === "manual" && draft.size > 0;

	return (
		<Sheet
			open={open}
			onOpenChange={(v) => {
				if (submitting) return;
				if (!v) handleClose();
			}}
		>
			<SheetContent
				side="right"
				className="!w-full !max-w-full flex flex-col"
				showCloseButton={!submitting}
			>
				<SheetHeader>
					<SheetTitle>
						{step === "draft"
							? "Create Products"
							: `Review ${draft.size} product${draft.size > 1 ? "s" : ""}`}
					</SheetTitle>
					<SheetDescription>
						{step === "draft"
							? "Add up to 10 products manually or upload a CSV."
							: "Review the products below. All will be created or none."}
					</SheetDescription>
				</SheetHeader>

				<div
					className={`flex-1 overflow-y-auto px-4 transition-opacity ${
						submitting ? "opacity-60 pointer-events-none" : ""
					}`}
				>
					{step === "draft" && <ProductDraftStep />}
					{step === "review" && (
						<ProductReviewStep
							draft={[...draft.values()]}
							error={submitError}
						/>
					)}
				</div>

				<SheetFooter
					className={`flex-row justify-between border-t pt-4 transition-opacity ${
						submitting ? "opacity-60 pointer-events-none" : ""
					}`}
				>
					{step === "draft" ? (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={() => setStep("review")} disabled={!canProceed}>
								Next ({draft.size})
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outline"
								onClick={() => {
									setStep("draft");
									setSubmitError(null);
								}}
								disabled={submitting}
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button onClick={handleConfirm} disabled={submitting}>
								{submitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										Confirm {draft.size} product
										{draft.size > 1 ? "s" : ""}
									</>
								)}
							</Button>
						</>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
