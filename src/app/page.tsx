/**
 *
 * This is sole purpose is to redirect to /auth/login and then /dashboard (if logged in)
 */

import { getUserSession } from "@/hooks/use-session";
import { getUserIdBySessionId } from "@/lib/store/sessions-store";
import { notFound, redirect } from "next/navigation";

const HomePage = async () => {
	// An anonymous visitor surfaces as an error carrying the login URL, which is
	// the whole point of landing here — 404ing on it made the site root a dead
	// end for anyone not already signed in.
	const { error, session } = await getUserSession();
	if (error) {
		redirect(error.getRedirectUrl());
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
