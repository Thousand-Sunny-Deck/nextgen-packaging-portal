"use client";
import { Lozenge } from "@/components/Lozenge";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";

interface OrderItemsSheetProps {
	order: OrderActivityRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getStatusLozengeAppearance(status: OrderActivityRow["status"]) {
	switch (status) {
		case "EMAIL_SENT":
			return "success" as const;
		case "FAILED":
			return "removed" as const;
		default:
			return "inprogress" as const;
	}
}

function getStatusLabel(status: OrderActivityRow["status"]) {
	switch (status) {
		case "EMAIL_SENT":
			return "Completed";
		case "FAILED":
			return "Failed";
		default:
			return "In Progress";
	}
}

export function OrderItemsSheet({
	order,
	open,
	onOpenChange,
}: OrderItemsSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full sm:max-w-xl overflow-y-auto bg-white p-0"
			>
				{order && (
					<>
						<SheetHeader className="border-b border-slate-200">
							<SheetTitle>Order #{order.orderId}</SheetTitle>
							<SheetDescription>
								{order.user?.name || "Unknown user"} •{" "}
								{formatDate(order.createdAt)}
							</SheetDescription>
						</SheetHeader>

						<div className="space-y-5 p-4">
							<div className="rounded-md border border-slate-200 bg-slate-50 p-3">
								<div className="flex items-start justify-between gap-2">
									<div className="space-y-1">
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
											Organization
										</p>
										<p className="text-sm font-semibold text-slate-900">
											{order.customerOrganization}
										</p>
									</div>
									<Lozenge
										appearance={getStatusLozengeAppearance(order.status)}
									>
										{getStatusLabel(order.status)}
									</Lozenge>
								</div>
								<div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
									<span className="text-sm text-slate-600">
										Total order cost
									</span>
									<span className="text-sm font-semibold text-slate-900">
										{formatCurrency(order.totalOrderCost)}
									</span>
								</div>
							</div>

							<div>
								<h3 className="text-sm font-semibold text-slate-900">
									Items ({order.items.length})
								</h3>
								{order.items.length === 0 ? (
									<div className="mt-2 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
										No items found for this order.
									</div>
								) : (
									<div className="mt-2 space-y-3">
										{order.items.map((item) => (
											<article
												key={item.id}
												className="rounded-lg border border-slate-200 bg-white p-3"
											>
												<div className="flex items-start gap-3">
													<div className="min-w-0 flex-1">
														<p className="line-clamp-2 text-sm font-medium text-slate-900">
															{item.description}
														</p>
														<p className="mt-1 font-mono text-xs text-slate-500">
															{item.sku}
														</p>
													</div>
												</div>

												<div className="mt-3 grid grid-cols-3 gap-2">
													<div className="rounded-md bg-slate-50 px-2 py-1.5">
														<p className="text-[11px] uppercase tracking-wide text-slate-500">
															Qty
														</p>
														<p className="text-sm font-medium text-slate-900">
															{item.quantity}
														</p>
													</div>
													<div className="rounded-md bg-slate-50 px-2 py-1.5">
														<p className="text-[11px] uppercase tracking-wide text-slate-500">
															Unit
														</p>
														<p className="text-sm font-medium text-slate-900">
															{formatCurrency(item.unitCost)}
														</p>
													</div>
													<div className="rounded-md bg-slate-50 px-2 py-1.5">
														<p className="text-[11px] uppercase tracking-wide text-slate-500">
															Total
														</p>
														<p className="text-sm font-medium text-slate-900">
															{formatCurrency(item.total)}
														</p>
													</div>
												</div>
											</article>
										))}
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
