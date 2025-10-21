/**
 *
 * This is sole purpose is to redirect to /entry and then /portal (if logged in)
 */

import { redirect } from "next/navigation";

const HomePage = () => {
	redirect("/entry");
};

export default HomePage;
