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
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "./columns";

interface InvoiceActionsProps {
	invoice: Invoice;
}

export const InvoiceActions = ({ invoice }: InvoiceActionsProps) => {
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
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem onClick={handleViewInvoice}>
					View invoice
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Reorder</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
