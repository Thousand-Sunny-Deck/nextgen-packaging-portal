"use client";

import { useState } from "react";
import { Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveFavouriteAction } from "@/actions/favourites/save-favourite-action";
import { FavouriteNameModal } from "@/components/favourites/FavouriteNameModal";

interface OrderSuccessViewProps {
	placedOrderId: string | null;
	onGoToDashboard: () => void;
}

const OrderSuccessView = ({
	placedOrderId,
	onGoToDashboard,
}: OrderSuccessViewProps) => {
	const [modalOpen, setModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	const handleSaveFavourite = async (name: string) => {
		if (!placedOrderId) return;
		setIsSaving(true);
		try {
			const result = await saveFavouriteAction(placedOrderId, name);
			if (result.success) {
				toast.success("Saved to favourites!");
				setSaved(true);
				setModalOpen(false);
			} else {
				toast.error(result.error ?? "Failed to save favourite.");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="w-full mt-10 flex justify-center">
			<div className="bg-white rounded-xl p-10 flex flex-col items-center gap-6 max-w-md w-full text-center shadow-sm">
				<div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
					<CheckCircle className="w-9 h-9 text-green-600" />
				</div>

				<div>
					<h2 className="text-2xl font-bold mb-1">Order Placed!</h2>
					<p className="text-neutral-500 text-sm">
						Your order is being processed. You&apos;ll receive an email
						confirmation shortly.
					</p>
				</div>

				<div className="flex flex-col gap-3 w-full">
					{placedOrderId && !saved && (
						<Button
							variant="outline"
							className="w-full"
							onClick={() => setModalOpen(true)}
						>
							<Heart className="w-4 h-4 mr-2" />
							Save as Favourite
						</Button>
					)}
					{saved && (
						<Button variant="outline" className="w-full" disabled>
							<Heart className="w-4 h-4 mr-2 fill-red-400 text-red-400" />
							Saved to Favourites
						</Button>
					)}
					<Button className="w-full" onClick={onGoToDashboard}>
						Go to Dashboard
					</Button>
				</div>
			</div>

			<FavouriteNameModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				onSave={handleSaveFavourite}
				isSaving={isSaving}
			/>
		</div>
	);
};

export default OrderSuccessView;
