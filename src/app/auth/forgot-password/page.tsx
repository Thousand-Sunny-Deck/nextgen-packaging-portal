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
import {
	ForgotPasswordSchema,
	ForgotPasswordSchemaT,
} from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
	const [isPending, setIsPending] = useState<boolean>(false);
	const [emailSent, setEmailSent] = useState<boolean>(false);

	const form = useForm<ForgotPasswordSchemaT>({
		resolver: zodResolver(ForgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const handleSubmit = async (data: ForgotPasswordSchemaT) => {
		setIsPending(true);

		// TODO: Call requestPasswordReset action once auth config is set up
		console.log("Request password reset for:", data.email);

		// Simulate success for now
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setEmailSent(true);
		setIsPending(false);
		toast.success("If an account exists, a reset link has been sent.");
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
					FORGOT PASSWORD
				</h1>
				<p className="text-muted-foreground text-sm mb-6 text-center">
					Enter your email and we&apos;ll send you a link to reset your
					password.
				</p>

				{emailSent ? (
					<div className="flex flex-col items-center gap-4">
						<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
							<p className="text-green-800 text-sm">
								If an account exists with that email, you will receive a
								password reset link shortly.
							</p>
						</div>
						<Link
							href="/auth/login"
							className="text-sm text-muted-foreground hover:text-foreground underline"
						>
							Back to login
						</Link>
					</div>
				) : (
					<>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmit)}
								className="flex flex-col gap-5"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="Email" {...field} />
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
									{isPending ? "Sending..." : "Send Reset Link"}
								</Button>
							</form>
						</Form>

						<p className="text-muted-foreground text-sm mt-4 text-center">
							Remember your password?{" "}
							<Link
								href="/auth/login"
								className="hover:text-foreground underline"
							>
								Back to login
							</Link>
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
