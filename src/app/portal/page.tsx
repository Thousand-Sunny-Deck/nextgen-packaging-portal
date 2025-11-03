"use client";
import { env } from "@/lib/env-validation/env";
/**
 *
 * This is for route: {NGP_domain}/portal
 * I do think it needs to be {NGP_domain}/portal/{uuid} <- some unique identifier
 * but let work with this for now.
 */

// THIS WILL THROW AN ERROR as we are accessing a server "env" on a client component
console.log(env.BETTER_AUTH_SECRET);
const PortalPage = () => {
	return <div>This is portal page</div>;
};

export default PortalPage;
