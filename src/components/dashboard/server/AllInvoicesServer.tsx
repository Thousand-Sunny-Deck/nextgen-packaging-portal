import { fetchOrdersForUser } from "@/actions/order-delivery/fetch-orders-action";
import { Invoice } from "@/components/dynamic-table/invoices/columns";
import AllInvoices from "../AllInvoices";

const AllInvoicesServer = async () => {
	const ordersResponse = await fetchOrdersForUser();
	const invoices: Invoice[] = ordersResponse.ok ? ordersResponse.data : [];

	return <AllInvoices invoices={invoices} />;
};

export default AllInvoicesServer;
