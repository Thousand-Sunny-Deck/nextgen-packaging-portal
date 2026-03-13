import { OrderActivityRow } from "@/actions/spike/orders-actions";
import { LozengeProps } from "@/components/Lozenge";

export function getStatusLozenge(status: OrderActivityRow["status"]): {
	appearence: LozengeProps["appearance"];
	label: string;
} {
	switch (status) {
		case "AWAITING_APPROVAL":
			return { appearence: "inprogress" as const, label: "Awaiting Approval" };
		case "EMAIL_SENT":
			return { appearence: "success" as const, label: "Completed" };
		case "FAILED":
			return { appearence: "removed" as const, label: "Failed" };
		default:
			return { appearence: "inprogress" as const, label: "In Progress" };
	}
}

export function formatDate(isoString: string) {
	return new Date(isoString).toLocaleString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}
