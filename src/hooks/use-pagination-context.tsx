"use client";

import { ProductTableStore } from "@/lib/store/product-store";
import { Table } from "@tanstack/react-table";

type PaginationContextInfo = {
	table: Table<ProductTableStore>;
	pagination: {
		pageIndex: number;
		pageSize: number;
	};
};

export const usePaginationContext = (
	paginationContextInfo: PaginationContextInfo,
) => {
	const { table, pagination } = paginationContextInfo;
	const totalPages = table.getPageCount();
	const totalRows = table.getPrePaginationRowModel().rows.length;
	const currentPage = pagination.pageIndex + 1;
	const pageSize = pagination.pageSize;

	const startRow = currentPage * pageSize + 1;
	const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

	const generatePageNumbers = () => {
		const pages: (number | string)[] = [];
		const showEllipsis = totalPages > 5;

		if (!showEllipsis) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			if (currentPage <= 4) {
				// Near the start: show 1, 2, 3, 4, 5, ..., last
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 3) {
				// Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
				pages.push("ellipsis");
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				// In the middle: show 1, ..., current-1, current, current+1, ..., last
				pages.push("ellipsis");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push("ellipsis");
				pages.push(totalPages);
			}
		}

		return pages;
	};

	return {
		totalPages,
		totalRows,
		currentPage,
		pageSize,
		startRow,
		endRow,
		generatePageNumbers,
	};
};
