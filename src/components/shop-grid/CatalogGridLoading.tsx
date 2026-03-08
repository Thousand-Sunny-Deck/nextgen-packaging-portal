import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

interface CatalogGridLoadingProps {
	title: string;
}

const CARD_COUNT = 12;

export const CatalogGridLoading = ({ title }: CatalogGridLoadingProps) => {
	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-5 mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl">{title}</h1>
						<p className="mt-1 text-xs md:text-sm text-gray-400">
							Select desired quantity (max. 999) and proceed to checkout below.
						</p>
					</div>
					<div className="h-10 w-full sm:w-72 rounded-md bg-gray-200 animate-pulse" />
				</div>

				<div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 md:gap-x-4 md:gap-y-6 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
					{Array.from({ length: CARD_COUNT }).map((_, index) => (
						<div
							key={index}
							className="overflow-hidden rounded-lg border border-gray-200"
						>
							<div className="aspect-square w-full bg-gray-200 animate-pulse" />
							<div className="space-y-3 p-4">
								<div className="h-4 w-4/5 rounded bg-gray-200 animate-pulse" />
								<div className="h-3 w-3/5 rounded bg-gray-200 animate-pulse" />
								<div className="h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
								<div className="h-9 w-full rounded bg-gray-200 animate-pulse" />
							</div>
						</div>
					))}
				</div>

				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
					<div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
					<div className="flex items-center gap-2">
						<div className="h-8 w-16 md:w-24 bg-gray-200 rounded animate-pulse" />
						<div className="flex gap-1">
							{Array.from({ length: 5 }).map((_, index) => (
								<div
									key={index}
									className="h-8 w-8 bg-gray-200 rounded animate-pulse"
								/>
							))}
						</div>
						<div className="h-8 w-16 md:w-24 bg-gray-200 rounded animate-pulse" />
					</div>
				</div>

				<div className="w-full flex pt-6 md:pt-8 items-center justify-center">
					<div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
				</div>
			</div>
		</div>
	);
};
