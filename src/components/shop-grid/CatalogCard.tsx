"use client";

import { CatalogCardViewModel, CatalogUnit, CatalogUnitState } from "./types";
import { CatalogQuantityControl } from "./CatalogQuantityControl";
import { CatalogSelectButton } from "./CatalogSelectButton";

interface CatalogCardProps {
	item: CatalogCardViewModel;
	onQuantityChange: (next: number, unit?: CatalogUnit) => void;
	onToggleSelect: (unit?: CatalogUnit) => void;
}

const MAX_QUANTITY = 999;
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const CatalogCard = ({
	item,
	onQuantityChange,
	onToggleSelect,
}: CatalogCardProps) => {
	const units = item.unitOptions;

	const renderQuantityControl = (
		state: { quantity: number },
		unit?: CatalogUnit,
	) => (
		<CatalogQuantityControl
			quantity={state.quantity}
			max={MAX_QUANTITY}
			onDecrement={() =>
				onQuantityChange(Math.max(0, state.quantity - 1), unit)
			}
			onIncrement={() =>
				onQuantityChange(Math.min(MAX_QUANTITY, state.quantity + 1), unit)
			}
			onChange={(next) => onQuantityChange(next, unit)}
		/>
	);

	let body: React.ReactNode;

	if (units) {
		const rows: { unit: CatalogUnit; state: CatalogUnitState }[] = [
			{ unit: "Sleeve", state: units.sleeve },
			{ unit: "Box", state: units.box },
		];
		const anyQty = units.sleeve.quantity > 0 || units.box.quantity > 0;
		const isAdded =
			anyQty &&
			(units.sleeve.quantity === 0 || units.sleeve.isSelected) &&
			(units.box.quantity === 0 || units.box.isSelected);

		const handleAdd = () => {
			if (units.sleeve.quantity > 0) onToggleSelect("Sleeve");
			if (units.box.quantity > 0) onToggleSelect("Box");
		};

		body = (
			<>
				<div className="mb-2.5 space-y-2 md:mb-3">
					{rows.map(({ unit, state }) => (
						<div key={unit}>
							<div className="mb-1 flex items-center justify-between text-xs">
								<span className="font-medium text-gray-900">{unit}</span>
								<span className="font-semibold text-gray-700">
									{formatCurrency(state.price)}
								</span>
							</div>
							{renderQuantityControl(state, unit)}
						</div>
					))}
				</div>
				<CatalogSelectButton
					isSelected={isAdded}
					onToggle={handleAdd}
					disabled={!anyQty}
				/>
			</>
		);
	} else {
		body = (
			<>
				<p className="mb-2 text-xs font-semibold text-gray-700 sm:text-sm">
					Unit: {formatCurrency(item.unitCost)}
				</p>
				<div className="mb-2.5 md:mb-3">
					{renderQuantityControl({ quantity: item.quantity })}
				</div>
				<CatalogSelectButton
					isSelected={item.isSelected}
					onToggle={() => onToggleSelect()}
				/>
			</>
		);
	}

	return (
		<article className="min-w-0 rounded-lg border border-border bg-white p-2.5 shadow-xs transition-colors md:p-3">
			<div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-md border bg-muted sm:mb-3 sm:aspect-square">
				{item.imageUrl ? (
					<img
						src={item.imageUrl}
						alt={item.name}
						className="h-full w-full object-cover"
						loading="lazy"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
						No image
					</div>
				)}
			</div>

			<h3 className="mb-1 line-clamp-2 min-h-9 text-xs font-medium sm:text-sm md:min-h-10">
				{item.name}
			</h3>

			{body}
		</article>
	);
};
