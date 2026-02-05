"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { AdminUser } from "@/actions/admin/users-actions";

const RoleBadge = ({ role }: { role: AdminUser["role"] }) => {
	const styles = {
		USER: "bg-gray-100 text-gray-800",
		ADMIN: "bg-blue-100 text-blue-800",
		SUPER_ADMIN: "bg-orange-100 text-orange-800",
	};

	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[role]}`}
		>
			{role.replace("_", " ")}
		</span>
	);
};

export const usersColumns: ColumnDef<AdminUser>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Name
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="font-medium">{row.getValue("name")}</div>
		),
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => (
			<div className="text-gray-600">{row.getValue("email")}</div>
		),
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
	},
	{
		accessorKey: "ordersCount",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Orders
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("ordersCount")}</div>
		),
	},
	{
		accessorKey: "entitlementsCount",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Entitlements
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="text-center">{row.getValue("entitlementsCount")}</div>
		),
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Joined
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date;
			return (
				<div className="text-gray-600">
					{new Date(date).toLocaleDateString()}
				</div>
			);
		},
	},
	// TODO: Add actions column when needed (View Details, Edit Role, Delete)
];
