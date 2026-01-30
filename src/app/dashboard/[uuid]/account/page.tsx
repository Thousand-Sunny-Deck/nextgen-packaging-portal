"use client";

import { useState, useEffect, useCallback } from "react";
import { BillingInfoList } from "@/components/account/billing-info-list";
import { BillingInfoForm } from "@/components/account/billing-info-form";
import {
	BillingInfoItem,
	BillingInfoItemWithId,
} from "@/lib/store/billing-info-store";
import { authClient } from "@/lib/config/auth-client";

const AccountPage = () => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [billingInfos, setBillingInfos] = useState<BillingInfoItemWithId[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const { data: session, isPending } = authClient.useSession();

	const fetchBillingAddresses = useCallback(async () => {
		try {
			const response = await fetch("/api/billing-addresses");
			const result = await response.json();
			if (result.success) {
				setBillingInfos(result.data);
			}
		} catch (error) {
			console.error("Error fetching billing addresses:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchBillingAddresses();
	}, [fetchBillingAddresses]);

	const handleEdit = (id: string) => {
		setEditingId(id);
	};

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/billing-addresses/${id}`, {
				method: "DELETE",
			});
			const result = await response.json();
			if (result.success) {
				setBillingInfos((prev) => prev.filter((info) => info.id !== id));
				if (editingId === id) {
					setEditingId(null);
				}
			}
		} catch (error) {
			console.error("Error deleting billing address:", error);
		}
	};

	const handleSave = async (data: BillingInfoItem) => {
		setIsSaving(true);
		try {
			if (editingId) {
				// Update existing
				const response = await fetch(`/api/billing-addresses/${editingId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
				const result = await response.json();
				if (result.success) {
					setBillingInfos((prev) =>
						prev.map((info) =>
							info.id === editingId ? { ...result.data } : info,
						),
					);
				}
			} else {
				// Create new
				const response = await fetch("/api/billing-addresses", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});
				const result = await response.json();
				if (result.success) {
					setBillingInfos((prev) => [result.data, ...prev]);
				}
			}
			setEditingId(null);
		} catch (error) {
			console.error("Error saving billing address:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	const getEditingBillingInfo = (): BillingInfoItemWithId | undefined => {
		if (!editingId) return undefined;
		return billingInfos.find((info) => info.id === editingId);
	};

	if (isPending || isLoading) {
		return null;
	}

	const userEmail = session?.user?.email ?? "";

	return (
		<div className="w-full min-h-screen bg-white">
			<div className="w-full px-8 md:px-20 lg:px-32 py-8 flex flex-col gap-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-bold text-slate-800">
						Account Settings
					</h1>
					<p className="text-sm font-light text-gray-500">
						Manage all your billing addresses here.
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left Column - Billing Addresses List */}
					<div className="flex-1 lg:max-w-md">
						<h2 className="text-md font-semibold text-slate-800 mb-4">
							Billing Addresses
						</h2>
						<BillingInfoList
							billingInfos={billingInfos}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					</div>

					{/* Vertical Divider */}
					<div className="hidden lg:block w-px bg-slate-200" />

					{/* Right Column - Form */}
					<div className="flex-1 lg:max-w-lg">
						<BillingInfoForm
							initialData={getEditingBillingInfo()}
							defaultEmail={userEmail}
							onSave={handleSave}
							onCancel={handleCancel}
							isEditing={editingId !== null}
							isSaving={isSaving}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AccountPage;
