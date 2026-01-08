import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

export default function Loading() {
	return (
		<div className="ml-80 mt-15 w-7/12 h-full pb-20">
			<DynamicBreadcrumb />
			<h1 className="mt-5 text-3xl">Orders</h1>
			<h1 className="mt-1 text-xs text-gray-400">
				Select desired quantity (max. 999) and proceed to checkout below.
			</h1>

			{/* Search input skeleton */}
			<div className="w-full mt-4">
				<div className="w-full flex justify-end pb-4">
					<div className="w-[40%] h-10 bg-gray-200 rounded-sm animate-pulse" />
				</div>

				{/* Table skeleton */}
				<div className="w-full border rounded">
					{/* Table header */}
					<div className="border-b bg-gray-50">
						<div className="flex px-4 py-3">
							<div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
							<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
							<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
							<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
							<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
							<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
						</div>
					</div>

					{/* Table rows */}
					{[...Array(10)].map((_, i) => (
						<div key={i} className="border-b">
							<div className="flex px-4 py-4 items-center">
								<div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-8" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
								<div className="flex-1 flex justify-center gap-2 mx-4">
									<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
									<div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
									<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
								</div>
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-4" />
							</div>
						</div>
					))}
				</div>

				{/* Pagination skeleton */}
				<div className="flex items-center justify-between py-4">
					<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
					<div className="flex items-center gap-2">
						<div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
						<div className="flex gap-1">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="h-8 w-8 bg-gray-200 rounded animate-pulse"
								/>
							))}
						</div>
						<div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
					</div>
				</div>
			</div>

			{/* Checkout button skeleton */}
			<div className="mt-4 h-10 w-32 bg-gray-200 rounded animate-pulse" />
		</div>
	);
}
