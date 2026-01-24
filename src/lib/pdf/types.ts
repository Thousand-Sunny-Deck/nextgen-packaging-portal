interface Address {
	name: string;
	company: string;
	streetAddress: string;
	suburb: string;
	postcode: string;
	country: string;
}

interface InvoiceItem {
	itemId: string;
	description: string;
	qty: number;
	unitPrice: number;
	amount: number;
}

interface BankDetails {
	bank: string;
	name: string;
	bsb: string;
	account: string;
	reference: string;
}

export interface InvoiceData {
	invoiceNumber: string;
	issueDate: string;
	dueDate: string;
	billTo: Address;
	shipTo: Address;
	items: InvoiceItem[];
	subtotal: number;
	tax: number;
	total: number;
	totalPaid: number;
	balanceDue: number;
	bankDetails: BankDetails;
}
