"use client";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema, ResetPasswordSchemaT } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ResetPasswordPage = () => {
	const [isPending, setIsPending] = useState<boolean>(false);
	const [tokenError, setTokenError] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");

	useEffect(() => {
		if (error === "INVALID_TOKEN") {
			setTokenError("This reset link is invalid or has expired.");
		} else if (!token) {
			setTokenError("No reset token provided.");
		}
	}, [token, error]);

	const form = useForm<ResetPasswordSchemaT>({
		resolver: zodResolver(ResetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	const handleSubmit = async (data: ResetPasswordSchemaT) => {
		if (!token) {
			toast.error("No reset token provided.");
			return;
		}

		setIsPending(true);

		// TODO: Call resetPassword action once auth config is set up
		console.log(
			"Reset password with token:",
			token,
			"new password:",
			data.password,
		);

		// Simulate success for now
		await new Promise((resolve) => setTimeout(resolve, 1000));
		toast.success("Password reset successfully!");
		setIsPending(false);
		router.replace("/auth/login");
	};

	return (
		<div className="w-full h-screen flex bg-orange-50">
			<div className="w-7/12 h-full flex flex-col">
				<div className="w-7/12 absolute inset-0 bg-gradient-to-t to-black/90 from-black/50">
					<h1 className="p-8 pt-12 text-8xl font-semibold text-white bg-transparent">
						NEXTGEN PACKAGING
					</h1>
				</div>
				<Image
					src="/assets/login/login.jpg"
					alt="NextGen Packaging"
					className="h-full w-full"
					width={10000}
					height={10000}
				/>
			</div>
			<div className="w-1/4 h-full p-8 flex flex-col ml-auto mr-32 mt-48">
				<h1 className="text-3xl font-bold pb-4 text-center w-full">
					RESET PASSWORD
				</h1>

				{tokenError ? (
					<div className="flex flex-col items-center gap-4">
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
							<p className="text-red-800 text-sm">{tokenError}</p>
						</div>
						<Link
							href="/auth/forgot-password"
							className="text-sm text-muted-foreground hover:text-foreground"
						>
							Request a new reset link
						</Link>
					</div>
				) : (
					<>
						<p className="text-muted-foreground text-sm mb-6 text-center">
							Enter your new password below.
						</p>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmit)}
								className="flex flex-col gap-5"
							>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="New Password"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder="Confirm Password"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="ml-14 mr-14 mt-2"
									disabled={isPending}
								>
									{isPending ? "Resetting..." : "Reset Password"}
								</Button>
							</form>
						</Form>

						<p className="text-muted-foreground text-sm mt-4 text-center">
							Remember your password?{" "}
							<Link href="/auth/login" className="hover:text-foreground">
								Back to login
							</Link>
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default ResetPasswordPage;
