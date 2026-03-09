import type { ComponentProps, Dispatch, SetStateAction } from "react";
import { Lozenge } from "@/components/Lozenge";
import { Input } from "@/components/ui/input";
import type { AdminTableColumn } from "@/components/admin/ui/admin-data-table";
import type { SpikeAdminUser } from "@/actions/spike/users-actions";

const roleLozengeProps: Record<
	SpikeAdminUser["role"],
	ComponentProps<typeof Lozenge>
> = {
	SUPER_ADMIN: { appearance: "new", children: "Super Admin" },
	ADMIN: { className: "bg-orange-100 text-orange-800", children: "Admin" },
	USER: { appearance: "default", children: "User" },
};

type UserColumnsOptions = {
	editingRowId: string | null;
	editNameDraft: string;
	setEditNameDraft: Dispatch<SetStateAction<string>>;
};

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleDateString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function getUserColumns({
	editingRowId,
	editNameDraft,
	setEditNameDraft,
}: UserColumnsOptions): AdminTableColumn<SpikeAdminUser>[] {
	return [
		{
			key: "name",
			header: "Name",
			render: (user) =>
				editingRowId === user.id ? (
					<Input
						className="h-8"
						value={editNameDraft}
						placeholder={user.name}
						onChange={(event) => setEditNameDraft(event.target.value)}
					/>
				) : (
					<span className="font-medium text-slate-900">{user.name}</span>
				),
		},
		{
			key: "email",
			header: "Email",
			render: (user) => <span className="text-slate-500">{user.email}</span>,
		},
		{
			key: "role",
			header: "Role",
			render: (user) => <Lozenge {...roleLozengeProps[user.role]} />,
		},
		{
			key: "orders",
			header: "Orders",
			render: (user) => user.ordersCount,
		},
		{
			key: "entitlements",
			header: "Entitlements",
			render: (user) => user.entitlementsCount,
		},
		{
			key: "joined",
			header: "Joined",
			render: (user) => formatDate(user.createdAt),
		},
	];
}
