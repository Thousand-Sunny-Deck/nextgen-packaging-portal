import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

export default function Loading() {
	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<h1 className="mt-5 text-2xl md:text-3xl">Orders</h1>
				<h1 className="mt-1 text-xs md:text-sm text-gray-400">
					Select desired quantity (max. 999) and proceed to checkout below.
				</h1>

				{/* Search input skeleton */}
				<div className="w-full mt-4">
					<div className="w-full flex justify-between pb-4">
						<div className="w-full md:w-[50%] lg:w-[40%] h-10 bg-gray-200 rounded-sm animate-pulse" />
						<div className="h-9 w-9 sm:w-32 bg-gray-200 rounded-md animate-pulse" />
					</div>

					{/* Table skeleton */}
					<div className="w-full border rounded">
						{/* Table header */}
						<div className="border-b bg-gray-50">
							<div className="flex px-3 md:px-4 py-3">
								<div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
								<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
							</div>
						</div>

						{/* Table rows */}
						{[...Array(10)].map((_, i) => (
							<div key={i} className="border-b">
								<div className="flex px-3 md:px-4 py-4 items-center">
									<div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-4 md:mr-8" />
									<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
									<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
									<div className="flex-1 flex justify-center gap-2 mx-2 md:mx-4">
										<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
										<div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
										<div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
									</div>
									<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
									<div className="flex-1 h-4 bg-gray-200 rounded animate-pulse mx-2 md:mx-4" />
								</div>
							</div>
						))}
					</div>

					{/* Pagination skeleton */}
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

				{/* Checkout button skeleton */}
				<div className="w-full flex pt-6 md:pt-8 items-center justify-center">
					<div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
				</div>
			</div>
		</div>
	);
}
