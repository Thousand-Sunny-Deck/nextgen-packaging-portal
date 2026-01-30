"use client";

import { BillingInfoItemWithId } from "@/lib/store/billing-info-store";
import { BillingInfoCard } from "./billing-info-card";
import { FileText } from "lucide-react";

interface BillingInfoListProps {
	billingInfos: BillingInfoItemWithId[];
	onEdit: (id: string) => void;
	onDelete?: (id: string) => void;
}

export const BillingInfoList = ({
	billingInfos,
	onEdit,
	onDelete,
}: BillingInfoListProps) => {
	if (billingInfos.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-slate-500">
				<FileText className="w-12 h-12 mb-4 text-slate-300" />
				<p className="text-lg font-medium">No billing addresses yet</p>
				<p className="text-sm">Add your first billing address using the form</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
			{billingInfos.map((billingInfo) => (
				<BillingInfoCard
					key={billingInfo.id}
					billingInfo={billingInfo}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};
