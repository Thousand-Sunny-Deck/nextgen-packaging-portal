import { StyleSheet } from "@react-pdf/renderer";

export const pdfTemplateStyles = StyleSheet.create({
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
