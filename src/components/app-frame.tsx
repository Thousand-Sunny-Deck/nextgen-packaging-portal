"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Navbar } from "@/components/ui/navbar";

export function AppFrame({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const showNavbar =
		!pathname.startsWith("/dashboard/") &&
		pathname !== "/auth/login" &&
		pathname !== "/auth/register";

	return (
		<>
			{showNavbar ? <Navbar /> : null}
			<main className={cn(showNavbar && "pt-12")}>{children}</main>
		</>
	);
}
