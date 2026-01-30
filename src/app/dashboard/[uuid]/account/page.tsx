"use client";

import { useState, useEffect } from "react";
import { BillingInfoList } from "@/components/account/billing-info-list";
import { BillingInfoForm } from "@/components/account/billing-info-form";
import {
	useBillingInfoStore,
	BillingInfoItem,
	BillingInfoItemWithId,
} from "@/lib/store/billing-info-store";
import { authClient } from "@/lib/config/auth-client";

const AccountPage = () => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isHydrated, setIsHydrated] = useState(false);

	const { data: session, isPending } = authClient.useSession();
	const { billingInfos, addBillingInfo, updateBillingInfo, deleteBillingInfo } =
		useBillingInfoStore();

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const handleEdit = (id: string) => {
		setEditingId(id);
	};

	const handleDelete = (id: string) => {
		deleteBillingInfo(id);
		if (editingId === id) {
			setEditingId(null);
		}
	};

	const handleSave = (data: BillingInfoItem) => {
		if (editingId) {
			updateBillingInfo(editingId, data);
		} else {
			addBillingInfo(data);
		}
		setEditingId(null);
	};

	const handleCancel = () => {
		setEditingId(null);
	};

	const getEditingBillingInfo = (): BillingInfoItemWithId | undefined => {
		if (!editingId) return undefined;
		return billingInfos.find((info) => info.id === editingId);
	};

	if (!isHydrated || isPending) {
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
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AccountPage;
