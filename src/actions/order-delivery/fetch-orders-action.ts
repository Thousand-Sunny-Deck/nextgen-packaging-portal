import { env } from "@/lib/env-validation/env";
import { getCookieHeader } from "./common";

export const fetchOrdersForUser = async () => {
	const cookies = await getCookieHeader();
	const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/orders`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: cookies,
		},
	});

	if (!response.ok) {
		const errorData = await response.json();
		return {
			ok: false,
			error: errorData.message || errorData.errors || "Failed to fetch orders",
			status: response.status,
		};
	}

	const body = await response.json();

	return {
		ok: true,
		data: body.data,
	};
};
