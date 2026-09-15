import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Prefixes, matched against the pathname. These were previously written as
// "/dashboard/**/**", which is not a glob Next.js expands — it was compared
// literally, so no real path ever matched and the check never ran.
const protectedRoutes = ["/dashboard", "/admin"];

function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

/**
 * A cheap first pass only. The cookie is not validated here — it can't be,
 * without a database round trip on every request — so this can send someone to
 * the login page but never let them in. Every protected page and action
 * re-checks the session server-side.
 */
export async function middleware(req: NextRequest) {
	const { nextUrl } = req;

	const sessionCookie = getSessionCookie(req);

	if (isProtectedRoute(nextUrl.pathname) && !sessionCookie) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
