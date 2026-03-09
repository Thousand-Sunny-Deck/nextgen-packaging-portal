"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Plus, UserX } from "lucide-react";
import {
	getSpikeUserEntitledProducts,
	searchSpikeUserByEmail,
	type SpikeEntitlementUser,
	type SpikeUserEntitlementRow,
} from "@/actions/spike/entitlements-actions";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import { Button } from "@/components/ui/button";
import { EmailUserSearch } from "./email-user-search";
import { UserInfoCard } from "./user-info-card";
import { LoadEntitlementsPlaceholder } from "./load-entitlements-placeholder";
import { EntitlementsTable } from "./entitlements-table";
import { AddEntitlementsSheet } from "./add-entitlements-sheet";

export interface EntitlementsClientProps {
	email: string;
	search: string;
	page: number;
	pageSize: number;
	loaded: boolean;
}

export function EntitlementsClient({
	email,
	search,
	page,
	pageSize,
	loaded,
}: EntitlementsClientProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [addSheetOpen, setAddSheetOpen] = useState(false);

	const [userLoading, setUserLoading] = useState(false);
	const [userError, setUserError] = useState<string | null>(null);
	const [userNotFound, setUserNotFound] = useState(false);
	const [user, setUser] = useState<SpikeEntitlementUser | null>(null);

	const [tableLoading, setTableLoading] = useState(false);
	const [tableError, setTableError] = useState<string | null>(null);
	const [entitlements, setEntitlements] = useState<SpikeUserEntitlementRow[]>(
		[],
	);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoaded, setIsLoaded] = useState(loaded);
	const userId = user?.id;

	const hasEmail = useMemo(() => email.trim().length > 0, [email]);

	const fetchUser = useCallback(
		async ({
			preserveEntitlements = false,
			preserveLoaded = false,
		}: {
			preserveEntitlements?: boolean;
			preserveLoaded?: boolean;
		} = {}) => {
			if (!hasEmail) {
				setUser(null);
				setUserError(null);
				setUserNotFound(false);
				setEntitlements([]);
				setTotal(0);
				setTotalPages(0);
				setTableError(null);
				setIsLoaded(false);
				return;
			}

			setUserLoading(true);
			setUserError(null);
			setUserNotFound(false);
			if (!preserveEntitlements) {
				setUser(null);
				setEntitlements([]);
				setTotal(0);
				setTotalPages(0);
				setTableError(null);
			}
			if (!preserveLoaded) {
				setIsLoaded(false);
			}

			const result = await searchSpikeUserByEmail(email);
			if (!result.success || !result.user) {
				setUserNotFound(Boolean(result.notFound));
				setUserError(result.error || "Unable to find user.");
				setUserLoading(false);
				return;
			}

			setUser(result.user);
			setUserLoading(false);
		},
		[email, hasEmail],
	);

	const fetchEntitlements = useCallback(async () => {
		if (!userId) return;

		setTableLoading(true);
		setTableError(null);
		try {
			const result = await getSpikeUserEntitledProducts({
				userId,
				search,
				page,
				pageSize,
			});
			setEntitlements(result.entitlements);
			setTotal(result.total);
			setTotalPages(result.totalPages);
		} catch (error) {
			console.error("Failed to fetch spike entitlements:", error);
			setTableError("Failed to load entitled products.");
		} finally {
			setTableLoading(false);
		}
	}, [userId, search, page, pageSize]);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	useEffect(() => {
		setIsLoaded(loaded);
	}, [loaded]);

	useEffect(() => {
		if (!isLoaded || !userId) return;
		fetchEntitlements();
	}, [isLoaded, userId, fetchEntitlements]);

	const handleLoadEntitlements = () => {
		setIsLoaded(true);
		fetchEntitlements();
		const params = new URLSearchParams(searchParams.toString());
		params.set("loaded", "1");
		params.set("page", "1");
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleRefreshUser = () => {
		fetchUser({ preserveEntitlements: true, preserveLoaded: true });
	};

	const handleEntitlementsAdded = () => {
		fetchUser({ preserveEntitlements: true, preserveLoaded: true });
		if (isLoaded) fetchEntitlements();
	};

	return (
		<div className="p-4 md:p-8">
			<PageHeader
				title="Entitlements"
				subtitle="Manage user product access by email"
			/>

			<div className="space-y-5">
				<EmailUserSearch defaultEmail={email} />

				{!hasEmail && (
					<EmptyState
						icon={KeyRound}
						heading="Search by email to begin"
						description="Enter a user email to view profile details and entitled products."
					/>
				)}

				{hasEmail && userLoading && (
					<div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
						Searching for user...
					</div>
				)}

				{hasEmail && !userLoading && userError && userNotFound && (
					<EmptyState
						icon={UserX}
						heading="User not found"
						description={userError}
					/>
				)}

				{hasEmail && !userLoading && userError && !userNotFound && (
					<div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
						{userError}
					</div>
				)}

				{user && (
					<>
						<UserInfoCard
							key={user.id}
							user={user}
							onUserUpdated={setUser}
							onRefresh={handleRefreshUser}
							refreshing={userLoading}
						/>

						<div className="space-y-3">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3 className="text-base font-semibold text-slate-900">
										Entitled Products
									</h3>
									<p className="text-sm text-slate-500">
										Manage and inspect entitled products for {user.name}.
									</p>
								</div>
								<Button
									size="sm"
									onClick={() => setAddSheetOpen(true)}
									className="shrink-0"
								>
									<Plus className="mr-1.5 h-4 w-4" />
									Add Entitlements
								</Button>
							</div>

							{!isLoaded ? (
								<LoadEntitlementsPlaceholder
									onLoad={handleLoadEntitlements}
									loading={tableLoading}
								/>
							) : (
								<EntitlementsTable
									entitlements={entitlements}
									total={total}
									totalPages={totalPages}
									loading={tableLoading}
									error={tableError}
									search={search}
									page={page}
									pageSize={pageSize}
									onRefresh={fetchEntitlements}
								/>
							)}
						</div>

						<AddEntitlementsSheet
							open={addSheetOpen}
							onOpenChange={setAddSheetOpen}
							userId={user.id}
							userName={user.name}
							onEntitlementsAdded={handleEntitlementsAdded}
						/>
					</>
				)}
			</div>
		</div>
	);
}
