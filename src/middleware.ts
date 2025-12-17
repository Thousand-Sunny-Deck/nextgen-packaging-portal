import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

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

export async function middleware(req: NextRequest) {
	const { nextUrl } = req;
	const sessionCookie = getSessionCookie(req);

	const isLoggedIn = !!sessionCookie;
	const isProtected = isProtectedRoute(nextUrl.pathname);
	const isLoginRoute = isAuthLoginRoute(nextUrl.pathname);

	if (isProtected && !isLoggedIn) {
		return NextResponse.redirect(new URL("/auth/login", req.url));
	}

	if (isLoggedIn && isLoginRoute) {
		return NextResponse.redirect(new URL("/entry", req.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
