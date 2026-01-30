const BillingInfoCardSkeleton = () => {
	return (
		<div className="border border-slate-200 rounded-lg p-4 bg-white animate-pulse">
			<div className="flex justify-between items-start gap-4">
				<div className="flex flex-col gap-3 flex-1">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-slate-200 rounded" />
						<div className="h-5 w-32 bg-slate-200 rounded" />
					</div>
					<div className="flex items-start gap-2">
						<div className="w-4 h-4 bg-slate-200 rounded mt-0.5" />
						<div className="flex flex-col gap-1">
							<div className="h-4 w-40 bg-slate-200 rounded" />
							<div className="h-4 w-36 bg-slate-200 rounded" />
							<div className="h-4 w-24 bg-slate-200 rounded" />
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-slate-200 rounded" />
						<div className="h-4 w-28 bg-slate-200 rounded" />
					</div>
				</div>
				<div className="flex gap-1">
					<div className="w-8 h-8 bg-slate-200 rounded" />
					<div className="w-8 h-8 bg-slate-200 rounded" />
				</div>
			</div>
		</div>
	);
};

const BillingInfoListSkeleton = () => {
	return (
		<div className="flex flex-col gap-4">
			{[1, 2, 3].map((i) => (
				<BillingInfoCardSkeleton key={i} />
			))}
		</div>
	);
};

const BillingInfoFormSkeleton = () => {
	return (
		<div className="w-full animate-pulse">
			<div className="h-6 w-40 bg-slate-200 rounded mb-6" />
			<div className="space-y-6">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="space-y-2">
						<div className="h-4 w-28 bg-slate-200 rounded" />
						<div className="h-10 w-full bg-slate-200 rounded" />
						<div className="h-3 w-48 bg-slate-200 rounded" />
					</div>
				))}
				<div className="flex gap-3 pt-2">
					<div className="h-9 w-20 bg-slate-200 rounded" />
					<div className="h-9 w-32 bg-slate-200 rounded" />
				</div>
			</div>
		</div>
	);
};

const BillingInfoSkeleton = () => {
	return (
		<div className="flex flex-col lg:flex-row gap-8">
			<div className="flex-1 lg:max-w-md">
				<h2 className="text-md font-semibold text-slate-800 mb-4">
					Billing Addresses
				</h2>
				<BillingInfoListSkeleton />
			</div>
			<div className="hidden lg:block w-px bg-slate-200" />
			<div className="flex-1 lg:max-w-lg">
				<BillingInfoFormSkeleton />
			</div>
		</div>
	);
};

export default BillingInfoSkeleton;
