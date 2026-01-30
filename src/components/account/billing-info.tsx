"use client";

import { useState } from "react";
import { BillingInfoList } from "./billing-info-list";
import { BillingInfoForm } from "./billing-info-form";
import {
	BillingInfoItem,
	BillingInfoItemWithId,
} from "@/lib/store/billing-info-store";

interface BillingInfoProps {
	initialBillingAddresses: BillingInfoItemWithId[];
	userEmail: string;
}

export const BillingInfo = ({
	initialBillingAddresses,
	userEmail,
}: BillingInfoProps) => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [billingInfos, setBillingInfos] = useState<BillingInfoItemWithId[]>(
		initialBillingAddresses,
	);
	const [isSaving, setIsSaving] = useState(false);

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

	return (
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
	);
};
