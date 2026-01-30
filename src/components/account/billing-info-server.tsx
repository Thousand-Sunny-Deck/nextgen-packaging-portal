import { getUserSession } from "@/hooks/use-session";
import { fetchBillingAddressesForUser } from "@/lib/store/billing-addresses-store";
import { BillingInfo } from "./billing-info";

const BillingInfoServer = async () => {
	const { session } = await getUserSession();

	if (!session) {
		return null;
	}

	const billingAddresses = await fetchBillingAddressesForUser(session.user.id);
	const userEmail = session.user.email;

	return (
		<BillingInfo
			initialBillingAddresses={billingAddresses}
			userEmail={userEmail}
		/>
	);
};

export default BillingInfoServer;
