"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCheckoutExtrasStore } from "@/lib/store/checkout-extras-store";
import {
	MAX_ORDER_NOTES_LENGTH,
	getEarliestDeliveryDate,
	isWeekendUTC,
	parseDeliveryDate,
	toDateInputValue,
} from "@/lib/schemas/delivery";

const DeliveryAndNotes = () => {
	const { deliveryDate, notes, setDeliveryDate, setNotes } =
		useCheckoutExtrasStore();

	const minDate = useMemo(
		() => toDateInputValue(getEarliestDeliveryDate()),
		[],
	);

	const parsed = deliveryDate ? parseDeliveryDate(deliveryDate) : null;
	const isWeekendSelected = parsed ? isWeekendUTC(parsed) : false;
	const dateError = isWeekendSelected
		? "Deliveries are on weekdays only. Please pick Mon–Fri."
		: null;

	return (
		<div className="mt-4 px-4 py-2 flex flex-col w-full gap-4">
			<div className="flex items-center gap-2">
				<CalendarDays className="h-4 w-4 text-muted-foreground" />
				<p className="font-bold text-lg">Delivery & notes</p>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="delivery-date" className="text-sm font-medium">
					Requested delivery day
				</label>
				<Input
					id="delivery-date"
					type="date"
					min={minDate}
					value={deliveryDate}
					aria-invalid={dateError ? true : undefined}
					onChange={(event) => setDeliveryDate(event.target.value)}
					className="w-full sm:w-60"
				/>
				{dateError ? (
					<p className="text-xs text-destructive">{dateError}</p>
				) : (
					<p className="text-xs text-muted-foreground">
						Weekdays only. Earliest available day is preselected as the minimum.
					</p>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="order-notes" className="text-sm font-medium">
					Order notes <span className="text-muted-foreground">(optional)</span>
				</label>
				<textarea
					id="order-notes"
					value={notes}
					maxLength={MAX_ORDER_NOTES_LENGTH}
					onChange={(event) => setNotes(event.target.value)}
					placeholder="Anything we should know about this order?"
					rows={3}
					className={cn(
						"placeholder:text-muted-foreground border-input dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
						"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
						"resize-none",
					)}
				/>
				<p className="text-xs text-muted-foreground self-end">
					{notes.length}/{MAX_ORDER_NOTES_LENGTH}
				</p>
			</div>
		</div>
	);
};

export default DeliveryAndNotes;
