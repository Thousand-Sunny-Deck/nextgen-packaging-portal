import { renderToBuffer } from "@react-pdf/renderer";
import Invoice from "./template";
import type { InvoiceData } from "./template";

export async function generateInvoicePdf(invoiceData: InvoiceData) {
	return await renderToBuffer(<Invoice invoiceData={invoiceData} />);
}
