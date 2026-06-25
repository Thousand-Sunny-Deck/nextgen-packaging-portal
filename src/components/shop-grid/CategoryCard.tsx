import Link from "next/link";
import type { ShopCategory } from "@/actions/products/fetch-products-action";

interface CategoryCardProps {
	category: ShopCategory;
	href: string;
}

export const CategoryCard = ({ category, href }: CategoryCardProps) => {
	return (
		<Link
			href={href}
			className="group min-w-0 rounded-lg border border-border bg-white p-2.5 shadow-xs transition-colors hover:border-gray-300 md:p-3"
		>
			<div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted sm:mb-3 sm:aspect-square">
				{category.imageUrl ? (
					<img
						src={category.imageUrl}
						alt={category.name}
						className="h-full w-full object-cover transition-transform group-hover:scale-105"
						loading="lazy"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
						No image
					</div>
				)}
			</div>

			<h3 className="mb-1 line-clamp-2 min-h-9 text-xs font-medium sm:text-sm md:min-h-10">
				{category.name}
			</h3>

			<p className="text-xs text-gray-500 sm:text-sm">
				{category.productCount}{" "}
				{category.productCount === 1 ? "product" : "products"}
			</p>
		</Link>
	);
};
