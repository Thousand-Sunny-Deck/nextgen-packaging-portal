"use server";

import { headers } from "next/headers";

export const getCookieHeader = async (): Promise<string> => {
	const headersList = await headers();
	return headersList.get("cookie") || "";
};
