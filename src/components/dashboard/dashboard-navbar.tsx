import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

interface DashboardNavbarProps {
	uuid: string;
}

export function DashboardNavbar({ uuid }: DashboardNavbarProps) {
	return (
		<header className="sticky top-0 z-50 h-12 backdrop-blur bg-orange-50">
			<div className="grid h-full grid-cols-3 items-center px-4">
				{/* Left: Navigation Links */}
				<div className="flex gap-6 px-6">
					<Link
						href={`/dashboard/${uuid}/order`}
						className="px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-white/60 rounded-md transition-all"
					>
						Place Order
					</Link>
					<Link
						href={`/dashboard/${uuid}/home#all-invoices`}
						className="px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-white/60 rounded-md transition-all"
					>
						Invoices
					</Link>
					<Link
						href={`/dashboard/${uuid}/account`}
						className="px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-white/60 rounded-md transition-all"
					>
						Account
					</Link>
				</div>

				{/* Center: Branding */}
				<Link href={`/dashboard/${uuid}/home`} className="text-center">
					<h2 className="text-lg font-bold tracking-wide hover:text-gray-600 transition-colors cursor-pointer">
						NEXTGEN PACKAGING
					</h2>
				</Link>

				{/* Right: LogOut Button */}
				<div className="flex justify-end">
					<SignOutButton />
				</div>
			</div>
		</header>
	);
}
