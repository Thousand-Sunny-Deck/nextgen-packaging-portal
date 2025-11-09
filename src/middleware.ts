import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = ["/portal"];
const authRoutes = ["/auth/login", "/auth/register"];

function isProtectedRoute(pathname: string): boolean {
	return protectedRoutes.some(
		(route) => pathname === route || pathname.startsWith(`${route}/`),
	);
}

export async function middleware(req: NextRequest) {
	const { nextUrl } = req;
	const sessionCookie = getSessionCookie(req);

	const isLoggedIn = !!sessionCookie;
	const isProtected = isProtectedRoute(nextUrl.pathname);
	const isOnAuthRoute =
		authRoutes.includes(nextUrl.pathname) ||
		nextUrl.pathname.startsWith("/auth");

	if (isProtected && !isLoggedIn) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}

	if (isOnAuthRoute && isLoggedIn) {
		return NextResponse.redirect(new URL("/portal", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
