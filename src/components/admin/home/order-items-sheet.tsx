"use client";
import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Lozenge } from "@/components/Lozenge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";
import { updateOrderDeliveryDate } from "@/actions/spike/orders-actions";
import {
	formatDeliveryDate,
	getEarliestDeliveryDate,
	toDateInputValue,
} from "@/lib/schemas/delivery";
import { formatDate, getStatusLozenge } from "./common";

interface OrderItemsSheetProps {
	order: OrderActivityRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onOrderUpdated?: () => void;
}

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

export function OrderItemsSheet({
	order,
	open,
	onOpenChange,
	onOrderUpdated,
}: OrderItemsSheetProps) {
	const { label, appearence } = getStatusLozenge(order?.status || "PROCESSING");

	const [editingDate, setEditingDate] = useState(false);
	const [dateDraft, setDateDraft] = useState("");
	const [savingDate, setSavingDate] = useState(false);

	// Reset the edit state whenever a different order is shown.
	useEffect(() => {
		setEditingDate(false);
		setSavingDate(false);
		setDateDraft(order?.deliveryDate ? order.deliveryDate.slice(0, 10) : "");
	}, [order?.orderId, order?.deliveryDate]);

	const minDeliveryDate = toDateInputValue(getEarliestDeliveryDate());

	const handleSaveDate = async () => {
		if (!order) return;
		setSavingDate(true);
		const result = await updateOrderDeliveryDate({
			orderId: order.orderId,
			deliveryDate: dateDraft,
		});
		setSavingDate(false);
		if (!result.success) {
			toast.error(result.error || "Failed to update delivery date.");
			return;
		}
		toast.success("Delivery date updated.");
		setEditingDate(false);
		onOrderUpdated?.();
	};
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
									<Lozenge appearance={appearence}>{label}</Lozenge>
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

							{/* Requested delivery (editable) + customer note */}
							<div className="rounded-md border border-slate-200 bg-white p-3">
								<div className="flex items-center justify-between gap-2">
									<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
										Requested delivery
									</p>
									{!editingDate && (
										<Button
											variant="ghost"
											size="sm"
											className="h-7 px-2 text-xs"
											onClick={() => setEditingDate(true)}
										>
											<Pencil className="mr-1 h-3.5 w-3.5" />
											Edit
										</Button>
									)}
								</div>

								{editingDate ? (
									<div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
										<Input
											type="date"
											min={minDeliveryDate}
											value={dateDraft}
											onChange={(event) => setDateDraft(event.target.value)}
											className="h-8 w-full sm:w-48"
										/>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												className="h-8"
												onClick={handleSaveDate}
												disabled={savingDate || !dateDraft}
											>
												{savingDate ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													"Save"
												)}
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="h-8"
												onClick={() => {
													setEditingDate(false);
													setDateDraft(
														order.deliveryDate
															? order.deliveryDate.slice(0, 10)
															: "",
													);
												}}
												disabled={savingDate}
											>
												Cancel
											</Button>
										</div>
									</div>
								) : (
									<p className="mt-1 text-sm font-semibold text-slate-900">
										{formatDeliveryDate(order.deliveryDate)}
									</p>
								)}

								{order.notes && (
									<div className="mt-3 border-t border-slate-200 pt-3">
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
											Customer note
										</p>
										<p className="mt-1 text-sm italic text-slate-700">
											“{order.notes}”
										</p>
									</div>
								)}
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
