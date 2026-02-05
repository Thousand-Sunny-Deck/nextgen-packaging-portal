"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { AdminProduct } from "@/actions/admin/products-actions";

export const productsColumns: ColumnDef<AdminProduct>[] = [
	{
		accessorKey: "sku",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				SKU
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="font-mono font-medium">{row.getValue("sku")}</div>
		),
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row }) => (
			<div className="text-gray-600 max-w-md truncate">
				{row.getValue("description")}
			</div>
		),
	},
	{
		accessorKey: "unitCost",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Unit Cost
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const cost = row.getValue("unitCost") as number;
			return <div className="font-medium">${cost.toFixed(2)}</div>;
		},
	},
];
