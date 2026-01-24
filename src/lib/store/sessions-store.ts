import { prisma } from "../config/prisma";

export async function getUserIdBySessionId(id: string): Promise<string | null> {
	try {
		const session = await prisma.session.findUnique({
			where: {
				id: id,
			},
			select: {
				userId: true,
			},
		});

		return session?.userId ?? null;
	} catch (error) {
		console.error("Error fetching userId from session:", error);
		throw error;
	}
}
