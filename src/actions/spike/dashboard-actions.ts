"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

export type AdminDashboardMetrics = {
	totalUsers: number;
	totalProducts: number;
	totalOrders: number;
	totalOrdersThisMonth: number;
};

const MELBOURNE_TIMEZONE = "Australia/Melbourne";

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	});

	const parts = formatter.formatToParts(date);
	const value = (type: string): number => {
		const part = parts.find((p) => p.type === type);
		return Number(part?.value ?? "0");
	};

	const asUtc = Date.UTC(
		value("year"),
		value("month") - 1,
		value("day"),
		value("hour"),
		value("minute"),
		value("second"),
	);

	return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	second: number,
	millisecond: number,
	timeZone: string,
): Date {
	let utcGuess = Date.UTC(
		year,
		month - 1,
		day,
		hour,
		minute,
		second,
		millisecond,
	);

	// Run twice to settle around offset boundaries (DST).
	for (let i = 0; i < 2; i++) {
		const offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
		utcGuess -= offset;
	}

	return new Date(utcGuess);
}

function getCurrentMonthWindowInUtc(timeZone: string): {
	startUtc: Date;
	endUtc: Date;
} {
	const now = new Date();
	const monthFormatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
	});
	const parts = monthFormatter.formatToParts(now);
	const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
	const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");

	const nextMonth = month === 12 ? 1 : month + 1;
	const nextMonthYear = month === 12 ? year + 1 : year;

	const startUtc = zonedDateTimeToUtc(year, month, 1, 0, 0, 0, 0, timeZone);
	const endUtc = zonedDateTimeToUtc(
		nextMonthYear,
		nextMonth,
		1,
		0,
		0,
		0,
		0,
		timeZone,
	);

	return { startUtc, endUtc };
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
	await requireAdmin();

	const { startUtc, endUtc } = getCurrentMonthWindowInUtc(MELBOURNE_TIMEZONE);

	const [totalUsers, totalProducts, totalOrders, totalOrdersThisMonth] =
		await prisma.$transaction([
			prisma.user.count(),
			prisma.product.count(),
			prisma.order.count(),
			prisma.order.count({
				where: {
					createdAt: {
						gte: startUtc,
						lt: endUtc,
					},
				},
			}),
		]);

	return {
		totalUsers,
		totalProducts,
		totalOrders,
		totalOrdersThisMonth,
	};
}
