"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CatalogCardViewModel, CatalogRow } from "./types";

export const catalogColumns: ColumnDef<CatalogRow>[] = [
	{
		id: "image",
		accessorFn: (row) => row.imageUrl ?? null,
		header: "Image",
		enableSorting: false,
	},
	{
		id: "description",
		accessorKey: "description",
		header: "Description",
	},
	{
		id: "quantity",
		accessorKey: "quantity",
		header: "Quantity",
	},
	{
		id: "select",
		accessorFn: (row) => row.isSelected,
		header: "Select",
		enableSorting: false,
	},
	{
		id: "unitCost",
		accessorKey: "unitCost",
		header: "Unit Cost",
	},
	{
		id: "total",
		accessorKey: "total",
		header: "Total",
	},
];

export const getCardViewModel = (row: CatalogRow): CatalogCardViewModel => ({
	sku: row.sku,
	name: row.description,
	imageUrl: row.imageUrl ?? null,
	quantity: row.quantity,
	isSelected: row.isSelected,
	unitCost: row.unitCost,
});
