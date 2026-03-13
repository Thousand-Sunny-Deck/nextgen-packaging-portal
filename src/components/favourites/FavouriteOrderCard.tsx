"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { FavouriteOrderData } from "@/actions/favourites/fetch-favourites-action";
import { deleteFavouriteAction } from "@/actions/favourites/delete-favourite-action";
import { addFavouriteToCartAction } from "@/actions/favourites/add-favourite-to-cart-action";
import { useCartStore } from "@/lib/store/product-store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";

const MAX_DISPLAYED_ITEMS = 3;

const formatTimeAgo = (date: Date): string => {
	const now = new Date();
	const diffMs = now.getTime() - new Date(date).getTime();
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	if (days === 0) return "today";
	if (days === 1) return "1d ago";
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	return `${Math.floor(months / 12)}y ago`;
};

interface FavouriteOrderCardProps {
	favourite: FavouriteOrderData;
	onDeleted: (id: string) => void;
}

const FavouriteOrderCard = ({
	favourite,
	onDeleted,
}: FavouriteOrderCardProps) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const [isAddingToCart, setIsAddingToCart] = useState(false);
	const populateCartFromOrder = useCartStore(
		(state) => state.populateCartFromOrder,
	);
	const router = useRouter();
	const pathname = usePathname();

	const displayedItems = favourite.items.slice(0, MAX_DISPLAYED_ITEMS);
	const extraCount = favourite.items.length - MAX_DISPLAYED_ITEMS;

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const result = await deleteFavouriteAction(favourite.id);
			if (result.success) {
				onDeleted(favourite.id);
			} else {
				toast.error(result.error ?? "Failed to delete.");
			}
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleAddToCart = async () => {
		setIsAddingToCart(true);
		try {
			const result = await addFavouriteToCartAction(favourite.id);
			if (!result.success) {
				toast.error(result.error ?? "Failed to load order.");
				return;
			}
			populateCartFromOrder(result.data.items);
			const segments = pathname.split("/").filter(Boolean);
			const base =
				segments.length >= 2 && segments[0] === "dashboard"
					? `/dashboard/${segments[1]}`
					: "/";
			router.push(`${base}/order/checkout`);
			toast.success("Order loaded! Review and proceed to checkout.");
		} catch {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsAddingToCart(false);
		}
	};

	return (
		<div className="bg-white rounded-lg p-4 flex flex-col gap-3 hover:bg-slate-50">
			<div className="flex items-start justify-between gap-3">
				<h3 className="font-semibold text-md">{favourite.name}</h3>
				<span className="text-sm text-neutral-400 whitespace-nowrap flex-shrink-0">
					Saved {formatTimeAgo(favourite.createdAt)}
				</span>
			</div>

			<div className="space-y-0.5">
				{displayedItems.map((item, index) => (
					<p key={index} className="text-neutral-400 text-sm">
						{item.quantity} X {item.name}
					</p>
				))}
				{extraCount > 0 && (
					<p className="text-neutral-400 text-sm">+{extraCount} more items</p>
				)}
			</div>

			<div className="flex items-center justify-between">
				<p className="text-xs text-neutral-400 italic">
					Prices update at checkout
				</p>
				<div className="flex items-center gap-2">
					<Button
						onClick={handleDelete}
						variant="secondary"
						disabled={isDeleting || isAddingToCart}
						aria-label="Remove favourite"
						className="p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:cursor-not-allowed"
					>
						{isDeleting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Trash2 className="h-4 w-4" />
						)}
					</Button>
					<Button
						onClick={handleAddToCart}
						disabled={isAddingToCart || isDeleting}
						className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
					>
						{isAddingToCart ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading...
							</>
						) : (
							"Add to Cart"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FavouriteOrderCard;
