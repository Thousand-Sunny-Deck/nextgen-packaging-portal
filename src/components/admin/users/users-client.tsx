"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/layout/page-header";
import {
	getSpikeUsers,
	type SpikeAdminUser,
} from "@/actions/spike/users-actions";
import { LoadUsersPlaceholder } from "./load-users-placeholder";
import { UsersTable } from "./users-table";

interface UsersClientProps {
	search: string;
	page: number;
	pageSize: number;
}

export function UsersClient({ search, page, pageSize }: UsersClientProps) {
	const [loaded, setLoaded] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<SpikeAdminUser[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getSpikeUsers({ page, pageSize, search });
			setUsers(result.users);
			setTotal(result.total);
			setTotalPages(result.totalPages);
			setLoaded(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load users");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search]);

	useEffect(() => {
		if (!loaded) return;
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, search, pageSize]);

	return (
		<div className="p-4 md:p-8">
			<PageHeader title="Users" subtitle="Manage platform accounts" />

			{!loaded ? (
				<LoadUsersPlaceholder
					onLoad={fetchUsers}
					loading={loading}
					error={error}
				/>
			) : (
				<UsersTable
					users={users}
					total={total}
					totalPages={totalPages}
					loading={loading}
					error={error}
					search={search}
					page={page}
					pageSize={pageSize}
					onRefresh={fetchUsers}
				/>
			)}
		</div>
	);
}
