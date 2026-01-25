import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../lib/env-validation/env";

export function createS3Client() {
	return new S3Client({
		region: env.AWS_REGION || "us-east-1",
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID!,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
		},
		// Optional: Configure for better performance
		maxAttempts: 3,
	});
}

export class S3Service {
	private client: S3Client;
	private bucketName: string;
	private aws_region: string;

	constructor(bucketName?: string) {
		this.client = createS3Client();
		this.bucketName = bucketName || env.AWS_S3_BUCKET_NAME || "";
		this.aws_region = env.AWS_REGION;

		if (!this.bucketName) {
			throw new Error(
				"S3 bucket name is required. Set AWS_S3_BUCKET_NAME env variable.",
			);
		}
	}

	/**
	 * Upload a file to S3
	 */
	async uploadFile(
		key: string,
		body: Buffer | Uint8Array | string,
		contentType?: string,
	): Promise<{ key: string; url: string }> {
		const command = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: key,
			Body: body,
			ContentType: contentType,
		});

		await this.client.send(command);

		return {
			key,
			url: `https://${this.bucketName}.s3.${this.aws_region}.amazonaws.com/${key}`,
		};
	}

	/**
	 * Get a file from S3
	 */
	async getFile(key: string): Promise<Buffer> {
		const command = new GetObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		const response = await this.client.send(command);

		if (!response.Body) {
			throw new Error("File body is empty");
		}

		// Convert stream to buffer
		const chunks: Uint8Array[] = [];
		for await (const chunk of response.Body as any) {
			chunks.push(chunk);
		}

		return Buffer.concat(chunks);
	}

	/**
	 * Delete a file from S3
	 */
	async deleteFile(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: this.bucketName,
			Key: key,
		});

		await this.client.send(command);
	}

	/**
	 * List files in S3 bucket (with optional prefix)
	 */
	async listFiles(prefix?: string, maxKeys: number = 1000): Promise<string[]> {
		const command = new ListObjectsV2Command({
			Bucket: this.bucketName,
			Prefix: prefix,
			MaxKeys: maxKeys,
		});

		const response = await this.client.send(command);
		return response.Contents?.map((item) => item.Key || "") || [];
	}

	/**
	 * Generate a presigned URL for temporary access
	 * Useful for direct uploads from browser or temporary download links
	 */
	async getPresignedUrl(
		key: string,
		expiresIn: number = 3600, // 1 hour default
		operation: "get" | "put" = "get",
	): Promise<string> {
		const command =
			operation === "get"
				? new GetObjectCommand({ Bucket: this.bucketName, Key: key })
				: new PutObjectCommand({ Bucket: this.bucketName, Key: key });

		return await getSignedUrl(this.client, command, { expiresIn });
	}

	/**
	 * Check if a file exists
	 */
	async fileExists(key: string): Promise<boolean> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});
			await this.client.send(command);
			return true;
		} catch (error: any) {
			if (error.name === "NoSuchKey") {
				return false;
			}
			throw error;
		}
	}

	/**
	 * Clean up (good practice for serverless)
	 */
	destroy() {
		this.client.destroy();
	}
}
