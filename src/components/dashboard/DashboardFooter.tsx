import Link from "next/link";

// TODO: need to update this for later
const footerLinks = [
	{ label: "Support", href: "/support" },
	{ label: "Contact", href: "/contact" },
	{ label: "Terms", href: "/terms" },
	{ label: "Privacy", href: "/privacy" },
];

export const DashboardFooter = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full py-4 px-8 md:px-20 lg:px-32">
			<div className="flex flex-col md:flex-row justify-between items-center gap-2">
				<p className="text-xs text-neutral-400">
					© {currentYear} NextGen Packaging Portal
				</p>
				<nav className="flex items-center gap-3">
					{footerLinks.map((link, index) => (
						<span key={link.label} className="flex items-center gap-3">
							<Link
								href={link.href}
								className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
							>
								{link.label}
							</Link>
							{index < footerLinks.length - 1 && (
								<span className="text-neutral-300">·</span>
							)}
						</span>
					))}
				</nav>
			</div>
		</footer>
	);
};
