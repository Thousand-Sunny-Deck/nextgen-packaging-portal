/**
 *
 * This page is for when anyone tries to reach {NGP_DOMAIN}/
 * it will be redirected to here {NGP_DOMAIN}/entry
 *  IF they are not logged in (session check). Checking the auth hook for this.
 */

import LoginPage from "./login";

const EntryPage = () => {
	return <LoginPage />;
};

export default EntryPage;
