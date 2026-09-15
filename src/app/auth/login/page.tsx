import { redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { getUserIdBySessionId } from "@/lib/store/sessions-store";
import { LoginForm } from "./login-form";

/**
 * Deciding "already signed in" here rather than in middleware: middleware only
 * sees whether a session cookie exists, so it would bounce someone holding a
 * dead cookie away from the one page that could fix it. This checks the session
 * for real, and falls through to the form when it doesn't hold up.
 */
const LoginPage = async () => {
	const { session } = await getUserSession();

	if (session) {
		const orgId = await getUserIdBySessionId(session.session.id);
		if (orgId) {
			redirect(`/dashboard/${orgId}/home`);
		}
	}

	return <LoginForm />;
};

export default LoginPage;
