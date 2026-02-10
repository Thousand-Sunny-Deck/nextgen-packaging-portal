"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useEntitlementChangesStore } from "@/lib/store/entitlement-changes-store";
import { UserEntitledProduct } from "@/actions/admin/entitlements-actions";
import confetti from "canvas-confetti";

interface ReviewChangesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
	entitledProducts: UserEntitledProduct[];
}

export function ReviewChangesModal({
	open,
	onOpenChange,
	onConfirm,
	entitledProducts,
}: ReviewChangesModalProps) {
	const { pendingEdits, pendingRevocations } = useEntitlementChangesStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Build lookup for quick access
	const productsById = new Map(entitledProducts.map((p) => [p.id, p]));

	const editEntries = Array.from(pendingEdits.entries());
	const revokeEntries = Array.from(pendingRevocations);

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			await onConfirm();
			// Fire confetti from both sides
			confetti({
				particleCount: 200,
				spread: 70,
				origin: { x: 0, y: 0.6 },
			});
			confetti({
				particleCount: 200,
				spread: 70,
				origin: { x: 1, y: 0.6 },
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				if (isSubmitting) return;
				onOpenChange(v);
			}}
		>
			<DialogContent
				className="sm:max-w-lg max-h-[80vh] overflow-y-auto"
				showCloseButton={!isSubmitting}
			>
				<DialogHeader>
					<DialogTitle>Review Pending Changes</DialogTitle>
					<DialogDescription>
						Review all staged changes before applying. This action cannot be
						undone.
					</DialogDescription>
				</DialogHeader>

				<div
					className={`space-y-6 py-4 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}
				>
					{/* ── Edits Section ── */}
					{editEntries.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-sm font-medium flex items-center gap-2">
								<Pencil className="h-4 w-4" />
								Edits ({editEntries.length})
							</h4>
							<div className="space-y-3">
								{editEntries.map(([entitlementId, edit]) => {
									const product = productsById.get(entitlementId);
									if (!product) return null;
									return (
										<div
											key={entitlementId}
											className="rounded-md border p-3 text-sm space-y-2"
										>
											<p className="font-medium font-mono">
												{product.product.sku}
											</p>
											{edit.customSku !== product.customSku && (
												<ChangeRow
													label="SKU"
													from={product.customSku || product.product.sku}
													to={edit.customSku || product.product.sku}
												/>
											)}
											{edit.customDescription !== product.customDescription && (
												<ChangeRow
													label="Description"
													from={
														product.customDescription ||
														product.product.description
													}
													to={
														edit.customDescription ||
														product.product.description
													}
												/>
											)}
											{edit.customUnitCost !== product.customUnitCost && (
												<ChangeRow
													label="Unit Cost"
													from={`$${(product.customUnitCost ?? product.product.unitCost).toFixed(2)}`}
													to={`$${(edit.customUnitCost ?? product.product.unitCost).toFixed(2)}`}
												/>
											)}
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* ── Revocations Section ── */}
					{revokeEntries.length > 0 && (
						<div className="space-y-3">
							<h4 className="text-sm font-medium flex items-center gap-2 text-red-600">
								<Trash2 className="h-4 w-4" />
								Revocations ({revokeEntries.length})
							</h4>
							<div className="space-y-2">
								{revokeEntries.map((entitlementId) => {
									const product = productsById.get(entitlementId);
									if (!product) return null;
									return (
										<div
											key={entitlementId}
											className="rounded-md border border-red-200 bg-red-50 p-3 text-sm"
										>
											<p className="font-medium font-mono">
												{product.customSku || product.product.sku}
											</p>
											<p className="text-red-600 text-xs mt-1">
												This entitlement will be permanently removed.
											</p>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Applying...
							</>
						) : (
							`Confirm ${editEntries.length + revokeEntries.length} Changes`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ChangeRow({
	label,
	from,
	to,
}: {
	label: string;
	from: string;
	to: string;
}) {
	return (
		<div className="flex items-center gap-2 text-xs">
			<span className="text-muted-foreground w-20 shrink-0">{label}:</span>
			<span className="text-muted-foreground truncate max-w-[120px]">
				{from}
			</span>
			<ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
			<span className="font-medium truncate max-w-[120px]">{to}</span>
		</div>
	);
}
