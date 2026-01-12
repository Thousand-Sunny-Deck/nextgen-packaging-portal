import { StyleSheet } from "@react-pdf/renderer";

export const inoviceStyles = StyleSheet.create({
	page: {
		padding: 40,
		fontSize: 10,
		fontFamily: "Helvetica",
		color: "#333",
	},

	// Header
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 40,
		paddingBottom: 20,
		borderBottomWidth: 2,
		borderBottomColor: "#000",
	},
	companyName: {
		fontSize: 24,
		fontFamily: "Helvetica-Bold",
		color: "#000",
		marginBottom: 4,
	},
	companyDetails: {
		fontSize: 9,
		color: "#666",
		lineHeight: 1.4,
	},
	invoiceTitle: {
		fontSize: 14,
		fontFamily: "Helvetica-Bold",
		color: "#000",
		marginBottom: 8,
	},
	invoiceDetails: {
		fontSize: 9,
		color: "#666",
		lineHeight: 1.5,
	},

	// Billing section
	billingSection: {
		marginBottom: 40,
	},
	sectionTitle: {
		fontSize: 11,
		fontFamily: "Helvetica-Bold",
		color: "#000",
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	billingInfo: {
		fontSize: 10,
		lineHeight: 1.5,
		color: "#333",
	},

	// Table
	table: {
		marginBottom: 30,
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#f8f9fa",
		padding: 12,
		borderRadius: 4,
		marginBottom: 2,
	},
	tableHeaderText: {
		fontSize: 9,
		fontFamily: "Helvetica-Bold",
		color: "#000",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#e9ecef",
	},
	tableCell: {
		fontSize: 10,
		color: "#333",
	},

	// Column widths
	col1: { width: "50%" },
	col2: { width: "15%", textAlign: "center" },
	col3: { width: "17.5%", textAlign: "right" },
	col4: { width: "17.5%", textAlign: "right" },

	// Summary
	summarySection: {
		marginTop: 20,
		alignItems: "flex-end",
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: 200,
		paddingVertical: 6,
	},
	summaryLabel: {
		fontSize: 10,
		color: "#666",
	},
	summaryValue: {
		fontSize: 10,
		color: "#333",
		fontFamily: "Helvetica-Bold",
	},
	totalRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: 200,
		paddingVertical: 10,
		marginTop: 8,
		borderTopWidth: 2,
		borderTopColor: "#000",
	},
	totalLabel: {
		fontSize: 12,
		fontFamily: "Helvetica-Bold",
		color: "#000",
	},
	totalValue: {
		fontSize: 12,
		fontFamily: "Helvetica-Bold",
		color: "#000",
	},

	// Footer
	footer: {
		position: "absolute",
		bottom: 40,
		left: 40,
		right: 40,
		paddingTop: 20,
		borderTopWidth: 1,
		borderTopColor: "#e9ecef",
		fontSize: 8,
		color: "#999",
		textAlign: "center",
	},
});
