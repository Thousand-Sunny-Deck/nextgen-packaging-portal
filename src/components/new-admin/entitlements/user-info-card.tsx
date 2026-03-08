"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import {
	updateSpikeUserDetails,
	type SpikeEntitlementUser,
} from "@/actions/spike/entitlements-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface UserInfoCardProps {
	user: SpikeEntitlementUser;
	onUserUpdated: (nextUser: SpikeEntitlementUser) => void;
	onRefresh: () => void;
	refreshing: boolean;
}

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function UserInfoCard({
	user,
	onUserUpdated,
	onRefresh,
	refreshing,
}: UserInfoCardProps) {
	const [name, setName] = useState(user.name);
	const [role, setRole] = useState<SpikeEntitlementUser["role"]>(user.role);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setName(user.name);
		setRole(user.role);
		setError(null);
	}, [user.id, user.name, user.role]);

	const hasUserChanges = name.trim() !== user.name || role !== user.role;

	const handleSave = async () => {
		setSaving(true);
		setError(null);

		const result = await updateSpikeUserDetails({
			userId: user.id,
			name,
			role,
		});

		if (!result.success) {
			setSaving(false);
			setError(result.error || "Failed to save user changes.");
			return;
		}

		const nextUser: SpikeEntitlementUser = {
			...user,
			name: name.trim(),
			role,
		};
		onUserUpdated(nextUser);
		setSaving(false);
	};

	return (
		<div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-base font-semibold text-slate-900">User Info</h3>
					<p className="text-sm text-slate-500">
						Edit profile fields for this user.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={refreshing}
					>
						<RefreshCw
							className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					<Button
						onClick={handleSave}
						disabled={saving || !hasUserChanges}
						size="sm"
					>
						{saving ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Save className="mr-2 h-4 w-4" />
						)}
						Save Changes
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="space-y-1.5">
					<Label htmlFor="ent-user-name">Name</Label>
					<Input
						id="ent-user-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="ent-user-role">Role</Label>
					<Select
						value={role}
						onValueChange={(value) =>
							setRole(value as SpikeEntitlementUser["role"])
						}
					>
						<SelectTrigger id="ent-user-role">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="USER">User</SelectItem>
							<SelectItem value="ADMIN">Admin</SelectItem>
							<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="ent-user-email">Email</Label>
					<Input id="ent-user-email" value={user.email} disabled />
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
				<div className="rounded-md border border-slate-200 p-3">
					<p className="text-xs uppercase tracking-wide text-slate-500">
						Joined
					</p>
					<p className="mt-1 text-sm font-medium text-slate-900">
						{formatDate(user.createdAt)}
					</p>
				</div>
				<div className="rounded-md border border-slate-200 p-3">
					<p className="text-xs uppercase tracking-wide text-slate-500">
						Orders
					</p>
					<p className="mt-1 text-sm font-medium text-slate-900">
						{user.ordersCount}
					</p>
				</div>
				<div className="rounded-md border border-slate-200 p-3">
					<p className="text-xs uppercase tracking-wide text-slate-500">
						Entitlements
					</p>
					<p className="mt-1 text-sm font-medium text-slate-900">
						{user.entitlementsCount}
					</p>
				</div>
				<div className="rounded-md border border-slate-200 p-3">
					<p className="text-xs uppercase tracking-wide text-slate-500">
						Billing Addresses
					</p>
					<p className="mt-1 text-sm font-medium text-slate-900">
						{user.billingAddresses.length}
					</p>
				</div>
			</div>

			<div className="space-y-2">
				<h4 className="text-sm font-medium text-slate-900">
					Billing Addresses
				</h4>
				{user.billingAddresses.length === 0 ? (
					<p className="text-sm text-slate-500">
						No billing addresses on file.
					</p>
				) : (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						{user.billingAddresses.map((address) => (
							<div
								key={address.id}
								className="rounded-md border border-slate-200 p-3 text-sm text-slate-600"
							>
								<p className="font-medium text-slate-900">
									{address.organization}
								</p>
								<p>{address.address}</p>
								<p>{address.email}</p>
								<p>ABN: {address.ABN}</p>
							</div>
						))}
					</div>
				)}
			</div>

			{error && (
				<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{error}
				</div>
			)}
		</div>
	);
}
