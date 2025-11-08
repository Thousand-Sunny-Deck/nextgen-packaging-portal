"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

export const SignOutButton = () => {
	const handleSignOutButton = async () => {
		await signOut({
			fetchOptions: {
				onError: (ctx) => {
					console.error({
						error: ctx.error,
					});
				},
				onSuccess: (ctx) => {
					console.log({
						reponse: ctx.response,
						data: ctx.data,
					});
					redirect("/entry");
				},
			},
		});
	};

	return (
		<Button type="button" onClick={handleSignOutButton}>
			Sign Out
		</Button>
	);
};
