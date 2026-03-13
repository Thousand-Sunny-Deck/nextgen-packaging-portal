import { DashboardFooter } from "@/components/dashboard/DashboardFooter";

export default function FavouritesLoading() {
	return (
		<div className="w-screen min-h-screen flex flex-col">
			<div className="w-full flex flex-1 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 mt-8">
				<div className="w-full flex flex-col gap-4">
					<div>
						<div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
						<div className="mt-2 h-4 w-72 rounded bg-gray-200 animate-pulse" />
					</div>

					<div className="bg-orange-50 rounded-xl p-4">
						<div className="grid gap-4">
							{Array.from({ length: 4 }).map((_, index) => (
								<div
									key={index}
									className="rounded-lg border border-orange-100 bg-white p-4"
								>
									<div className="h-5 w-44 rounded bg-gray-200 animate-pulse" />
									<div className="mt-3 h-4 w-56 rounded bg-gray-200 animate-pulse" />
									<div className="mt-2 h-4 w-36 rounded bg-gray-200 animate-pulse" />
									<div className="mt-4 flex gap-2">
										<div className="h-9 w-24 rounded bg-gray-200 animate-pulse" />
										<div className="h-9 w-24 rounded bg-gray-200 animate-pulse" />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<DashboardFooter />
		</div>
	);
}
