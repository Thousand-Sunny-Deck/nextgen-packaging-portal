import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { redirect } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";
import { OrdersTable } from "./orders-table";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";

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

function OrdersFilter() {
	return <div></div>;
}

export interface ProductRow {
	sku: string;
	description: string;
	price1: string;
	price2: string;
	quantity1: string;
	price3: string;
	quantity2: string;
}

const OrdersPage = async ({ params }: OrdersPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	const slug = await params;

	const { error: orgIdError, orgId } = verifyOrgId(session, slug);
	if (orgIdError) {
		// this means that we have a session because we are logged in to some user Id
		// but that doesn't mean we can just access any users dashboard
		return <div>Unauthorized</div>;
	}
	// Read and parse CSV file
	const csvPath = join(
		process.cwd(),
		"src/app/dashboard/[uuid]/orders/NextGenSupplies.csv",
	);
	const csvContent = await readFile(csvPath, "utf-8");
	const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

	const products: ProductRow[] = lines
		.map((line) => {
			// Remove trailing comma if present
			const cleanLine = line.replace(/,\s*$/, "");
			const columns = cleanLine.split(",").map((col) => col.trim());

			// Skip empty rows (all columns are empty)
			if (columns.every((col) => !col)) {
				return null;
			}

			// Skip rows that don't have at least SKU and description
			if (!columns[0] || !columns[1]) {
				return null;
			}

			return {
				sku: columns[0] || "",
				description: columns[1] || "",
				price1: columns[2] || "",
				price2: columns[3] || "",
				quantity1: columns[4] || "",
				price3: columns[6] || "",
				quantity2: columns[7] || "",
			};
		})
		.filter((product): product is ProductRow => product !== null);

	return (
		<>
			<div className="ml-80 mt-15 w-7/12 h-full">
				<OrdersBreadcrumb uuid={orgId} />
				<h1 className="mt-5 text-3xl">Orders</h1>
				<h1 className="mt-1 text-xs text-gray-400">
					Select products and proceed
				</h1>
				<OrdersFilter />
				<OrdersTable products={products} />
			</div>
		</>
	);
};

export default OrdersPage;
