/**
 *
 * This is sole purpose is to redirect to /auth/login and then /dashboard (if logged in)
 */

import { redirect } from "next/navigation";

const HomePage = () => {
	redirect("/entry");
};

export default HomePage;
