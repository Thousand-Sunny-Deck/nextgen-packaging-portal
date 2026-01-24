import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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

interface InvoiceProps {
	invoiceData: InvoiceData;
}

// Create styles
const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: "Helvetica",
	},
	header: {
		marginBottom: 30,
	},
	companyName: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
	},
	invoiceTitle: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 10,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
	},
	addressSection: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
		marginBottom: 30,
	},
	addressBox: {
		width: "48%",
	},
	addressLabel: {
		fontSize: 9,
		fontWeight: "bold",
		marginBottom: 5,
	},
	addressText: {
		fontSize: 9,
		lineHeight: 1.4,
	},
	table: {
		marginTop: 20,
		marginBottom: 20,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f0f0f0",
		padding: 8,
		fontWeight: "bold",
		fontSize: 9,
	},
	tableRow: {
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		padding: 8,
		fontSize: 9,
	},
	itemCodeCol: { width: "16%" },
	descriptionCol: { width: "40%" },
	qtyCol: { width: "12%", textAlign: "center" },
	unitPriceCol: { width: "16%", textAlign: "center" },
	amountCol: { width: "16%", textAlign: "center" },
	totalsSection: {
		marginTop: 20,
		alignItems: "flex-end",
	},
	totalRow: {
		flexDirection: "row",
		width: 250,
		justifyContent: "space-between",
		marginBottom: 5,
		fontSize: 10,
	},
	totalLabel: {
		fontWeight: "bold",
	},
	grandTotal: {
		marginTop: 10,
		paddingTop: 10,
		borderTopWidth: 2,
		borderTopColor: "#000",
	},
	paymentSection: {
		marginTop: 30,
		padding: 15,
		backgroundColor: "#f8f8f8",
	},
	paymentTitle: {
		fontSize: 11,
		fontWeight: "bold",
		marginBottom: 10,
	},
	paymentDetails: {
		fontSize: 9,
		lineHeight: 1.5,
	},
	paymentType: {
		fontSize: 9,
		lineHeight: 1.5,
		paddingBottom: 6,
	},
	boldLabel: {
		fontWeight: "bold",
	},
	paymentRow: {
		flexDirection: "column",
		marginBottom: 6,
		fontSize: 9,
		lineHeight: 1.5,
	},
	footer: {
		position: "absolute",
		bottom: 40,
		left: 40,
		right: 40,
		flexDirection: "row",
		justifyContent: "space-between",
		fontSize: 9,
		color: "#666",
	},
});

const Invoice = ({ invoiceData }: InvoiceProps) => {
	const {
		invoiceNumber,
		issueDate,
		dueDate,
		billTo,
		shipTo,
		items,
		subtotal,
		tax,
		total,
		totalPaid,
		balanceDue,
		bankDetails,
	} = invoiceData;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.companyName}>NextGen Packaging</Text>
					<Text style={styles.invoiceTitle}>Tax invoice</Text>
					<View style={styles.row}>
						<Text>Invoice number: {invoiceNumber}</Text>
						<Text>Issue date: {issueDate}</Text>
						<Text>Due date: {dueDate}</Text>
					</View>
				</View>

				{/* Bill To and Ship To */}
				<View style={styles.addressSection}>
					<View style={styles.addressBox}>
						<Text style={styles.addressLabel}>Bill to</Text>
						<Text style={styles.addressText}>{billTo.name}</Text>
						<Text style={styles.addressText}>{billTo.company}</Text>
						<Text style={styles.addressText}>{billTo.streetAddress}</Text>
						<Text style={styles.addressText}>
							{[billTo.suburb, billTo.postcode].join(", ")}
						</Text>
						<Text style={styles.addressText}>{billTo.country}</Text>
					</View>
					<View style={styles.addressBox}>
						<Text style={styles.addressLabel}>Ship to</Text>
						<Text style={styles.addressText}>{shipTo.name}</Text>
						<Text style={styles.addressText}>{shipTo.company}</Text>
						<Text style={styles.addressText}>{shipTo.streetAddress}</Text>
						<Text style={styles.addressText}>
							{[shipTo.suburb, shipTo.postcode].join(", ")}
						</Text>
						<Text style={styles.addressText}>{shipTo.country}</Text>
					</View>
				</View>

				{/* Table */}
				<View style={styles.table}>
					{/* Table Header */}
					<View style={styles.tableHeader}>
						<Text style={styles.itemCodeCol}>Item ID</Text>
						<Text style={styles.descriptionCol}>Description</Text>
						<Text style={styles.qtyCol}>Qty</Text>
						<Text style={styles.unitPriceCol}>Unit price ($)</Text>
						<Text style={styles.amountCol}>Amount ($)</Text>
					</View>

					{/* Table Rows */}
					{items.map((item: InvoiceItem, index: number) => (
						<View key={index} style={styles.tableRow}>
							<Text style={styles.itemCodeCol}>{item.itemId}</Text>
							<Text style={styles.descriptionCol}>{item.description}</Text>
							<Text style={styles.qtyCol}>{item.qty}</Text>
							<Text style={styles.unitPriceCol}>
								{item.unitPrice.toFixed(2)}
							</Text>
							<Text style={styles.amountCol}>{item.amount.toFixed(2)}</Text>
						</View>
					))}
				</View>

				{/* Totals */}
				<View style={styles.totalsSection}>
					<View style={styles.totalRow}>
						<Text>Subtotal (exc. tax)</Text>
						<Text>${subtotal.toFixed(2)}</Text>
					</View>
					<View style={styles.totalRow}>
						<Text>Tax</Text>
						<Text>${tax.toFixed(2)}</Text>
					</View>
					<View style={[styles.totalRow, styles.grandTotal]}>
						<Text style={styles.totalLabel}>Total Amount (inc. tax)</Text>
						<Text style={styles.totalLabel}>${total.toFixed(2)}</Text>
					</View>
					<View style={styles.totalRow}>
						<Text>Total paid</Text>
						<Text>${totalPaid.toFixed(2)}</Text>
					</View>
					<View style={styles.totalRow}>
						<Text style={styles.totalLabel}>Balance due</Text>
						<Text style={styles.totalLabel}>${balanceDue.toFixed(2)}</Text>
					</View>
				</View>

				{/* Payment Information */}
				<View style={styles.paymentSection}>
					<Text style={styles.paymentTitle}>How to pay</Text>
					{/* Row 1: Bank deposit title */}
					<Text style={styles.paymentType}>Bank deposit</Text>
					{/* Row 2: Bank and Name */}
					<View style={styles.paymentRow}>
						<Text>
							<Text style={styles.boldLabel}>Bank: </Text>
							{bankDetails.bank}
						</Text>
						<Text>
							<Text style={styles.boldLabel}>Name: </Text>
							{bankDetails.name}
						</Text>
					</View>
					{/* Row 3: BSB, AC#, Ref# */}
					<View style={styles.paymentRow}>
						<Text>
							<Text style={styles.boldLabel}>BSB: </Text>
							{bankDetails.bsb}
						</Text>
						<Text>
							<Text style={styles.boldLabel}>AC#: </Text>
							{bankDetails.account}
						</Text>
						<Text>
							<Text style={styles.boldLabel}>Ref#: </Text>
							{bankDetails.reference}
						</Text>
					</View>
				</View>

				{/* Footer */}
				<View style={styles.footer}>
					<Text
						render={({ pageNumber, totalPages }) =>
							`Page ${pageNumber} of ${totalPages}`
						}
					/>
					<Text>Invoice no: {invoiceNumber}</Text>
					<Text>Due date: {dueDate}</Text>
					<Text>Balance due: ${balanceDue.toFixed(2)}</Text>
				</View>
			</Page>
		</Document>
	);
};

export default Invoice;

// Example usage data structure:
export const MockData = {
	invoiceNumber: "MM-0009",
	issueDate: "22/12/2025",
	dueDate: "05/01/2026",
	billTo: {
		name: "Fadi",
		company: "Mia Margarita",
		streetAddress: "Unit 2/330 Seaview Rd",
		suburb: "Henley Beach",
		state: "SA",
		postcode: "5022",
		country: "Australia",
	},
	shipTo: {
		name: "Fadi",
		company: "Mia Margarita",
		streetAddress: "Unit 2/330 Seaview Rd",
		suburb: "Henley Beach",
		state: "SA",
		postcode: "5022",
		country: "Australia",
	},
	items: [
		{
			itemId: "C-96F",
			description: "C-96F 300-700ml Flat Straw Hole Bio Cup Lid - 1000pcs",
			qty: 1,
			unitPrice: 67.0,
			amount: 67.0,
		},
		{
			itemId: "GP16",
			description: "80L Garbage Liners (250PCS)",
			qty: 1,
			unitPrice: 33.0,
			amount: 33.0,
		},
		{
			itemId: "AP-S50",
			description: "AP-S50 50ML SAUCE CONTAINER (4 SLEEVES)",
			qty: 0.2,
			unitPrice: 52.0,
			amount: 10.4,
		},
		{
			itemId: "AP-LIDS",
			description: "SAUCE CONTAINER LID ( 4SLEEVES)",
			qty: 0.2,
			unitPrice: 40.0,
			amount: 8.0,
		},
	],
	subtotal: 118.4,
	tax: 11.84,
	total: 130.24,
	totalPaid: 0.0,
	balanceDue: 130.24,
	bankDetails: {
		bank: "COMMONWEALTH BANK",
		name: "NEXTGEN PACKAGING",
		bsb: "[REDACTED]",
		account: "[REDACTED]",
		reference: "[REDACTED]",
	},
};
