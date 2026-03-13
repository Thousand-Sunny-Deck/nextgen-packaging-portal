"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrderPendingApprovalModalProps {
	open: boolean;
	isLoading: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function OrderPendingApprovalModal({
	open,
	isLoading,
	onConfirm,
	onCancel,
}: OrderPendingApprovalModalProps) {
	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Submit Order for Review</DialogTitle>
					<DialogDescription>
						Your order will be reviewed by our team before processing begins.
						You&apos;ll receive a confirmation email once it&apos;s approved —
						typically within 1–2 business days.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={onCancel}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isLoading}
						className="w-full sm:w-auto"
					>
						{isLoading ? "Submitting..." : "Submit for Review"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
