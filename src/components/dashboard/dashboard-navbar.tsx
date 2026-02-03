"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { SignOutButton } from "./sign-out-button";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

interface DashboardNavbarProps {
	uuid: string;
}

export function DashboardNavbar({ uuid }: DashboardNavbarProps) {
	const [open, setOpen] = useState(false);

	const navLinks = [
		{ href: `/dashboard/${uuid}/order`, label: "Place Order" },
		{ href: `/dashboard/${uuid}/home#all-invoices`, label: "Invoices" },
		{ href: `/dashboard/${uuid}/account`, label: "Account" },
	];

	return (
		<header className="sticky top-0 z-50 h-12 backdrop-blur bg-orange-50">
			<div className="flex h-full items-center justify-between px-4 md:grid md:grid-cols-3">
				{/* Mobile: Hamburger Menu */}
				<div className="md:hidden">
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon-sm">
								<Menu className="size-5" />
								<span className="sr-only">Open menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-64">
							<SheetHeader>
								<SheetTitle className="text-left">Menu</SheetTitle>
							</SheetHeader>
							<nav className="flex flex-col gap-2 mt-6">
								{navLinks.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										onClick={() => setOpen(false)}
										className="px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-orange-100 hover:translate-x-1 active:bg-orange-200 rounded-md transition-all cursor-pointer"
									>
										{link.label}
									</Link>
								))}
								<div className="mt-4 pt-4 border-t">
									<SignOutButton />
								</div>
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				{/* Desktop: Navigation Links */}
				<div className="hidden md:flex gap-2 lg:gap-6 px-2 lg:px-6">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="px-2 lg:px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-white/60 rounded-md transition-all"
						>
							{link.label}
						</Link>
					))}
				</div>

				{/* Center: Branding */}
				<Link
					href={`/dashboard/${uuid}/home`}
					className="text-center md:justify-self-center"
				>
					<h2 className="text-lg font-bold tracking-wide hover:text-gray-600 transition-colors cursor-pointer">
						NEXTGEN PACKAGING
					</h2>
				</Link>

				{/* Right: LogOut Button (Desktop only) */}
				<div className="hidden md:flex justify-end">
					<SignOutButton />
				</div>

				{/* Mobile: Empty space for balance */}
				<div className="w-8 md:hidden" />
			</div>
		</header>
	);
}
