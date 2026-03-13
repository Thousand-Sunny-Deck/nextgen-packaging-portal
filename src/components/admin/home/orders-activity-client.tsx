"use client";

import { useCallback, useEffect, useState } from "react";
import {
	getOrderActivities,
	type OrderActivityRow,
} from "@/actions/spike/orders-actions";
import { OrdersActivityTable } from "./orders-activity-table";

interface OrdersActivityClientProps {
	search: string;
	page: number;
	pageSize: number;
}

export function OrdersActivityClient({
	search,
	page,
	pageSize,
}: OrdersActivityClientProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activities, setActivities] = useState<OrderActivityRow[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchActivities = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getOrderActivities({ page, pageSize, search });
			setActivities(result.activities);
			setTotal(result.total);
			setTotalPages(result.totalPages);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load activity");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search]);

	useEffect(() => {
		fetchActivities();
	}, [fetchActivities]);

	return (
		<OrdersActivityTable
			activities={activities}
			total={total}
			totalPages={totalPages}
			loading={loading}
			error={error}
			search={search}
			page={page}
			pageSize={pageSize}
			onRefresh={fetchActivities}
		/>
	);
}
