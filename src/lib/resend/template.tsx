import * as React from "react";
import {
	Body,
	Container,
	Head,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

export interface EmailDetails {
	customerName: string;
	companyName: string;
	companyEmail: string;
	companyAddress: string;
	companyWebsite: string;
	portalUrl: string;
}

interface EmailTemplateProps {
	emailDetails: EmailDetails;
}

export function EmailTemplate({ emailDetails }: EmailTemplateProps) {
	const {
		customerName,
		companyName,
		companyEmail,
		companyAddress,
		companyWebsite,
		portalUrl,
	} = emailDetails;

	return (
		<Html>
			<Head />
			<Preview>{companyName} – Your order is ready</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={content}>
						<Text style={greeting}>Hi {customerName},</Text>

						<Text style={paragraph}>
							Thanks for your order! Your invoice is now ready.
						</Text>

						<Text style={paragraph}>
							You&apos;ll find the document attached to this email for your
							convenience.
						</Text>

						<Text style={paragraph}>
							You can also view and download it anytime from your account
							portal:{" "}
							<Link href={portalUrl} style={link}>
								{portalUrl}
							</Link>
						</Text>

						<Text style={paragraph}>
							If you have any questions, please contact us at{" "}
							<Link href={`mailto:${companyEmail}`} style={link}>
								{companyEmail}
							</Link>
							.
						</Text>

						<Text style={paragraph}>
							Thanks again for choosing {companyName}.
						</Text>

						<Text style={signoff}>
							Best regards,
							<br />
							The {companyName} Team
						</Text>
					</Section>

					<Hr style={hr} />

					<Section style={footer}>
						<Text style={footerText}>
							<strong>{companyName}</strong>
							<br />
							{companyAddress}
							<br />
							<Link href={`mailto:${companyEmail}`} style={footerLink}>
								{companyEmail}
							</Link>
							<br />
							<Link href={companyWebsite} style={footerLink}>
								{companyWebsite}
							</Link>
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

const greeting = {
	fontSize: "16px",
	lineHeight: "26px",
	color: "#1a1a1a",
	marginBottom: "16px",
};

const paragraph = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#4a4a4a",
	marginBottom: "16px",
};

const signoff = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#4a4a4a",
	marginTop: "32px",
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

const footerLink = {
	color: "#8898aa",
	textDecoration: "underline",
};
