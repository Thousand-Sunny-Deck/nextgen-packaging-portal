const RecentOrdersSkeleton = () => {
	return (
		<div className="bg-orange-50 rounded-xl p-4">
			<h2 className="text-lg font-bold mb-4">Recent</h2>
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div
						key={i}
						className="bg-white rounded-lg p-4 flex items-center justify-between gap-6 animate-pulse"
					>
						<div className="flex-1 min-w-0">
							<div className="flex items-baseline gap-3 mb-2">
								<div className="h-5 w-28 bg-gray-200 rounded" />
								<div className="h-4 w-8 bg-gray-200 rounded" />
							</div>
							<div className="space-y-1">
								<div className="h-4 w-48 bg-gray-200 rounded" />
								<div className="h-4 w-40 bg-gray-200 rounded" />
							</div>
						</div>
						<div className="flex items-center gap-6 flex-shrink-0">
							<div className="h-5 w-16 bg-gray-200 rounded" />
							<div className="h-10 w-24 bg-gray-200 rounded-lg" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default RecentOrdersSkeleton;
