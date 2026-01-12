import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "./template";

export async function generateInvoicePdf(invoiceData: any) {
	const pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoiceData} />);
	return pdfBuffer;
}
