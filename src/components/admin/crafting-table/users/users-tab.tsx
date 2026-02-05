"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { UsersDataTable } from "./users-data-table";
import { usersColumns } from "./users-columns";
import { getUsers, AdminUser } from "@/actions/admin/users-actions";

export function UsersTab() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch all users once on mount
	useEffect(() => {
		async function fetchUsers() {
			try {
				const result = await getUsers();
				setUsers(result.users);
			} catch (error) {
				console.error("Failed to fetch users:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchUsers();
	}, []);

	return (
		<div className="space-y-4">
			{/* Header with create button */}
			<div className="flex items-center justify-end">
				<Button disabled>
					<UserPlus className="h-4 w-4 mr-2" />
					Create User
					{/* TODO: Implement CreateUserModal */}
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
		</div>
	);
}
