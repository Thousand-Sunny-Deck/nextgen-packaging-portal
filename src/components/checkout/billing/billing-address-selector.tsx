"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Building, MapPin } from "lucide-react";
import {
	BillingInfoItemWithId,
	useBillingInfoStore,
} from "@/lib/store/billing-info-store";
import { AddBillingAddressModal } from "./add-billing-address-modal";

interface BillingAddressSelectorProps {
	email: string;
	onBillingComplete: () => void;
}

const BillingAddressSelector = ({
	email,
	onBillingComplete,
}: BillingAddressSelectorProps) => {
	const [addresses, setAddresses] = useState<BillingInfoItemWithId[]>([]);
	const [selectedId, setSelectedId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { setBillingInfo } = useBillingInfoStore();

	useEffect(() => {
		const fetchAddresses = async () => {
			try {
				const response = await fetch("/api/billing-addresses");
				const result = await response.json();
				if (result.success) {
					setAddresses(result.data);
					// Auto-select first address if available
					if (result.data.length > 0) {
						setSelectedId(result.data[0].id);
					}
				}
			} catch (error) {
				console.error("Error fetching billing addresses:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchAddresses();
	}, []);

	const handleAddressCreated = (newAddress: BillingInfoItemWithId) => {
		setAddresses((prev) => [newAddress, ...prev]);
		setSelectedId(newAddress.id);
	};

	const handleContinue = () => {
		const selectedAddress = addresses.find((addr) => addr.id === selectedId);
		if (selectedAddress) {
			setBillingInfo({
				email: selectedAddress.email,
				organization: selectedAddress.organization,
				address: selectedAddress.address,
				ABN: selectedAddress.ABN,
			});
			onBillingComplete();
		}
	};

	const selectedAddress = addresses.find((addr) => addr.id === selectedId);

	const truncateAddress = (address: string, maxLength: number = 35) => {
		if (address.length <= maxLength) return address;
		return address.substring(0, maxLength) + "...";
	};

	if (isLoading) {
		return (
			<div className="w-full lg:w-[60%] min-h-[300px] lg:h-[400px]">
				<div className="w-full md:w-2/3 space-y-4">
					<div className="h-10 bg-slate-200 rounded animate-pulse" />
					<div className="h-24 bg-slate-200 rounded animate-pulse" />
				</div>
			</div>
		);
	}

	return (
		<div className="w-full lg:w-[60%] min-h-[300px] lg:h-[400px]">
			<div className="w-full md:w-2/3 space-y-6">
				<div className="space-y-2">
					<label className="text-sm font-medium text-slate-700">
						Select Billing Address
					</label>
					<Select value={selectedId} onValueChange={setSelectedId}>
						<SelectTrigger className="w-full bg-white">
							<SelectValue placeholder="Select a billing address" />
						</SelectTrigger>
						<SelectContent>
							{addresses.map((address) => (
								<SelectItem key={address.id} value={address.id}>
									<div className="flex items-center gap-2">
										<Building className="w-4 h-4 text-slate-500" />
										<span className="font-medium">{address.organization}</span>
										<span className="text-slate-500">-</span>
										<span className="text-slate-500 text-sm">
											{truncateAddress(address.address)}
										</span>
									</div>
								</SelectItem>
							))}
							{addresses.length === 0 && (
								<div className="px-2 py-4 text-center text-slate-500 text-sm">
									No billing addresses found
								</div>
							)}
						</SelectContent>
					</Select>
				</div>

				<Button
					variant="outline"
					className="w-full justify-start gap-2"
					onClick={() => setIsModalOpen(true)}
				>
					<Plus className="w-4 h-4" />
					Add New Billing Address
				</Button>

				{selectedAddress && (
					<div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
						<h3 className="text-sm font-medium text-slate-700 mb-3">
							Selected Address
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<Building className="w-4 h-4 text-slate-500" />
								<span className="font-medium">
									{selectedAddress.organization}
								</span>
							</div>
							<div className="flex items-start gap-2">
								<MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
								<span className="text-slate-600">
									{selectedAddress.address}
								</span>
							</div>
							<div className="text-slate-500">ABN: {selectedAddress.ABN}</div>
						</div>
					</div>
				)}

				<Button
					onClick={handleContinue}
					disabled={!selectedId}
					className="w-full"
				>
					Continue to Order
				</Button>

				<AddBillingAddressModal
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
					defaultEmail={email}
					onAddressCreated={handleAddressCreated}
				/>
			</div>
		</div>
	);
};

export default BillingAddressSelector;
