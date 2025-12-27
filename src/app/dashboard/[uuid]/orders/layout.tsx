export default function PortalLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <section>{children}</section>;
}
