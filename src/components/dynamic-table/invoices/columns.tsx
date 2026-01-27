"use client";

import { Lozenge } from "@/components/Lozenge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export type Invoice = {
	invoiceId: string;
	amount: number;
	status: "Pending" | "Processing" | "Success" | "Failed";
	date: string;
};

const LozengeAppereanceMap = (status: Invoice["status"]) => {
	switch (status) {
		case "Pending":
			return "inprogress";
		case "Failed":
			return "removed";
		case "Processing":
			return "inprogress";
		case "Success":
			return "success";
		default:
			return "default";
	}
};

export const AllInvoicesTableColumns: ColumnDef<Invoice>[] = [
	{
		accessorKey: "date",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Date
					<ArrowUpDown />
				</Button>
			);
		},
		cell: ({ row }) => {
			return <div className="text-left">{row.getValue("date")}</div>;
		},
		size: 10,
	},
	{
		accessorKey: "invoiceId",
		header: () => <div className="text-left">Invoice</div>,
		size: 50,
	},
	{
		accessorKey: "amount",
		header: () => <div className="text-center">Amount</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue("amount"));
			const formatted = new Intl.NumberFormat("en-AU", {
				style: "currency",
				currency: "AUD",
			}).format(amount);

			return (
				<div className="text-center font-medium">
					<span className="font-semibold">AUD</span> {formatted}
				</div>
			);
		},
		size: 20,
	},
	{
		accessorKey: "status",
		header: () => <div className="text-center">Status</div>,
		cell: ({ row }) => {
			return (
				<div className="flex items-center justify-center">
					<Lozenge appearance={LozengeAppereanceMap(row.getValue("status"))}>
						{row.getValue("status")}
					</Lozenge>
				</div>
			);
		},
		size: 20,
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const invoice = row.original;

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
						<DropdownMenuItem
							onClick={() => navigator.clipboard.writeText(invoice.invoiceId)}
						>
							{/* TODO: add a toast here when you call the API on onclick. This will tell the users that
							something is happening */}
							View invoice
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>Reorder</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
