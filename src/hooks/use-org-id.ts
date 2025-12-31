const ALLOWED_ORGS = ["7e14cd73-cff9-44ae-8463-ba7d6d4deb03"];

type VerifyOrgIdResponse = {
	orgId: string;
	error?: Error;
};

export const verifyOrgId = (
	session: any,
	slug: {
		uuid: string;
	},
): VerifyOrgIdResponse => {
	const id = session.user.id;
	if (!id) {
		throw Error("this should not happen");
	}

	// need to update this to call the DB. This is mocked right now
	const isKnownOrg = ALLOWED_ORGS.includes(slug.uuid);
	if (isKnownOrg && id === slug.uuid) {
		return { orgId: slug.uuid };
	}

	return {
		orgId: slug.uuid,
		error: new Error("Unauthorized"),
	};
};
