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
		const cols = lines[i].split(",");

		// 2 columns grants at the product's default prices; 4 columns adds this
		// customer's own prices (same shape as the product-upload CSV).
		if (cols.length !== 2 && cols.length !== 4) {
			errors.push(
				`Row ${rowNum}: expected 2 or 4 columns, got ${cols.length}.`,
			);
			continue;
		}

		const sku = cols[0].trim();
		const description = cols[1].trim();
		const priceRaw = cols[2]?.trim() ?? "";
		const sleeveRaw = cols[3]?.trim() ?? "";
		let rowValid = true;

		if (!sku) {
			errors.push(`Row ${rowNum}: SKU is required.`);
			rowValid = false;
		} else if (/[,"]/.test(sku)) {
			errors.push(`Row ${rowNum}: SKU must not contain commas or quotes.`);
			rowValid = false;
		}

		if (!description) {
			errors.push(`Row ${rowNum}: description is required.`);
			rowValid = false;
		} else if (/[,"]/.test(description)) {
			errors.push(
				`Row ${rowNum}: description must not contain commas or quotes.`,
			);
			rowValid = false;
		}

		if (!rowValid) continue;

		const found = availableProducts.filter(
			(p) =>
				p.sku.toLowerCase() === sku.toLowerCase() &&
				p.description.toLowerCase() === description.toLowerCase(),
		);

		if (found.length === 0) {
			errors.push(
				`Row ${rowNum}: no available product matches SKU "${sku}" and description "${description}".`,
			);
			continue;
		}

		if (found.length > 1) {
			errors.push(
				`Row ${rowNum}: ambiguous match for SKU "${sku}" and description "${description}".`,
			);
			continue;
		}

		const product = found[0];

		if (seenProductIds.has(product.id)) {
			errors.push(
				`Row ${rowNum}: SKU "${sku}" / "${description}" is duplicated within the CSV.`,
			);
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
