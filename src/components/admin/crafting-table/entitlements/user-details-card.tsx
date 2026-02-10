"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X, Pencil } from "lucide-react";
import {
	EntitlementUser,
	BillingAddressInfo,
	UpdateUserInput,
	updateUserDetails,
} from "@/actions/admin/entitlements-actions";
import { UserRole } from "@/generated/prisma/enums";

type UserDetailsCardProps = {
	user: EntitlementUser;
	onUserUpdated: (updated: Partial<EntitlementUser>) => void;
};

export function UserDetailsCard({ user, onUserUpdated }: UserDetailsCardProps) {
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [name, setName] = useState(user.name);
	const [role, setRole] = useState<UserRole>(user.role);
	const [error, setError] = useState<string | null>(null);

	const handleSave = async () => {
		setSaving(true);
		setError(null);

		const input: UpdateUserInput = {};
		if (name !== user.name) input.name = name;
		if (role !== user.role) input.role = role;

		if (Object.keys(input).length === 0) {
			setEditing(false);
			setSaving(false);
			return;
		}

		const result = await updateUserDetails(user.id, input);

		if (result.success) {
			onUserUpdated({ name, role });
			setEditing(false);
		} else {
			setError(result.error ?? "Failed to update user");
		}

		setSaving(false);
	};

	const handleCancel = () => {
		setName(user.name);
		setRole(user.role);
		setError(null);
		setEditing(false);
	};

	return (
		<div className="rounded-lg border p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium text-sm">User Details</h3>
				{!editing ? (
					<Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
						<Pencil className="h-3 w-3 mr-1" />
						Edit
					</Button>
				) : (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCancel}
							disabled={saving}
						>
							<X className="h-3 w-3 mr-1" />
							Cancel
						</Button>
						<Button size="sm" onClick={handleSave} disabled={saving}>
							{saving ? (
								<Loader2 className="h-3 w-3 mr-1 animate-spin" />
							) : (
								<Save className="h-3 w-3 mr-1" />
							)}
							Save
						</Button>
					</div>
				)}
			</div>

			{error && <p className="text-sm text-red-500">{error}</p>}

			<div className="grid grid-cols-2 gap-4 text-sm">
				{/* Name */}
				<div>
					<label className="text-gray-500 text-xs">Name</label>
					{editing ? (
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1 h-8 text-sm"
						/>
					) : (
						<p className="mt-1">{user.name}</p>
					)}
				</div>

				{/* Email (read-only) */}
				<div>
					<label className="text-gray-500 text-xs">Email</label>
					<p className="mt-1">{user.email}</p>
				</div>

				{/* Role */}
				<div>
					<label className="text-gray-500 text-xs">Role</label>
					{editing ? (
						<select
							value={role}
							onChange={(e) => setRole(e.target.value as UserRole)}
							className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
						>
							<option value="USER">USER</option>
							<option value="ADMIN">ADMIN</option>
							<option value="SUPER_ADMIN">SUPER_ADMIN</option>
						</select>
					) : (
						<p className="mt-1">{user.role}</p>
					)}
				</div>

				{/* Created */}
				<div>
					<label className="text-gray-500 text-xs">Created</label>
					<p className="mt-1">
						{new Date(user.createdAt).toLocaleDateString()}
					</p>
				</div>
			</div>

			{/* Billing Addresses */}
			{user.billingAddresses.length > 0 && (
				<div>
					<label className="text-gray-500 text-xs">
						Billing Addresses ({user.billingAddresses.length})
					</label>
					<div className="mt-1 space-y-2">
						{user.billingAddresses.map((addr: BillingAddressInfo) => (
							<div
								key={addr.id}
								className="rounded border p-2 text-xs text-gray-600 space-y-0.5"
							>
								<p>{addr.organization}</p>
								<p>{addr.address}</p>
								<p>
									{addr.email} | ABN: {addr.ABN}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
