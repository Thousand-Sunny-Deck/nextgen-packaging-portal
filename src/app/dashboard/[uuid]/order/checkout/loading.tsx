import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

export default function CheckoutLoading() {
	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				{/* Title skeleton */}
				<div className="mt-15 h-9 w-32 bg-gray-200 rounded animate-pulse" />
				{/* Subtitle skeleton */}
				<div className="mt-1 h-5 w-64 bg-gray-200 rounded animate-pulse" />

				{/* Main checkout form skeleton */}
				<div className="w-full mt-10">
					<div className="hidden md:flex justify-between gap-6">
						{/* Cart Summary skeleton */}
						<div className="w-[60%]">
							<div className="space-y-4">
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className="border rounded-lg p-4 space-y-3 animate-pulse"
									>
										<div className="flex items-center justify-between">
											<div className="h-5 w-48 bg-gray-200 rounded" />
											<div className="h-5 w-24 bg-gray-200 rounded" />
										</div>
										<div className="flex items-center justify-between">
											<div className="h-4 w-32 bg-gray-200 rounded" />
											<div className="h-4 w-20 bg-gray-200 rounded" />
										</div>
										<div className="h-4 w-40 bg-gray-200 rounded" />
									</div>
								))}
							</div>
						</div>

						{/* Order Info skeleton */}
						<div className="w-[40%] space-y-6">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
									<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
								</div>
								<div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
								<div className="flex justify-between">
									<div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
									<div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
									<div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
								</div>
							</div>

							<div className="border rounded-lg p-6 space-y-4">
								<div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
								<div className="space-y-3">
									<div className="flex justify-between">
										<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
									</div>
									<div className="flex justify-between">
										<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
									</div>
									<div className="flex justify-between">
										<div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
										<div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
									</div>
								</div>
								<div className="border-t pt-4">
									<div className="flex justify-between">
										<div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
										<div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
									</div>
								</div>
							</div>

							<div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
						</div>
					</div>

					<div className="md:hidden pb-28 space-y-4">
						<div className="w-full border rounded-lg bg-white p-4 space-y-4">
							<div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
							<div className="space-y-2">
								<div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
								<div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
							</div>
							<div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
						</div>
						<div className="w-full border rounded-lg bg-white overflow-hidden">
							<div className="space-y-0">
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className="border-t first:border-t-0 p-4 space-y-3 animate-pulse"
									>
										<div className="flex items-center justify-between">
											<div className="h-5 w-2/3 bg-gray-200 rounded" />
											<div className="h-5 w-16 bg-gray-200 rounded" />
										</div>
										<div className="h-4 w-1/2 bg-gray-200 rounded" />
										<div className="h-4 w-20 bg-gray-200 rounded" />
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sticky mobile CTA skeleton */}
					<div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 md:hidden">
						<div className="mx-auto w-full max-w-7xl space-y-2">
							<div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
							<div className="h-11 w-full bg-gray-200 rounded animate-pulse" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
