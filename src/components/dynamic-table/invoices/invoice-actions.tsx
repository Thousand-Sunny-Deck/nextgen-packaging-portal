"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "./columns";

interface InvoiceActionsProps {
	invoice: Invoice;
}

export const InvoiceActions = ({ invoice }: InvoiceActionsProps) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleViewInvoice = async () => {
		// Only allow viewing for completed orders
		if (invoice.status !== "Success") {
			toast.error(
				"Invoice is not ready yet. Please wait for processing to complete.",
			);
			return;
		}

		setIsLoading(true);
		toast.info("Fetching invoice...");

		const pdfUrl = `/api/pdf?orderId=${encodeURIComponent(invoice.invoiceId)}`;

		try {
			// Validate access with HEAD request (lightweight, no file download)
			const response = await fetch(pdfUrl, {
				method: "HEAD",
				credentials: "include",
			});

			if (!response.ok) {
				// Try to get error message from a GET request for better error info
				const errorResponse = await fetch(pdfUrl, { credentials: "include" });
				const errorData = await errorResponse.json().catch(() => ({}));
				throw new Error(errorData.message || "Invoice not available");
			}

			// Validation passed - open direct URL for proper tab title
			const newWindow = window.open(pdfUrl, "_blank");

			if (newWindow) {
				toast.success("Invoice opened in new tab");
			} else {
				toast.error("Please allow pop-ups to view the invoice");
			}
		} catch (error) {
			console.error("Error fetching invoice:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to fetch invoice",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
					<span className="sr-only">Open menu</span>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<MoreHorizontal className="h-4 w-4" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem onClick={handleViewInvoice} disabled={isLoading}>
					{isLoading ? "Loading..." : "View invoice"}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Reorder</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
