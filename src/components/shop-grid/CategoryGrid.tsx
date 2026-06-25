import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { ShopCategory } from "@/actions/products/fetch-products-action";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
	categories: ShopCategory[];
	basePath: string;
	emptyMessage?: string;
	/** Render a leading "All products" tile linking to the unfiltered view. */
	includeAllTile?: boolean;
}

export const CategoryGrid = ({
	categories,
	basePath,
	emptyMessage = "No categories available yet.",
	includeAllTile = false,
}: CategoryGridProps) => {
	const hasCategories = categories.length > 0;

	return (
		<div className="w-full">
			{hasCategories ? (
				<div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
					{includeAllTile && (
						<Link
							href={`${basePath}?view=all`}
							className="group flex min-w-0 flex-col rounded-lg border border-border bg-white p-2.5 shadow-xs transition-colors hover:border-gray-300 md:p-3"
						>
							<div className="mb-2 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border bg-muted sm:mb-3 sm:aspect-square">
								<LayoutGrid className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="mb-1 line-clamp-2 min-h-9 text-xs font-medium sm:text-sm md:min-h-10">
								All products
							</h3>
							<p className="text-xs text-gray-500 sm:text-sm">
								Browse everything
							</p>
						</Link>
					)}
					{categories.map((category) => (
						<CategoryCard
							key={category.id}
							category={category}
							href={`${basePath}?category=${encodeURIComponent(category.handle)}`}
						/>
					))}
				</div>
			) : (
				<div className="border border-dashed p-6 text-center text-sm text-muted-foreground">
					{emptyMessage}
				</div>
			)}
		</div>
	);
};
