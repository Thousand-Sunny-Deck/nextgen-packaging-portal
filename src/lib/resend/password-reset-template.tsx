import * as React from "react";
import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
	userName: string;
	resetUrl: string;
}

export function PasswordResetEmail({
	userName,
	resetUrl,
}: PasswordResetEmailProps) {
	const companyName = "NextGen Packaging";

	return (
		<Html>
			<Head />
			<Preview>Reset your {companyName} password</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={content}>
						<Text style={heading}>{companyName}</Text>

						<Text style={greeting}>Hi {userName || "there"},</Text>

						<Text style={paragraph}>
							We received a request to reset your password. Click the button
							below to choose a new password.
						</Text>

						<Section style={buttonContainer}>
							<Button style={button} href={resetUrl}>
								Reset Password
							</Button>
						</Section>

						<Text style={paragraph}>
							This link will expire in 1 hour. If you didn&apos;t request a
							password reset, you can safely ignore this email.
						</Text>

						<Text style={paragraph}>
							If the button above doesn&apos;t work, copy and paste this link
							into your browser:
						</Text>

						<Text style={linkText}>{resetUrl}</Text>

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
							This is an automated message. Please do not reply to this email.
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
	fontSize: "24px",
	fontWeight: "bold" as const,
	color: "#1a1a1a",
	textAlign: "center" as const,
	marginBottom: "32px",
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

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: "#1a1a1a",
	borderRadius: "6px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "bold" as const,
	textDecoration: "none",
	textAlign: "center" as const,
	padding: "12px 24px",
};

const linkText = {
	fontSize: "13px",
	lineHeight: "20px",
	color: "#2563eb",
	wordBreak: "break-all" as const,
	marginBottom: "16px",
};

const signoff = {
	fontSize: "15px",
	lineHeight: "24px",
	color: "#4a4a4a",
	marginTop: "32px",
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
