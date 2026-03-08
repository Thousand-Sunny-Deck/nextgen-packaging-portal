"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaginationRange } from "@/lib/utils";

interface CatalogPaginationProps {
	page: number;
	totalPages: number;
	total: number;
	pageSize: number;
}

const generatePageNumbers = (
	currentPage: number,
	totalPages: number,
): (number | "ellipsis")[] => {
	const pages: (number | "ellipsis")[] = [];
	const showEllipsis = totalPages > 5;

	if (!showEllipsis) {
		for (let i = 1; i <= totalPages; i++) pages.push(i);
	} else {
		pages.push(1);
		if (currentPage <= 4) {
			for (let i = 2; i <= 5; i++) pages.push(i);
			pages.push("ellipsis");
			pages.push(totalPages);
		} else if (currentPage >= totalPages - 3) {
			pages.push("ellipsis");
			for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
		} else {
			pages.push("ellipsis");
			for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
			pages.push("ellipsis");
			pages.push(totalPages);
		}
	}

	return pages;
};

export const CatalogPagination = ({
	page,
	totalPages,
	total,
	pageSize,
}: CatalogPaginationProps) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const createPageUrl = (newPage: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", String(newPage));
		return `${pathname}?${params.toString()}`;
	};

	const { startRow, endRow } = getPaginationRange({
		page,
		pageSize,
		total,
	});

	return (
		<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
			<div className="text-sm text-gray-600">
				Showing {startRow} to {endRow} of {total} products
			</div>

			{totalPages > 1 && (
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						asChild={page > 1}
						className="h-8 px-2 md:px-3"
					>
						{page > 1 ? (
							<Link href={createPageUrl(page - 1)}>
								<ChevronLeft className="h-4 w-4" />
								<span className="ml-1 hidden md:inline">Previous</span>
							</Link>
						) : (
							<>
								<ChevronLeft className="h-4 w-4" />
								<span className="ml-1 hidden md:inline">Previous</span>
							</>
						)}
					</Button>

					<div className="flex items-center gap-1">
						{generatePageNumbers(page, totalPages).map((p, index) => {
							if (p === "ellipsis") {
								return (
									<span
										key={`ellipsis-${index}`}
										className="px-2 text-gray-400"
									>
										...
									</span>
								);
							}
							return (
								<Button
									key={p}
									variant={page === p ? "default" : "outline"}
									size="sm"
									asChild
									className="h-8 w-8 p-0"
								>
									<Link href={createPageUrl(p)}>{p}</Link>
								</Button>
							);
						})}
					</div>

					<Button
						variant="outline"
						size="sm"
						disabled={page >= totalPages}
						asChild={page < totalPages}
						className="h-8 px-2 md:px-3"
					>
						{page < totalPages ? (
							<Link href={createPageUrl(page + 1)}>
								<span className="mr-1 hidden md:inline">Next</span>
								<ChevronRight className="h-4 w-4" />
							</Link>
						) : (
							<>
								<span className="mr-1 hidden md:inline">Next</span>
								<ChevronRight className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
};
