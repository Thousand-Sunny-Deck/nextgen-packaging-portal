import type { SpikeAvailableProduct } from "@/actions/spike/entitlements-actions";

const MAX_CSV_ROWS = 50;

/**
 * A matched product plus the customer's optional price overrides. Empty string
 * means "use the product's default price" — the same convention the draft
 * store uses.
 */
export type EntitlementCsvMatch = {
	product: SpikeAvailableProduct;
	customUnitCost: string;
	customSleevePrice: string;
	customBoxPrice: string;
};

type ParseResult =
	| { ok: true; matches: EntitlementCsvMatch[] }
	| { ok: false; errors: string[] };

const isBlankOrNa = (value: string) =>
	value === "" || value.toUpperCase() === "NA";

const looksNumeric = (value: string) => value !== "" && !isNaN(Number(value));

type RowColumns = {
	sku: string;
	description: string;
	priceRaw: string;
	sleeveRaw: string;
};

/**
 * Splits a row into its parts, treating the description as optional.
 *
 * The first column is always the SKU, and the slot straight after it holds the
 * description. That slot may be skipped: a number or "NA" there means the row
 * went directly to the price columns. So the original
 * `sku,description[,price,sleeve-price]` shape keeps working alongside `sku`,
 * `sku,price` and `sku,price,sleeve-price`.
 *
 * Three trailing columns can only be description, price and sleeve price, so
 * the first is always taken as the description in that case.
 *
 * The one input this can't split apart is a description that is nothing but
 * digits; those rows still need the price columns spelled out.
 */
const splitRow = (cols: string[]): RowColumns => {
	const rest = cols.slice(1);

	const hasDescriptionColumn =
		rest.length === 3 ||
		(rest.length > 0 &&
			!looksNumeric(rest[0]) &&
			rest[0].toUpperCase() !== "NA");

	const description = hasDescriptionColumn ? rest[0] : "";
	const prices = hasDescriptionColumn ? rest.slice(1) : rest;

	return {
		sku: cols[0],
		description: isBlankOrNa(description) ? "" : description,
		priceRaw: prices[0] ?? "",
		sleeveRaw: prices[1] ?? "",
	};
};

export function parseEntitlementCsv(
	text: string,
	availableProducts: SpikeAvailableProduct[],
	existingDraftProductIds: Set<string>,
): ParseResult {
	const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
	const errors: string[] = [];

	if (lines.length === 0) {
		return { ok: false, errors: ["The file is empty."] };
	}

	if (lines.length > MAX_CSV_ROWS) {
		return {
			ok: false,
			errors: [`CSV has ${lines.length} rows — max is ${MAX_CSV_ROWS}.`],
		};
	}

	const matches: EntitlementCsvMatch[] = [];
	const seenProductIds = new Set<string>();

	for (let i = 0; i < lines.length; i++) {
		const rowNum = i + 1;
		const cols = lines[i].split(",").map((c) => c.trim());

		// At most: sku, description, price, sleeve-price. Everything after the
		// SKU is optional.
		if (cols.length > 4) {
			errors.push(
				`Row ${rowNum}: expected at most 4 columns, got ${cols.length}.`,
			);
			continue;
		}

		const { sku, description, priceRaw, sleeveRaw } = splitRow(cols);
		let rowValid = true;

		if (!sku) {
			errors.push(`Row ${rowNum}: SKU is required.`);
			rowValid = false;
		} else if (/"/.test(sku)) {
			errors.push(`Row ${rowNum}: SKU must not contain commas or quotes.`);
			rowValid = false;
		}

		if (/"/.test(description)) {
			errors.push(
				`Row ${rowNum}: description must not contain commas or quotes.`,
			);
			rowValid = false;
		}

		if (!rowValid) continue;

		// The description is only used to narrow the match when it's supplied.
		const label = description ? `"${sku}" / "${description}"` : `"${sku}"`;
		const found = availableProducts.filter(
			(p) =>
				p.sku.toLowerCase() === sku.toLowerCase() &&
				(!description ||
					p.description.toLowerCase() === description.toLowerCase()),
		);

		if (found.length === 0) {
			errors.push(`Row ${rowNum}: no available product matches ${label}.`);
			continue;
		}

		if (found.length > 1) {
			errors.push(
				description
					? `Row ${rowNum}: ambiguous match for ${label}.`
					: `Row ${rowNum}: ${found.length} products share SKU "${sku}" — add a description column to pick one.`,
			);
			continue;
		}

		const product = found[0];

		if (seenProductIds.has(product.id)) {
			errors.push(`Row ${rowNum}: ${label} is duplicated within the CSV.`);
			continue;
		}

		if (existingDraftProductIds.has(product.id)) {
			errors.push(`Row ${rowNum}: "${sku}" is already in the draft.`);
			continue;
		}

		// Optional price overrides. Column 3 is this customer's price — the box
		// price for a dual-unit product, the unit cost otherwise — and column 4
		// is their sleeve price. Blank or "NA" keeps the product's default.
		const price = isBlankOrNa(priceRaw) ? null : parseFloat(priceRaw);
		if (price !== null && (isNaN(price) || price <= 0)) {
			errors.push(
				`Row ${rowNum}: price must be a positive number, or "NA" to keep the default.`,
			);
			continue;
		}

		const sleevePrice = isBlankOrNa(sleeveRaw) ? null : parseFloat(sleeveRaw);
		if (sleevePrice !== null && (isNaN(sleevePrice) || sleevePrice <= 0)) {
			errors.push(
				`Row ${rowNum}: sleeve price must be a positive number, or "NA" to keep the default.`,
			);
			continue;
		}

		// A sleeve price on a single-unit product would be stored but never
		// used, so reject it rather than silently ignoring it.
		if (sleevePrice !== null && !product.hasUnitOptions) {
			errors.push(
				`Row ${rowNum}: "${sku}" is not a sleeve/box product — use "NA" for the sleeve price.`,
			);
			continue;
		}

		seenProductIds.add(product.id);
		matches.push({
			product,
			customUnitCost: price !== null && !product.hasUnitOptions ? priceRaw : "",
			customBoxPrice: price !== null && product.hasUnitOptions ? priceRaw : "",
			customSleevePrice: sleevePrice !== null ? sleeveRaw : "",
		});
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return { ok: true, matches };
}
