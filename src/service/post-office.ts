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
			to: targetDetails.to,
			subject: this.adminDetails.subject,
			react: template,
			attachments: [
				{
					content: pdfBuffer,
					filename: "invoice.pdf",
				},
			],
		});

		return {
			data,
			error,
		};
	}
}
