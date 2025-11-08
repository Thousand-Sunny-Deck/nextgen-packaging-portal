"use client";
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
import { signIn } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
	email: z.email(),
	password: z.string().min(10),
});
type FormSchemaType = z.infer<typeof formSchema>;

const EntryPage = () => {
	const form = useForm<FormSchemaType>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: FormSchemaType) => {
		await signIn.email(
			{
				email: data.email,
				password: data.password,
			},
			{
				onRequest: (ctx) => {
					console.log({
						body: ctx.body,
						headers: ctx.headers,
					});
				},
				onResponse: (ctx) => {
					console.log({
						response: ctx.response,
					});
				},
				onError: (ctx) => {
					console.error(ctx.error.message);
				},
				onSuccess: (ctx) => {
					console.log({
						data: ctx.data,
					});
					redirect("/portal");
				},
			},
		);
	};

	return (
		<div className="ml-10 mt-10">
			<div className="p-8">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
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
						<Button type="submit">Log in</Button>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default EntryPage;
