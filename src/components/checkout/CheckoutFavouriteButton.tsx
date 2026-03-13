"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useCartStore } from "@/lib/store/product-store";
import { FavouriteNameModal } from "@/components/favourites/FavouriteNameModal";
import { Button } from "../ui/button";

const CheckoutFavouriteButton = () => {
	const { pendingFavouriteName, setPendingFavouriteName } = useCartStore();
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<>
			<Button
				onClick={() =>
					pendingFavouriteName
						? setPendingFavouriteName(null)
						: setModalOpen(true)
				}
				className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
				variant="secondary"
			>
				{pendingFavouriteName ? `${pendingFavouriteName}` : "Save as favourite"}
				<Heart
					className={`h-4 w-4 ${pendingFavouriteName ? "fill-red-400 text-red-400" : ""}`}
				/>
			</Button>

			<FavouriteNameModal
				open={modalOpen}
				onOpenChange={setModalOpen}
				onSave={async (name) => {
					setPendingFavouriteName(name);
					setModalOpen(false);
				}}
			/>
		</>
	);
};

export default CheckoutFavouriteButton;
