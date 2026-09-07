import { env } from "@/lib/env-validation/env";
import { Resend } from "resend";

export interface AdminDetails {
	from: string;
	subject: string;
}

export interface TargetDetails {
	to: string[];
}

export class PostOffice {
	private client: Resend;
	private adminDetails: AdminDetails;

	constructor(adminDetails: AdminDetails) {
		this.client = new Resend(env.RESEND_API_KEY);
		this.adminDetails = adminDetails;
	}

	async deliver(
		targetDetails: TargetDetails,
		template: React.ReactNode,
		pdfBuffer?: Buffer,
	) {
		const { data, error } = await this.client.emails.send({
			from: this.adminDetails.from,
			to: [...targetDetails.to],
			subject: this.adminDetails.subject,
			react: template,
			...(pdfBuffer && {
				attachments: [{ content: pdfBuffer, filename: "invoice.pdf" }],
			}),
		});

		// Resend reports failures in the payload rather than throwing, so an
		// unchecked send silently drops the email. Throw instead: the Inngest
		// job then retries it, and the approval path logs it.
		if (error) {
			throw new Error(
				`Resend failed to send "${this.adminDetails.subject}" to ${targetDetails.to.join(", ")}: ${error.message}`,
			);
		}

		return data;
	}
}
