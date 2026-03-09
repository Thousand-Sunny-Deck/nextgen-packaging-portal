import { MAX_CSV } from "./csv-upload";

type ParsedRow = { sku: string; description: string; unitCost: number };
type ParseResult =
	| { ok: true; rows: ParsedRow[] }
	| { ok: false; errors: string[] };

export function parseCsv(text: string, existingSkus: Set<string>): ParseResult {
	const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
	const errors: string[] = [];

	if (lines.length === 0) {
		return { ok: false, errors: ["The file is empty."] };
	}

	if (lines.length > MAX_CSV) {
		return {
			ok: false,
			errors: [`CSV has ${lines.length} rows — max is ${MAX_CSV}.`],
		};
	}

	const rows: ParsedRow[] = [];
	const seenSkus = new Set<string>(); // duplicates within this file

	for (let i = 0; i < lines.length; i++) {
		const rowNum = i + 1;
		const cols = lines[i].split(",");

		if (cols.length !== 3) {
			errors.push(`Row ${rowNum}: expected 3 columns, got ${cols.length}.`);
			continue;
		}

		const sku = cols[0].trim();
		const description = cols[1].trim();
		const costStr = cols[2].trim();
		let rowValid = true;

		// SKU
		if (!sku) {
			errors.push(`Row ${rowNum}: SKU is required.`);
			rowValid = false;
		} else if (/[,"]/.test(sku)) {
			errors.push(`Row ${rowNum}: SKU must not contain commas or quotes.`);
			rowValid = false;
		}

		// Description
		if (!description) {
			errors.push(`Row ${rowNum}: description is required.`);
			rowValid = false;
		} else if (/[,"]/.test(description)) {
			errors.push(
				`Row ${rowNum}: description must not contain commas or quotes.`,
			);
			rowValid = false;
		}

		// Unit cost
		const cost = parseFloat(costStr);
		if (!costStr || isNaN(cost) || cost <= 0) {
			errors.push(`Row ${rowNum}: unit cost must be a positive number.`);
			rowValid = false;
		}

		// Duplicate SKU — only checked when SKU is otherwise valid
		if (rowValid) {
			const key = sku.toLowerCase();
			if (seenSkus.has(key)) {
				errors.push(
					`Row ${rowNum}: SKU "${sku}" is duplicated within the CSV.`,
				);
				rowValid = false;
			} else if (existingSkus.has(key)) {
				errors.push(`Row ${rowNum}: SKU "${sku}" is already in the draft.`);
				rowValid = false;
			} else {
				seenSkus.add(key);
			}
		}

		if (rowValid) {
			rows.push({ sku, description, unitCost: cost });
		}
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return { ok: true, rows };
}
