"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "./columns";
import { useReorder } from "@/hooks/use-reorder";
import { cancelOrderAction } from "@/actions/order-delivery/cancel-order-action";

interface InvoiceActionsProps {
	invoice: Invoice;
}

export const InvoiceActions = ({ invoice }: InvoiceActionsProps) => {
	const router = useRouter();
	const { handleReorder, isReordering } = useReorder();
	const [isCancelling, setIsCancelling] = useState(false);
	const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
	const [showAlreadyApprovedModal, setShowAlreadyApprovedModal] =
		useState(false);

	const loading = isReordering(invoice.orderId);
	const isPendingApproval = invoice.status === "Pending Approval";
	const isCancelled = invoice.status === "Cancelled";

	const handleViewInvoice = () => {
		if (!invoice.pdfUrl) {
			toast.error(
				"Invoice is not ready yet. Please wait for processing to complete.",
			);
			return;
		}

		const newWindow = window.open(invoice.pdfUrl, "_blank");

		if (!newWindow) {
			toast.error("Please allow pop-ups to view the invoice");
		}
	};

	const handleConfirmCancel = async () => {
		setShowConfirmCancelModal(false);
		setIsCancelling(true);
		try {
			const result = await cancelOrderAction(invoice.orderId);
			if (result.success) {
				toast.success("Order cancelled successfully.");
				router.refresh();
			} else {
				setShowAlreadyApprovedModal(true);
			}
		} finally {
			setIsCancelling(false);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-8 w-8 p-0"
						disabled={loading || isCancelling}
					>
						<span className="sr-only">Open menu</span>
						{loading || isCancelling ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<MoreHorizontal className="h-4 w-4" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={handleViewInvoice}
						disabled={isPendingApproval || isCancelled}
					>
						View invoice
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					{isPendingApproval ? (
						<DropdownMenuItem
							onClick={() => setShowConfirmCancelModal(true)}
							disabled={isCancelling}
							variant="destructive"
						>
							Cancel Order
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem
							onClick={() => handleReorder(invoice.orderId)}
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Loading...
								</>
							) : (
								"Reorder"
							)}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Confirmation dialog */}
			<Dialog
				open={showConfirmCancelModal}
				onOpenChange={setShowConfirmCancelModal}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Cancel Order</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel order {invoice.invoiceId}? This
							cannot be undone. You can always place a new order.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
						<Button
							variant="outline"
							onClick={() => setShowConfirmCancelModal(false)}
							disabled={isCancelling}
							className="w-full sm:w-auto"
						>
							Keep Order
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmCancel}
							disabled={isCancelling}
							className="w-full sm:w-auto"
						>
							Yes, Cancel Order
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Race condition: order already approved */}
			<Dialog
				open={showAlreadyApprovedModal}
				onOpenChange={setShowAlreadyApprovedModal}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Order Already Approved</DialogTitle>
						<DialogDescription>
							This order has already been approved by our team and can no longer
							be cancelled. If you have any concerns, please contact support.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button onClick={() => setShowAlreadyApprovedModal(false)}>
							Got it
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
