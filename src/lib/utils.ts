import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a full orderId to a user-friendly display ID.
 * Example: "ORD-20260108123456-X7K9P" → "X7K9P"
 *
 * @param orderId - The full order ID (e.g., "ORD-20260108123456-X7K9P")
 * @returns The short display ID (last 5 characters)
 */
export function getDisplayOrderId(
	orderId: string,
	section: "active" | "recent",
): string {
	const parts = orderId.split("-");

	if (section === "active") return parts[parts.length - 1] || orderId;

	return `${parts[0]}-${parts[parts.length - 1]}` || orderId;
}

export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function getPaginationRange({
	page,
	pageSize,
	total,
}: {
	page: number;
	pageSize: number;
	total: number;
}) {
	if (total <= 0) {
		return { startRow: 0, endRow: 0 };
	}

	const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
	const safePageSize = Number.isFinite(pageSize)
		? Math.max(1, Math.floor(pageSize))
		: 1;

	return {
		startRow: Math.min((safePage - 1) * safePageSize + 1, total),
		endRow: Math.min(safePage * safePageSize, total),
	};
}
