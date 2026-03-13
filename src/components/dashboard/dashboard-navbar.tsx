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
	showAdminPortalLink?: boolean;
}

export function DashboardNavbar({
	uuid,
	showAdminPortalLink = false,
}: DashboardNavbarProps) {
	const [open, setOpen] = useState(false);

	const leftNavLinks = [
		{ href: `/dashboard/${uuid}/order`, label: "Quick Order" },
		{ href: `/dashboard/${uuid}/shop`, label: "Shop" },
		{ href: `/dashboard/${uuid}/favourites`, label: "Favourites" },
	];

	const rightNavLinks = [
		{ href: `/dashboard/${uuid}/home#all-invoices`, label: "Invoices" },
		{ href: `/dashboard/${uuid}/account`, label: "Account" },
		...(showAdminPortalLink
			? [{ href: "/admin/home", label: "Admin Portal" }]
			: []),
	];

	return (
		<header className="sticky top-0 z-50 h-12 backdrop-blur bg-orange-50">
			<div className="flex h-full items-center justify-between px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4">
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
							<nav className="flex flex-col gap-5 mt-6">
								<div className="space-y-2">
									<p className="px-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
										Order
									</p>
									{leftNavLinks.map((link) => {
										return (
											<Link
												key={link.href}
												href={link.href}
												onClick={() => setOpen(false)}
												className="px-4 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer flex items-center gap-2 text-gray-800 hover:bg-orange-100 hover:translate-x-1 active:bg-orange-200"
											>
												{link.label}
											</Link>
										);
									})}
								</div>

								<div className="space-y-2">
									<p className="px-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
										Account
									</p>
									{rightNavLinks.map((link) => {
										return (
											<Link
												key={link.href}
												href={link.href}
												onClick={() => setOpen(false)}
												className="px-4 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer flex items-center gap-2 text-gray-800 hover:bg-orange-100 hover:translate-x-1 active:bg-orange-200"
											>
												{link.label}
											</Link>
										);
									})}
								</div>

								<div className="mt-2 pt-4 border-t">
									<SignOutButton />
								</div>
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				{/* Desktop: Branding (Left) */}
				<Link
					href={`/dashboard/${uuid}/home`}
					className="hidden md:block md:justify-self-start md:ml-6 lg:ml-10"
				>
					<h2 className="text-base lg:text-lg font-bold tracking-wide hover:text-gray-600 transition-colors cursor-pointer whitespace-nowrap">
						NEXTGEN PACKAGING
					</h2>
				</Link>

				{/* Mobile: Branding (Center) */}
				<Link
					href={`/dashboard/${uuid}/home`}
					className="text-center md:hidden"
				>
					<h2 className="text-lg font-bold tracking-wide hover:text-gray-600 transition-colors cursor-pointer">
						NEXTGEN PACKAGING
					</h2>
				</Link>

				{/* Desktop: Primary Navigation (Center) */}
				<div className="hidden md:flex items-center justify-center gap-2 lg:gap-3">
					{leftNavLinks.map((link) => {
						return (
							<Link
								key={link.href}
								href={link.href}
								className="px-2 lg:px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap text-gray-800 hover:bg-white/60"
							>
								{link.label}
							</Link>
						);
					})}
				</div>

				{/* Desktop: Account Navigation + Sign Out (Right) */}
				<div className="hidden md:flex items-center justify-end gap-2">
					<div className="w-px bg-orange-200" />
					{rightNavLinks.map((link) => {
						return (
							<Link
								key={link.href}
								href={link.href}
								className="px-2 lg:px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 text-gray-800 hover:bg-white/60"
							>
								{link.label}
							</Link>
						);
					})}
					<SignOutButton />
				</div>

				{/* Mobile: Empty space for balance */}
				<div className="w-8 md:hidden" />
			</div>
		</header>
	);
}
