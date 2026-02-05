"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, Loader2, Users } from "lucide-react";
import { UsersDataTable } from "./users-data-table";
import { usersColumns } from "./users-columns";
import { CreateUserModal } from "./create-user-modal";
import { getUsers, AdminUser } from "@/actions/admin/users-actions";

export function UsersTab() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const result = await getUsers();
			setUsers(result.users);
			setLoaded(true);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleUserCreated = () => {
		fetchUsers(); // Refresh the list
	};

	return (
		<div className="space-y-4">
			{/* Header with buttons */}
			<div className="flex items-center justify-end gap-2">
				<Button variant="outline" onClick={fetchUsers} disabled={loading}>
					{loading ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<RefreshCw className="h-4 w-4 mr-2" />
					)}
					{loaded ? "Refresh" : "Load Users"}
				</Button>
				<Button onClick={() => setCreateModalOpen(true)}>
					<UserPlus className="h-4 w-4 mr-2" />
					Create User
				</Button>
			</div>

			{/* Data table or empty state */}
			{!loaded ? (
				<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
					<Users className="h-12 w-12 text-gray-300 mb-4" />
					<p className="text-gray-500 mb-4">Click Load Users to fetch data</p>
				</div>
			) : (
				<UsersDataTable columns={usersColumns} data={users} />
			)}

			{/* Create user modal */}
			<CreateUserModal
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
				onUserCreated={handleUserCreated}
			/>
		</div>
	);
}
