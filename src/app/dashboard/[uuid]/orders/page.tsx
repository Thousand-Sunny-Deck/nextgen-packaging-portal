import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { notFound, redirect } from "next/navigation";
import { OrdersTable } from "./orders-table";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import { fetchProducts } from "@/lib/products/products";

interface OrdersPageProps {
	params: Promise<{ uuid: string }>;
}

function OrdersBreadcrumb({ uuid }: { uuid: string }) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={`/dashboard/${uuid}/home`}>Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Orders</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

const OrdersPage = async ({ params }: OrdersPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const slug = await params;
	const { error: orgIdError, orgId } = verifyOrgId(session, slug);

	if (orgIdError) {
		// User is authenticated but trying to access another user's dashboard
		// Redirect to their own dashboard or show 404
		notFound();
	}

	const products = await fetchProducts();

	return (
		<>
			<div className="ml-80 mt-15 w-7/12 h-full pb-20">
				<OrdersBreadcrumb uuid={orgId} />
				<h1 className="mt-5 text-3xl">Orders</h1>
				<h1 className="mt-1 text-xs text-gray-400">
					Select products and proceed.
				</h1>
				<OrdersTable products={products} />
			</div>
		</>
	);
};

export default OrdersPage;
