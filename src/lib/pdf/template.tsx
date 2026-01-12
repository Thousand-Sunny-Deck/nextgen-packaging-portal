import { Document, Page, Text, View } from "@react-pdf/renderer";
import { inoviceStyles } from "./styles";

export type InvoiceData = {
	invoice: {
		orderNumber: string;
		date: string;
		customer: {
			name: string;
			address: string;
			abn: string;
		};
		items: {
			sku: string;
			quantity: number;
			price: number;
			name: string;
		}[];
		total: number;
	};
};

export const InvoicePDF = ({ invoice }: InvoiceData) => (
	<Document>
		<Page size="A4" style={inoviceStyles.page}>
			{/* Header */}
			<View style={inoviceStyles.header}>
				<View>
					<Text style={inoviceStyles.companyName}>NextGen Packaging</Text>
					<Text style={inoviceStyles.companyDetails}>
						123 Business Street{"\n"}
						Adelaide, SA 5000{"\n"}
						ABN: 12 345 678 901{"\n"}
						admin@nextgenpacking.com.au
					</Text>
				</View>
				<View style={{ alignItems: "flex-end" }}>
					<Text style={inoviceStyles.invoiceTitle}>INVOICE</Text>
					<Text style={inoviceStyles.invoiceDetails}>
						Invoice #: {invoice.orderNumber}
						{"\n"}
						Date: {invoice.date}
						{"\n"}
						Due Date: {invoice.date}
					</Text>
				</View>
			</View>

			{/* Bill To */}
			<View style={inoviceStyles.billingSection}>
				<Text style={inoviceStyles.sectionTitle}>Bill To</Text>
				<Text style={inoviceStyles.billingInfo}>
					{invoice.customer.name}
					{"\n"}
					{invoice.customer.address}
					{invoice.customer.abn && `\nABN: ${invoice.customer.abn}`}
				</Text>
			</View>

			{/* Items Table */}
			<View style={inoviceStyles.table}>
				{/* Table Header */}
				<View style={inoviceStyles.tableHeader}>
					<Text style={[inoviceStyles.tableHeaderText, inoviceStyles.col1]}>
						Description
					</Text>
					<Text style={[inoviceStyles.tableHeaderText, inoviceStyles.col2]}>
						Qty
					</Text>
					<Text style={[inoviceStyles.tableHeaderText, inoviceStyles.col3]}>
						Unit Price
					</Text>
					<Text style={[inoviceStyles.tableHeaderText, inoviceStyles.col4]}>
						Amount
					</Text>
				</View>

				{/* Table Rows */}
				{invoice.items.map((item, index) => (
					<View key={index} style={inoviceStyles.tableRow}>
						<Text style={[inoviceStyles.tableCell, inoviceStyles.col1]}>
							{item.name}
						</Text>
						<Text style={[inoviceStyles.tableCell, inoviceStyles.col2]}>
							{item.quantity}
						</Text>
						<Text style={[inoviceStyles.tableCell, inoviceStyles.col3]}>
							${item.price.toFixed(2)}
						</Text>
						<Text style={[inoviceStyles.tableCell, inoviceStyles.col4]}>
							${(item.quantity * item.price).toFixed(2)}
						</Text>
					</View>
				))}
			</View>

			{/* Summary */}
			<View style={inoviceStyles.summarySection}>
				<View style={inoviceStyles.summaryRow}>
					<Text style={inoviceStyles.summaryLabel}>Subtotal</Text>
					<Text style={inoviceStyles.summaryValue}>
						${invoice.total.toFixed(2)}
					</Text>
				</View>
				{/** TODO: add a tax field here */}
				<View style={inoviceStyles.summaryRow}>
					<Text style={inoviceStyles.summaryLabel}>Tax</Text>
					<Text style={inoviceStyles.summaryValue}>
						${invoice.total.toFixed(2)}
					</Text>
				</View>

				<View style={inoviceStyles.totalRow}>
					<Text style={inoviceStyles.totalLabel}>Total</Text>
					<Text style={inoviceStyles.totalValue}>
						${invoice.total.toFixed(2)}
					</Text>
				</View>
			</View>

			{/* Footer */}
			<Text style={inoviceStyles.footer}>
				Thank you for your business!{"\n"}
				For any questions, please contact us at hello@yourcompany.com
			</Text>
		</Page>
	</Document>
);
