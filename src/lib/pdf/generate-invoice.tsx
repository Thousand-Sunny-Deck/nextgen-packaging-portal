import { renderToBuffer } from "@react-pdf/renderer";
import Invoice from "./template";
import { InvoiceData } from "./types";

export async function generateInvoicePdf(invoiceData: InvoiceData) {
	return await renderToBuffer(<Invoice invoiceData={invoiceData} />);
}
