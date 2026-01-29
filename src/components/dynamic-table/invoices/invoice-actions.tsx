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
import { useCartStore } from "@/lib/store/product-store";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { reorderAction } from "@/actions/order-delivery/reorder-action";

interface InvoiceActionsProps {
	invoice: Invoice;
}

export const InvoiceActions = ({ invoice }: InvoiceActionsProps) => {
	const [isReordering, setIsReordering] = useState(false);
	const populateCartFromOrder = useCartStore(
		(state) => state.populateCartFromOrder,
	);
	const setBillingInfo = useBillingInfoStore((state) => state.setBillingInfo);
	const router = useRouter();
	const pathname = usePathname();

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

	const handleReorder = async () => {
		setIsReordering(true);
		toast.success("Preparing your order!");
		try {
			const result = await reorderAction(invoice.invoiceId);

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			const { items, billingInfo } = result.data;

			populateCartFromOrder(items);

			if (billingInfo) {
				setBillingInfo(billingInfo);
			}

			const orderRoute = pathname.replace("home", "order");
			router.push(orderRoute);

			toast.success("Order loaded! Review and proceed to checkout.");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsReordering(false);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0" disabled={isReordering}>
					<span className="sr-only">Open menu</span>
					{isReordering ? (
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
				<DropdownMenuItem onClick={handleReorder} disabled={isReordering}>
					{isReordering ? (
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
