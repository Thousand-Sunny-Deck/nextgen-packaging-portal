"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { UserEntitledProduct } from "@/actions/admin/entitlements-actions";

export const entitlementsColumns: ColumnDef<UserEntitledProduct>[] = [
	{
		accessorKey: "product.sku",
		id: "sku",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				SKU
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const customSku = row.original.customSku;
			const baseSku = row.original.product.sku;
			return (
				<div className="font-mono font-medium">
					{customSku || baseSku}
					{customSku && (
						<span className="ml-1 text-xs text-muted-foreground">
							(base: {baseSku})
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "product.description",
		id: "description",
		header: "Description",
		cell: ({ row }) => {
			const customDesc = row.original.customDescription;
			const baseDesc = row.original.product.description;
			return (
				<div className="text-gray-600 max-w-md truncate">
					{customDesc || baseDesc}
				</div>
			);
		},
	},
	{
		accessorKey: "product.unitCost",
		id: "unitCost",
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
			const customCost = row.original.customUnitCost;
			const baseCost = row.original.product.unitCost;
			const displayCost = customCost ?? baseCost;
			return (
				<div className="font-medium">
					${displayCost.toFixed(2)}
					{customCost !== null && (
						<span className="ml-1 text-xs text-muted-foreground">
							(base: ${baseCost.toFixed(2)})
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "grantedAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Granted At
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = row.getValue("grantedAt") as Date;
			return (
				<div className="text-gray-600">
					{new Date(date).toLocaleDateString()}
				</div>
			);
		},
	},
];
