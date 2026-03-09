import { MAX_PRODUCT_DRAFT } from "@/lib/store/create-product-store";

export type ParsedRow = {
	sku: string;
	description: string;
	unitCost: number;
};

type ParseResult =
	| { ok: true; rows: ParsedRow[] }
	| { ok: false; errors: string[] };

const MAX_INPUT_ROWS = MAX_PRODUCT_DRAFT; // upper bound on raw CSV lines

export function parseCsv(text: string, existingSkus: Set<string>): ParseResult {
	const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
	const errors: string[] = [];

	if (lines.length === 0) {
		return { ok: false, errors: ["The file is empty."] };
	}

	if (lines.length > MAX_INPUT_ROWS) {
		return {
			ok: false,
			errors: [`CSV has ${lines.length} rows — max is ${MAX_INPUT_ROWS}.`],
		};
	}

	const rows: ParsedRow[] = [];
	const seenSkus = new Set<string>(); // deduplicate within this file

	for (let i = 0; i < lines.length; i++) {
		const rowNum = i + 1;
		const cols = lines[i].split(",");

		if (cols.length !== 4) {
			errors.push(`Row ${rowNum}: expected 4 columns, got ${cols.length}.`);
			continue;
		}

		const sku = cols[0].trim();
		const description = cols[1].trim();
		const costStr = cols[2].trim();
		const sleeveRaw = cols[3].trim();
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

		// Sleeve cost — required, must be "NA" or a positive number
		const isSleeveNa = sleeveRaw.toUpperCase() === "NA";
		const sleeveCost = isSleeveNa ? null : parseFloat(sleeveRaw);
		if (!sleeveRaw) {
			errors.push(
				`Row ${rowNum}: sleeve cost is required — use "NA" if not applicable.`,
			);
			rowValid = false;
		} else if (!isSleeveNa && (isNaN(sleeveCost!) || sleeveCost! <= 0)) {
			errors.push(
				`Row ${rowNum}: sleeve cost must be "NA" or a positive number.`,
			);
			rowValid = false;
		}

		// Duplicate SKU checks — only when SKU is otherwise valid
		if (rowValid) {
			const candidates = sleeveCost !== null ? [sku, `${sku}-SLV`] : [sku];

			for (const candidate of candidates) {
				const key = candidate.toLowerCase();
				if (seenSkus.has(key)) {
					errors.push(
						`Row ${rowNum}: SKU "${candidate}" is duplicated within the CSV.`,
					);
					rowValid = false;
					break;
				}
				if (existingSkus.has(key)) {
					errors.push(
						`Row ${rowNum}: SKU "${candidate}" is already in the draft.`,
					);
					rowValid = false;
					break;
				}
			}

			if (rowValid) {
				for (const candidate of candidates)
					seenSkus.add(candidate.toLowerCase());
			}
		}

		if (rowValid) {
			rows.push({ sku, description, unitCost: cost });

			if (sleeveCost !== null) {
				rows.push({
					sku: `${sku}-SLV`,
					description: `${description} Sleeve`,
					unitCost: sleeveCost,
				});
			}
		}
	}

	// After expansion, check total generated products against the hard cap
	if (errors.length === 0 && rows.length > MAX_PRODUCT_DRAFT) {
		return {
			ok: false,
			errors: [
				`CSV would generate ${rows.length} products (including sleeves) — max is ${MAX_PRODUCT_DRAFT}.`,
			],
		};
	}

	if (errors.length > 0) {
		return { ok: false, errors };
	}

	return { ok: true, rows };
}
