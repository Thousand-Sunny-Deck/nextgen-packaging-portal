/**
 *
 * This is sole purpose is to redirect to /auth/login and then /dashboard (if logged in)
 */

import { getUserSession } from "@/hooks/use-session";
import { getUserIdBySessionId } from "@/lib/store/sessions-store";
import { notFound, redirect } from "next/navigation";

const HomePage = async () => {
	const { error, session } = await getUserSession();
	if (error) {
		notFound();
	}

	if (!session) {
		redirect("/auth/login");
	}

	const sessionId = session.session.id;
	const orgId = await getUserIdBySessionId(sessionId);

	if (!orgId) {
		notFound();
	}

	redirect(`/dashboard/${orgId}/home`);
};

export default HomePage;
