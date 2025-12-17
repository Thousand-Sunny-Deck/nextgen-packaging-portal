"use client";
import { SignUpUser } from "@/actions/auth/sign-in-action";
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

const RegisterPage = () => {
	const [isPending, setIsPending] = useState<boolean>(false);
	const router = useRouter();

	const form = useForm<LoginFormSchemaT>({
		resolver: zodResolver(LoginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleSignUp = async (data: LoginFormSchemaT) => {
		setIsPending(true);
		const { error } = await SignUpUser(data);

		if (error) {
			toast.error(error);
			setIsPending(false);
		} else {
			router.replace("/auth/login");
		}
	};

	return (
		<div className="w-full h-screen flex  bg-orange-50">
			<div className="w-7/12 h-full flex flex-col ">
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
				<h1 className="text-3xl font-bold pb-9 text-center w-full">
					REQUEST ACCESS
				</h1>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSignUp)}
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
						<Button
							type="submit"
							className="ml-14 mr-14 mt-2"
							disabled={isPending}
						>
							Submit
						</Button>
					</form>
				</Form>

				<p className="text-muted-foreground text-sm mt-2 text-center">
					Already have an account?{" "}
					<Link href="/auth/login" className="hover:text-foreground">
						Login
					</Link>
				</p>
			</div>
		</div>
	);
};

export default RegisterPage;
