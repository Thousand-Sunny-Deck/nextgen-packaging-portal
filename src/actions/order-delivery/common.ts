"use server";

import { cookies } from "next/headers";

export const getCookieHeader = async (): Promise<string> => {
	const cookieStore = await cookies();

	// ✅ Convert cookies to Cookie header string
	const cookieHeader = cookieStore
		.getAll()
		.map((cookie) => `${cookie.name}=${cookie.value}`)
		.join("; ");

	return cookieHeader;
};
