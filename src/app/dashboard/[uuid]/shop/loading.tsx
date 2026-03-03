import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

function CatalogCardSkeleton() {
	return (
		<div className="min-w-0 border border-border bg-white p-2 md:p-3 shadow-xs">
			{/* Image area */}
			<div className="mb-2 aspect-[4/3] w-full border bg-gray-200 animate-pulse sm:mb-3 sm:aspect-square" />

			{/* Product name — two lines */}
			<div className="mb-2 min-h-9 space-y-1.5 md:mb-3 md:min-h-10">
				<div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
				<div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
			</div>

			{/* Quantity control */}
			<div className="mb-2 flex items-center gap-1 md:mb-3">
				<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
				<div className="h-8 flex-1 bg-gray-200 rounded animate-pulse" />
				<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
			</div>

			{/* Select button */}
			<div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
		</div>
	);
}

export default function Loading() {
	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<h1 className="mt-5 text-2xl md:text-3xl">Shop</h1>
				<p className="mt-1 text-xs md:text-sm text-gray-400">
					Select desired quantity (max. 999) and proceed to checkout below.
				</p>

				{/* Card grid */}
				<div className="w-full mt-4 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
					{[...Array(12)].map((_, i) => (
						<CatalogCardSkeleton key={i} />
					))}
				</div>

				{/* Pagination */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
					<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
					<div className="flex items-center gap-2">
						<div className="h-8 w-16 md:w-24 bg-gray-200 rounded animate-pulse" />
						<div className="flex gap-1">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="h-8 w-8 bg-gray-200 rounded animate-pulse"
								/>
							))}
						</div>
						<div className="h-8 w-16 md:w-24 bg-gray-200 rounded animate-pulse" />
					</div>
				</div>
			</div>
		</div>
	);
}
