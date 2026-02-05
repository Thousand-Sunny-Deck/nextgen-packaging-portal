"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { UsersDataTable } from "./users-data-table";
import { usersColumns } from "./users-columns";
import { CreateUserModal } from "./create-user-modal";
import { getUsers, AdminUser } from "@/actions/admin/users-actions";

export function UsersTab() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const fetchUsers = useCallback(async () => {
		try {
			const result = await getUsers();
			setUsers(result.users);
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Fetch all users once on mount
	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleUserCreated = () => {
		fetchUsers(); // Refresh the list
	};

	return (
		<div className="space-y-4">
			{/* Header with create button */}
			<div className="flex items-center justify-end">
				<Button onClick={() => setCreateModalOpen(true)}>
					<UserPlus className="h-4 w-4 mr-2" />
					Create User
				</Button>
			</div>

			{/* Data table with built-in search */}
			{loading ? (
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
