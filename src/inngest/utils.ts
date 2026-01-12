interface EventData {
	orderId?: unknown;
	userId?: unknown;
	email?: unknown;
}

export const validateEventData = (data: unknown): boolean => {
	if (!data || typeof data !== "object") {
		return false;
	}

	const eventData = data as EventData;

	if (!eventData.orderId || typeof eventData.orderId !== "string") {
		return false;
	}

	if (!eventData.userId || typeof eventData.userId !== "string") {
		return false;
	}

	if (!eventData.email || typeof eventData.email !== "string") {
		return false;
	}

	return true;
};
