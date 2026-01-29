import { RecentOrder } from "@/components/dashboard/RecentOrdersSection";
import { Invoice } from "@/components/dynamic-table/invoices/columns";

export const PAST_INVOICES: Invoice[] = [
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Pending",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Success",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Processing",
		amount: 45.29,
	},
	{
		invoiceId: "3421-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Failed",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Pending",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Success",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: "12/12/2025",
		status: "Processing",
		amount: 45.29,
	},
	{
		invoiceId: "3421-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Failed",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Pending",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Success",
		amount: 45.29,
	},
	{
		invoiceId: "1234-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Processing",
		amount: 45.29,
	},
	{
		invoiceId: "3421-asdasd",
		date: new Date().toLocaleDateString(),
		status: "Failed",
		amount: 45.29,
	},
];

export const ACTIVE_ORDERS = [
	{
		id: 1,
		orderNumber: "123",
		price: "AU$0.01",
		status: "Order Placed",
	},
	{
		id: 2,
		orderNumber: "123",
		price: "AU$0.01",
		status: "Processing",
	},
];

export const RECENT_ORDERS: RecentOrder[] = [
	{
		id: 1,
		orderNumber: "123",
		timeAgo: "2d",
		items: [
			{ name: "Clear PLA Unbranded Cups", quantity: 2 },
			{ name: "Clear PLA Unbranded Cups", quantity: 3 },
		],
		price: "AU$0.01",
	},
	{
		id: 2,
		orderNumber: "241",
		timeAgo: "2d",
		items: [
			{ name: "Clear PLA Unbranded Cups", quantity: 2 },
			{ name: "Clear PLA Unbranded Cups", quantity: 3 },
		],
		price: "AU$0.01",
	},
	{
		id: 3,
		orderNumber: "823",
		timeAgo: "2d",
		items: [
			{ name: "Clear PLA Unbranded Cups", quantity: 2 },
			{ name: "Clear PLA Unbranded Cups", quantity: 3 },
		],
		price: "AU$0.01",
	},
];
