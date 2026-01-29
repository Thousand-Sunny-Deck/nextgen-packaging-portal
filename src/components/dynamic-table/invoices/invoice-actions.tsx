"use client";

import { Button } from "@/components/ui/button";
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

interface InvoiceActionsProps {
	invoice: Invoice;
}

export const InvoiceActions = ({ invoice }: InvoiceActionsProps) => {
	const { handleReorder, isReordering } = useReorder();
	const loading = isReordering(invoice.invoiceId);

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

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
					<span className="sr-only">Open menu</span>
					{loading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<MoreHorizontal className="h-4 w-4" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem onClick={handleViewInvoice}>
					View invoice
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => handleReorder(invoice.invoiceId)}
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
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
