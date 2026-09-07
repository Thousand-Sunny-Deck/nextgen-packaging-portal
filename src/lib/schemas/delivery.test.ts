/**
 * Run: npx tsx src/lib/schemas/delivery.test.ts
 *
 * Covers the order cutoff, the only branching rule here. Times are given as
 * UTC instants and asserted against Adelaide business hours.
 */
import assert from "node:assert/strict";
import {
	getEarliestDeliveryDate,
	isAllowedDeliveryDate,
	toDateInputValue,
} from "./delivery";

const earliest = (utc: string) =>
	toDateInputValue(getEarliestDeliveryDate(new Date(utc)));

// Adelaide is UTC+9:30 in winter. Mon 2026-09-07 04:00Z = 13:30 Adelaide.
assert.equal(
	earliest("2026-09-07T04:00:00Z"),
	"2026-09-08",
	"Mon before cutoff → Tue",
);

// 06:29Z = 15:59 Adelaide, one minute before the cutoff.
assert.equal(
	earliest("2026-09-07T06:29:00Z"),
	"2026-09-08",
	"just before cutoff → next day",
);

// 06:30Z = 16:00 Adelaide, exactly the cutoff.
assert.equal(
	earliest("2026-09-07T06:30:00Z"),
	"2026-09-09",
	"at cutoff → day after next",
);

// 09:00Z = 18:30 Adelaide.
assert.equal(
	earliest("2026-09-07T09:00:00Z"),
	"2026-09-09",
	"after cutoff → day after next",
);

// Never same-day, at any hour.
assert.notEqual(earliest("2026-09-07T00:00:00Z"), "2026-09-07", "no same-day");

// Weekends are skipped. 2026-09-10 is a Thursday, 2026-09-11 a Friday.
assert.equal(
	earliest("2026-09-10T09:00:00Z"),
	"2026-09-14",
	"Thu after cutoff → Mon",
);
assert.equal(
	earliest("2026-09-11T04:00:00Z"),
	"2026-09-14",
	"Fri before cutoff → Mon",
);
assert.equal(
	earliest("2026-09-11T09:00:00Z"),
	"2026-09-15",
	"Fri after cutoff → Tue",
);

// 2026-09-12 is a Saturday.
assert.equal(
	earliest("2026-09-12T02:00:00Z"),
	"2026-09-14",
	"Sat before cutoff → Mon",
);

// Adelaide is UTC+10:30 under daylight saving. 2026-12-07 is a Monday.
assert.equal(
	earliest("2026-12-07T05:29:00Z"),
	"2026-12-08",
	"DST: before cutoff → next day",
);
assert.equal(
	earliest("2026-12-07T05:30:00Z"),
	"2026-12-09",
	"DST: at cutoff → day after next",
);

// Late UTC evening is already the next day in Adelaide.
// Mon 2026-09-07 23:00Z = Tue 08:30 Adelaide, before cutoff → Wednesday.
assert.equal(
	earliest("2026-09-07T23:00:00Z"),
	"2026-09-09",
	"UTC evening = next Adelaide day",
);

// Validation agrees with the earliest date, and still rejects weekends/past.
// isAllowedDeliveryDate reads the real clock, so compare against it too.
assert.equal(
	isAllowedDeliveryDate(toDateInputValue(getEarliestDeliveryDate())),
	true,
);
assert.equal(isAllowedDeliveryDate("2026-09-12"), false, "Saturday rejected");
assert.equal(isAllowedDeliveryDate("2020-01-01"), false, "past rejected");
assert.equal(isAllowedDeliveryDate("not-a-date"), false, "garbage rejected");

console.log("delivery: all assertions passed");
