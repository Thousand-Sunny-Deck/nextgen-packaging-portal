"use client";
import { SignInUser } from "@/actions/auth/sign-in-action";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormSchema, LoginFormSchemaT } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const EntryPage = () => {
	const [isPending, setIsPending] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<LoginFormSchemaT>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSignIn = async (data: LoginFormSchemaT) => {
		setIsPending(true);
		const { error, user } = await SignInUser(data);

		if (error) {
			toast.error(error);
			setIsPending(false);
		} else {
			// if it gets here that means there always exists a user.id
			console.log(user);
			const redirectUrl = `/dashboard/${user?.uuid}/home`;
			router.replace(redirectUrl);
		}
	};

	return (
		<div className="w-full h-screen flex bg-orange-50">
			{/* Image section - hidden on mobile (md:flex means show on medium screens and up) */}
			<div className="hidden md:flex md:w-7/12 h-full flex-col">
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

			{/* Form section - responsive width and positioning */}
			<div className="w-full md:w-1/4 h-full p-8 flex flex-col mx-auto md:ml-auto md:mr-32 mt-24 md:mt-48 justify-center md:justify-start">
				<h1 className="text-3xl font-bold pb-9 text-center w-full">LOG IN</h1>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSignIn)}
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
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder="Password" type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="text-right">
							<Link
								href="/auth/forgot-password"
								className="text-sm text-muted-foreground hover:text-foreground"
							>
								Forgot password?
							</Link>
						</div>
						<Button
							type="submit"
							className="md:ml-14 md:mr-14 mt-2"
							disabled={isPending}
						>
							Log in
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default EntryPage;
