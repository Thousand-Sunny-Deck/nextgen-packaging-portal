/**
 * Isomorphic helpers for delivery-day scheduling and order notes.
 *
 * Delivery dates represent a calendar day (not an instant), so everything is
 * computed in UTC and stored at UTC midnight. This keeps the chosen weekday
 * stable regardless of the server's or browser's timezone (no off-by-one).
 *
 * Used by both the client checkout UI and the server-side validation so the
 * rules can never drift apart.
 */

export const MAX_ORDER_NOTES_LENGTH = 280;

const DATE_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for Saturday/Sunday (UTC). */
export function isWeekendUTC(date: Date): boolean {
	const day = date.getUTCDay();
	return day === 0 || day === 6;
}

/** Parse a `YYYY-MM-DD` value into a UTC-midnight Date, or null if invalid. */
export function parseDeliveryDate(value: string): Date | null {
	const match = DATE_INPUT_RE.exec(value.trim());
	if (!match) return null;
	const [, year, month, day] = match;
	const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
	if (Number.isNaN(date.getTime())) return null;
	// Guard against rollover (e.g. 2026-02-31 → March).
	if (date.getUTCMonth() !== Number(month) - 1) return null;
	return date;
}

/** Serialise a Date to the `YYYY-MM-DD` value an `<input type="date">` expects. */
export function toDateInputValue(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/**
 * Earliest selectable delivery day: the next business day after `from`.
 * Weekends are skipped.
 */
export function getEarliestDeliveryDate(from: Date = new Date()): Date {
	const date = new Date(
		Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
	);
	do {
		date.setUTCDate(date.getUTCDate() + 1);
	} while (isWeekendUTC(date));
	return date;
}

/**
 * Validates a `YYYY-MM-DD` delivery date: must be a real weekday on or after
 * the earliest allowed delivery day.
 */
export function isAllowedDeliveryDate(value: string): boolean {
	const date = parseDeliveryDate(value);
	if (!date) return false;
	if (isWeekendUTC(date)) return false;
	return date.getTime() >= getEarliestDeliveryDate().getTime();
}

/** Human-friendly delivery date for display (e.g. "Wed, 24 Jun 2026"). */
export function formatDeliveryDate(
	value: string | Date | null | undefined,
): string {
	if (!value) return "—";
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("en-AU", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});
}
