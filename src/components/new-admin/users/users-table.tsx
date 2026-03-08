import { useState } from "react";
import { Users, RefreshCw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateUsersSheet } from "@/components/new-admin/users/create-user-sheet/create-users";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import { AdminSearch } from "@/components/new-admin/ui/admin-search";
import { AdminPagination } from "@/components/new-admin/ui/admin-pagination";
import {
	AdminDataTable,
	type AdminTableColumn,
} from "@/components/new-admin/ui/admin-data-table";
import { Lozenge } from "@/components/Lozenge";
import type { SpikeAdminUser } from "@/actions/spike/users-actions";

const roleLozengeProps: Record<
	SpikeAdminUser["role"],
	React.ComponentProps<typeof Lozenge>
> = {
	SUPER_ADMIN: { appearance: "new", children: "Super Admin" },
	ADMIN: { className: "bg-orange-100 text-orange-800", children: "Admin" },
	USER: { appearance: "default", children: "User" },
};

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleDateString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const userColumns: AdminTableColumn<SpikeAdminUser>[] = [
	{
		key: "name",
		header: "Name",
		render: (u) => <span className="font-medium text-slate-900">{u.name}</span>,
	},
	{
		key: "email",
		header: "Email",
		render: (u) => <span className="text-slate-500">{u.email}</span>,
	},
	{
		key: "role",
		header: "Role",
		render: (u) => <Lozenge {...roleLozengeProps[u.role]} />,
	},
	{
		key: "orders",
		header: "Orders",
		render: (u) => u.ordersCount,
	},
	{
		key: "entitlements",
		header: "Entitlements",
		render: (u) => u.entitlementsCount,
	},
	{
		key: "joined",
		header: "Joined",
		render: (u) => formatDate(u.createdAt),
	},
];

interface UsersTableProps {
	users: SpikeAdminUser[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

export function UsersTable({
	users,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: UsersTableProps) {
	const [sheetOpen, setSheetOpen] = useState(false);

	return (
		<>
			<CreateUsersSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				onUsersCreated={onRefresh}
			/>

			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
				<AdminSearch defaultValue={search} placeholder="Search users..." />
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => setSheetOpen(true)}
						className="shrink-0"
					>
						<UserPlus size={14} className="mr-1.5" />
						Create Users
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={loading}
						className="shrink-0"
					>
						<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
						<span className="ml-1.5">Refresh</span>
					</Button>
				</div>
			</div>

			{error && (
				<div className="mb-3 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
					{error}
				</div>
			)}

			{users.length === 0 && !loading ? (
				<EmptyState
					icon={Users}
					heading="No users found"
					description={
						search
							? `No users match "${search}". Try a different search.`
							: "No users in the database yet."
					}
				/>
			) : (
				<AdminDataTable
					columns={userColumns}
					data={users}
					getRowId={(u) => u.id}
					loading={loading}
					minWidth="min-w-[700px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="users"
			/>
		</>
	);
}
