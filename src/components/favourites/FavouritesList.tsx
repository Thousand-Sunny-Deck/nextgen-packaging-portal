"use client";

import { useState } from "react";
import { FavouriteOrderData } from "@/actions/favourites/fetch-favourites-action";
import FavouriteOrderCard from "./FavouriteOrderCard";

interface FavouritesListProps {
	initialFavourites: FavouriteOrderData[];
}

const FavouritesList = ({ initialFavourites }: FavouritesListProps) => {
	const [favourites, setFavourites] =
		useState<FavouriteOrderData[]>(initialFavourites);

	const handleDeleted = (id: string) => {
		setFavourites((prev) => prev.filter((f) => f.id !== id));
	};

	if (favourites.length === 0) {
		return (
			<div className="border border-dashed border-neutral-300 bg-white rounded-lg p-12 text-center">
				<p className="text-neutral-600 font-medium">No favourites yet</p>
				<p className="text-sm text-neutral-400 mt-2">
					Heart an order from Recent Orders or after checkout
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{favourites.map((favourite) => (
				<FavouriteOrderCard
					key={favourite.id}
					favourite={favourite}
					onDeleted={handleDeleted}
				/>
			))}
		</div>
	);
};

export default FavouritesList;
