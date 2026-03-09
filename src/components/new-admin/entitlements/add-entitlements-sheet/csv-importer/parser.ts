import type { SpikeAvailableProduct } from "@/actions/spike/entitlements-actions";

const MAX_CSV_ROWS = 50;

type ParseResult =
	| { ok: true; matches: SpikeAvailableProduct[] }
	| { ok: false; errors: string[] };

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

	const matches: SpikeAvailableProduct[] = [];
	const seenProductIds = new Set<string>();

	for (let i = 0; i < lines.length; i++) {
		const rowNum = i + 1;
		const cols = lines[i].split(",");

		if (cols.length !== 2) {
			errors.push(`Row ${rowNum}: expected 2 columns, got ${cols.length}.`);
			continue;
		}

		const sku = cols[0].trim();
		const description = cols[1].trim();
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

		seenProductIds.add(product.id);
		matches.push(product);
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return { ok: true, matches };
}
