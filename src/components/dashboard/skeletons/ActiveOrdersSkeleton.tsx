const ActiveOrdersSkeleton = () => {
	return (
		<div className="bg-orange-50 rounded-xl p-4">
			<h2 className="text-lg font-bold mb-6">Active</h2>
			<div className="space-y-2">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="bg-white rounded-lg p-2 flex items-center justify-between animate-pulse"
					>
						<div className="flex flex-col gap-2">
							<div className="h-5 w-24 bg-gray-200 rounded" />
							<div className="h-4 w-16 bg-gray-200 rounded" />
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 rounded-full bg-gray-200" />
							<div className="h-4 w-20 bg-gray-200 rounded" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ActiveOrdersSkeleton;
