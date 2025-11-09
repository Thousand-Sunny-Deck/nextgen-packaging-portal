"use client";
import { SignInUser } from "@/actions/auth/sign-in-action";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginFormSchema, LoginFormSchemaT } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
		<div className="ml-10 mt-10">
			<div className="p-8 flex flex-col gap-4">
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
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="example@company.com" {...field} />
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
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input placeholder="" type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={isPending}>
							Log in
						</Button>
					</form>
				</Form>

				<p className="text-muted-foreground text-sm">
					Don&apos;t have an account?{" "}
					<Link href="/auth/register" className="hover:text-foreground">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
};

export default EntryPage;
