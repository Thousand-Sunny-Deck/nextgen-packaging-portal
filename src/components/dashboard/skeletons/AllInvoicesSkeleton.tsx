const AllInvoicesSkeleton = () => {
	return (
		<div className="w-full h-full flex flex-col gap-2 pt-6">
			<div className="py-4 px-2 flex flex-col gap-2">
				<p className="text-3xl font-bold">Review Past Orders 📝</p>
				<p className="text-md font-light">
					Click on more options to view your invoice.
				</p>
			</div>

			<div className="h-full w-full animate-pulse">
				{/* Search and filter bar skeleton */}
				<div className="flex items-center justify-between py-4">
					<div className="h-10 w-64 bg-gray-200 rounded" />
				</div>

				{/* Table skeleton */}
				<div className="rounded-md border">
					{/* Header */}
					<div className="border-b bg-gray-50 px-4 py-3 flex gap-4">
						<div className="h-4 w-20 bg-gray-200 rounded" />
						<div className="h-4 w-32 bg-gray-200 rounded flex-1" />
						<div className="h-4 w-20 bg-gray-200 rounded" />
						<div className="h-4 w-20 bg-gray-200 rounded" />
						<div className="h-4 w-8 bg-gray-200 rounded" />
					</div>

					{/* Rows */}
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="border-b px-4 py-4 flex items-center gap-4">
							<div className="h-4 w-24 bg-gray-200 rounded" />
							<div className="h-4 w-40 bg-gray-200 rounded flex-1" />
							<div className="h-4 w-20 bg-gray-200 rounded" />
							<div className="h-6 w-20 bg-gray-200 rounded-full" />
							<div className="h-8 w-8 bg-gray-200 rounded" />
						</div>
					))}
				</div>

				{/* Pagination skeleton */}
				<div className="flex items-center justify-between py-4">
					<div className="h-4 w-32 bg-gray-200 rounded" />
					<div className="flex gap-2">
						<div className="h-8 w-20 bg-gray-200 rounded" />
						<div className="h-8 w-20 bg-gray-200 rounded" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AllInvoicesSkeleton;
