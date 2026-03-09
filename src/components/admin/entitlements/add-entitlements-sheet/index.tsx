"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAddEntitlementsStore } from "@/lib/store/add-entitlements-store";
import { AddEntitlementsDraftStep } from "./draft-step";
import { AddEntitlementsReviewStep } from "./review-step";
import { _batchGrantEntitlements } from "@/actions/spike/entitlements-actions";

type Step = "draft" | "review";

interface AddEntitlementsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	userName: string;
	onEntitlementsAdded: () => void;
}

export function AddEntitlementsSheet({
	open,
	onOpenChange,
	userId,
	userName,
	onEntitlementsAdded,
}: AddEntitlementsSheetProps) {
	const { draft, clearDraft, setUserId } = useAddEntitlementsStore();

	const [step, setStep] = useState<Step>("draft");
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Sync userId — clears draft if switching to a different user
	useEffect(() => {
		setUserId(userId);
	}, [userId, setUserId]);

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
		// draft intentionally NOT cleared — persists across sheet open/close
	};

	const handleConfirm = async () => {
		setSubmitting(true);
		setSubmitError(null);
		try {
			const entries = [...draft.values()].map((item) => ({
				productId: item.productId,
				customSku: item.customSku.trim() || null,
				customDescription: item.customDescription.trim() || null,
				customUnitCost: item.customUnitCost.trim()
					? parseFloat(item.customUnitCost)
					: null,
			}));

			const result = await _batchGrantEntitlements({ userId, entries });

			if (!result.success) {
				setSubmitError(result.error || "Failed to grant entitlements.");
				return;
			}

			confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
			setTimeout(
				() =>
					confetti({
						particleCount: 80,
						angle: 60,
						spread: 55,
						origin: { x: 0 },
					}),
				150,
			);
			setTimeout(
				() =>
					confetti({
						particleCount: 80,
						angle: 120,
						spread: 55,
						origin: { x: 1 },
					}),
				250,
			);

			toast.success(
				`${draft.size} product${draft.size > 1 ? "s" : ""} granted to ${userName}`,
			);
			clearDraft();
			onEntitlementsAdded();
			handleClose();
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "An unexpected error occurred.",
			);
		} finally {
			setSubmitting(false);
		}
	};

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
							? `Add Entitlements — ${userName}`
							: `Review ${draft.size} entitlement${draft.size !== 1 ? "s" : ""}`}
					</SheetTitle>
					<SheetDescription>
						{step === "draft"
							? `Select up to 30 products to grant to ${userName}. Optionally customise SKU, description, and unit cost per product.`
							: "Review the products below. All will be granted or none."}
					</SheetDescription>
				</SheetHeader>

				<div
					className={`flex-1 overflow-y-auto px-4 transition-opacity ${
						submitting ? "opacity-60 pointer-events-none" : ""
					}`}
				>
					{step === "draft" && (
						<AddEntitlementsDraftStep userId={userId} open={open} />
					)}
					{step === "review" && (
						<AddEntitlementsReviewStep
							draft={[...draft.values()]}
							userName={userName}
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
							<Button
								onClick={() => setStep("review")}
								disabled={draft.size === 0}
							>
								Review ({draft.size})
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
										Granting...
									</>
								) : (
									<>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										Confirm & Grant {draft.size}
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
