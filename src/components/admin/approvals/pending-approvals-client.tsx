"use client";

import { useCallback, useEffect, useState } from "react";
import {
	getPendingApprovals,
	type GetPendingApprovalsParams,
} from "@/actions/spike/pending-approvals-actions";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";
import { PendingApprovalsTable } from "./pending-approvals-table";

interface PendingApprovalsClientProps {
	search: string;
	page: number;
	pageSize: number;
}

export function PendingApprovalsClient({
	search,
	page,
	pageSize,
}: PendingApprovalsClientProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [approvals, setApprovals] = useState<OrderActivityRow[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchApprovals = useCallback(
		async (params?: GetPendingApprovalsParams) => {
			setLoading(true);
			setError(null);
			try {
				const result = await getPendingApprovals(
					params ?? { page, pageSize, search },
				);
				setApprovals(result.approvals);
				setTotal(result.total);
				setTotalPages(result.totalPages);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load approvals",
				);
			} finally {
				setLoading(false);
			}
		},
		[page, pageSize, search],
	);

	useEffect(() => {
		fetchApprovals();
	}, [fetchApprovals]);

	return (
		<PendingApprovalsTable
			approvals={approvals}
			total={total}
			totalPages={totalPages}
			loading={loading}
			error={error}
			search={search}
			page={page}
			pageSize={pageSize}
			onRefresh={() => fetchApprovals({ page, pageSize, search })}
		/>
	);
}
