"use client";

import Image from "next/image";
import { FavouriteOrderData } from "@/actions/favourites/fetch-favourites-action";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	favourite: FavouriteOrderData;
}

const FavouriteOrderDetailModal = ({
	open,
	onOpenChange,
	favourite,
}: Props) => {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="bottom" className="h-[80vh] rounded-t-xl px-6 pb-6">
				<SheetHeader className="px-0 pb-4">
					<SheetTitle>{favourite.name}</SheetTitle>
					<p className="text-sm text-neutral-500">
						{favourite.items.length} item
						{favourite.items.length !== 1 ? "s" : ""}
					</p>
				</SheetHeader>

				<div className="h-full overflow-y-auto pb-8">
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
						{favourite.items.map((item, index) => (
							<div key={index} className="flex flex-col gap-1">
								<div className="aspect-square w-full overflow-hidden rounded-md border bg-muted">
									{item.imageUrl ? (
										<Image
											src={item.imageUrl}
											alt={item.name}
											width={200}
											height={200}
											sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
											className="h-full w-full object-cover"
											loading="lazy"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
											No image
										</div>
									)}
								</div>
								<p className="text-sm font-medium text-neutral-500">
									{item.quantity}×
								</p>
								<p
									className="truncate text-sm text-neutral-700"
									title={item.name}
								>
									{item.name}
								</p>
							</div>
						))}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default FavouriteOrderDetailModal;
