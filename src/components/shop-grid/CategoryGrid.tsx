import type { ShopCategory } from "@/actions/products/fetch-products-action";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
	categories: ShopCategory[];
	basePath: string;
	emptyMessage?: string;
}

export const CategoryGrid = ({
	categories,
	basePath,
	emptyMessage = "No categories available yet.",
}: CategoryGridProps) => {
	const hasCategories = categories.length > 0;

	return (
		<div className="w-full">
			{hasCategories ? (
				<div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
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
