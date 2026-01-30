import { fetchRecentOrders } from "@/actions/order-delivery/fetch-orders-action";
import RecentOrdersSection from "../RecentOrdersSection";

const RecentOrdersServer = async () => {
	const recentOrders = await fetchRecentOrders();

	return <RecentOrdersSection recentOrders={recentOrders} />;
};

export default RecentOrdersServer;
