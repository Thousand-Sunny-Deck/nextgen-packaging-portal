"use client";

import { Button } from "@/components/ui/button";
import { BillingInfoItemWithId } from "@/lib/store/billing-info-store";
import { Building, IdCard, MapPin, Pencil, Trash2 } from "lucide-react";

interface BillingInfoCardProps {
	billingInfo: BillingInfoItemWithId;
	onEdit: (id: string) => void;
	onDelete?: (id: string) => void;
}

export const BillingInfoCard = ({
	billingInfo,
	onEdit,
	onDelete,
}: BillingInfoCardProps) => {
	const formatAddress = (address: string) => {
		// Split by comma and trim each part
		const parts = address.split(",").map((part) => part.trim());
		if (parts.length >= 3) {
			// Format: street, suburb postcode, country
			return (
				<>
					{parts[0]}
					<br />
					{parts.slice(1, -1).join(", ")}
					<br />
					{parts[parts.length - 1]}
				</>
			);
		}
		// Fallback: just show as-is with commas replaced by line breaks
		return parts.map((part, i) => (
			<span key={i}>
				{part}
				{i < parts.length - 1 && <br />}
			</span>
		));
	};

	return (
		<div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start gap-4">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Building className="w-4 h-4 text-slate-500" />
						<span className="font-medium text-slate-800">
							{billingInfo.organization}
						</span>
					</div>

					<div className="flex items-start gap-2">
						<MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
						<span className="text-sm text-slate-600">
							{formatAddress(billingInfo.address)}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<IdCard className="w-4 h-4 text-slate-500" />
						<span className="text-sm text-slate-600">
							ABN: {billingInfo.ABN}
						</span>
					</div>
				</div>

				<div className="flex gap-1">
					{onDelete && (
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={() => onDelete(billingInfo.id)}
							className="text-red-600 hover:text-red-700 hover:bg-red-50"
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => onEdit(billingInfo.id)}
					>
						<Pencil className="w-4 h-4" />
					</Button>
				</div>
			</div>
		</div>
	);
};
