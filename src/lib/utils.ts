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
