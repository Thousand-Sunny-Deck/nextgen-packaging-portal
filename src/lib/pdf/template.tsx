import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { InvoiceData } from "./types";
import { pdfTemplateStyles as styles } from "./styles";

interface InvoiceProps {
	invoiceData: InvoiceData;
}

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
					{items.map((item, index: number) => (
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
