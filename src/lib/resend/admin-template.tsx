import * as React from "react";
import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Link,
	Preview,
	Row,
	Column,
	Section,
	Text,
} from "@react-email/components";

export interface AdminEmailDetails {
	customerName: string;
	customerEmail: string;
	orderId: string;
	invoiceId: string;
	totalFormatted: string;
	itemCount: number;
	billingAddress: string;
}

interface AdminEmailTemplateProps {
	details: AdminEmailDetails;
}

export function AdminEmailTemplate({ details }: AdminEmailTemplateProps) {
	const {
		customerName,
		customerEmail,
		orderId,
		invoiceId,
		totalFormatted,
		itemCount,
		billingAddress,
	} = details;

	return (
		<Html>
			<Head />
			<Preview>
				{customerName} placed an order — {totalFormatted}
			</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={content}>
						<Text style={heading}>New Order Received</Text>

						<Text style={paragraph}>
							A new order has been placed and the invoice has been generated.
						</Text>

						<Section style={detailsBox}>
							<Row style={row}>
								<Column style={label}>Customer</Column>
								<Column style={value}>{customerName}</Column>
							</Row>
							<Row style={row}>
								<Column style={label}>Email</Column>
								<Column style={value}>
									<Link href={`mailto:${customerEmail}`} style={link}>
										{customerEmail}
									</Link>
								</Column>
							</Row>
							<Row style={row}>
								<Column style={label}>Order ID</Column>
								<Column style={value}>{orderId}</Column>
							</Row>
							<Row style={row}>
								<Column style={label}>Invoice ID</Column>
								<Column style={value}>{invoiceId}</Column>
							</Row>
							<Row style={row}>
								<Column style={label}>Items</Column>
								<Column style={value}>{itemCount}</Column>
							</Row>
							<Row style={row}>
								<Column style={label}>Billing Address</Column>
								<Column style={value}>{billingAddress}</Column>
							</Row>
							<Row style={totalRow}>
								<Column style={label}>Total</Column>
								<Column style={totalValue}>{totalFormatted}</Column>
							</Row>
						</Section>

						<Text style={paragraph}>
							The invoice PDF is attached to this email.
						</Text>
					</Section>

					<Hr style={hr} />

					<Section style={footer}>
						<Text style={footerText}>
							NextGen Packaging — Internal notification
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
	maxWidth: "600px",
};

const content = {
	padding: "0 48px",
};

const heading = {
	fontSize: "20px",
	fontWeight: "600" as const,
	color: "#1a1a1a",
	marginBottom: "8px",
};

const paragraph = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#4a4a4a",
	marginBottom: "16px",
};

const detailsBox = {
	backgroundColor: "#f8fafc",
	borderRadius: "6px",
	padding: "16px 20px",
	marginBottom: "24px",
};

const row = {
	marginBottom: "10px",
};

const totalRow = {
	marginTop: "12px",
	borderTop: "1px solid #e6ebf1",
	paddingTop: "12px",
};

const label = {
	fontSize: "13px",
	color: "#8898aa",
	width: "140px",
	fontWeight: "500" as const,
};

const value = {
	fontSize: "14px",
	color: "#1a1a1a",
};

const totalValue = {
	fontSize: "16px",
	color: "#1a1a1a",
	fontWeight: "700" as const,
};

const link = {
	color: "#2563eb",
	textDecoration: "underline",
};

const hr = {
	borderColor: "#e6ebf1",
	margin: "32px 0",
};

const footer = {
	padding: "0 48px",
};

const footerText = {
	fontSize: "13px",
	lineHeight: "20px",
	color: "#8898aa",
	textAlign: "center" as const,
};
