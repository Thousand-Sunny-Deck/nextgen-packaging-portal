import { prisma } from "@/lib/config/prisma";
import { SessionType } from "./use-session";

type VerifyOrgIdResponse = {
	orgId: string;
	error?: Error;
};

export const verifyOrgId = async (
	session: SessionType,
	slug: {
		uuid: string;
	},
): Promise<VerifyOrgIdResponse> => {
	const id = session.user.id;
	if (!id) {
		throw Error("this should not happen");
	}

	// Check if the session user ID matches the slug UUID
	if (id !== slug.uuid) {
		return {
			orgId: slug.uuid,
			error: new Error("Unauthorized"),
		};
	}

	// Verify user exists in the database
	const user = await prisma.user.findUnique({
		where: { id: slug.uuid },
	});

	if (!user) {
		return {
			orgId: slug.uuid,
			error: new Error("User not found"),
		};
	}

	return { orgId: slug.uuid };
};
