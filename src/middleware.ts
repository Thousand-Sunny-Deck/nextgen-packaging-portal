import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { getFeatureFlags } from "@/lib/feature-flags";

const protectedRoutes = ["/dashboard/**/**"];
const authLoginRoute = "/auth/login";

function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

function isAuthLoginRoute(pathname: string): boolean {
	return pathname === authLoginRoute;
}

function getShopRouteUuid(pathname: string): string | null {
	const match = pathname.match(/^\/dashboard\/([^/]+)\/shop(\/.*)?$/);
	return match ? match[1] : null;
}

export async function middleware(req: NextRequest) {
	const { nextUrl } = req;

	const isProduction = process.env.NODE_ENV === "production";
	const isApiRoute = nextUrl.pathname.startsWith("/api");
	const isDowntimeRoute = nextUrl.pathname === "/downtime";
	const isPublicFileRequest = /\.[^/]+$/.test(nextUrl.pathname);

	if (isProduction && !isDowntimeRoute && !isPublicFileRequest) {
		if (isApiRoute) {
			return NextResponse.json(
				{ message: "Service temporarily unavailable due to maintenance." },
				{ status: 503 },
			);
		}

		return NextResponse.redirect(new URL("/downtime", req.url));
	}

	const sessionCookie = getSessionCookie(req);

	const isLoggedIn = !!sessionCookie;
	const isProtected = isProtectedRoute(nextUrl.pathname);
	const isLoginRoute = isAuthLoginRoute(nextUrl.pathname);

	if (isProtected && !isLoggedIn) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}

	if (isLoggedIn && isLoginRoute) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	const shopUuid = getShopRouteUuid(nextUrl.pathname);
	if (shopUuid && !getFeatureFlags(shopUuid).catalogV2) {
		return NextResponse.redirect(
			new URL(`/dashboard/${shopUuid}/home`, req.url),
		);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
