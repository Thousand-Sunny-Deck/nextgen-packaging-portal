import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
			<div className="max-w-md w-full text-center">
				<Image
					src="/assets/not-found-illustration.jpg"
					alt="Page not found illustration"
					width={400}
					height={400}
					className="mx-auto mb-8"
					priority
				/>

				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

				<h2 className="text-2xl font-semibold text-gray-700 mb-2">
					Page not found
				</h2>

				<p className="text-gray-500 mb-8">
					Sorry, we couldn&apos;t find the page you&apos;re looking for. It
					might have been moved or doesn&apos;t exist.
				</p>

				<Link
					href="/auth/login"
					className="inline-flex items-center justify-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
				>
					Back to Login
				</Link>
			</div>
		</div>
	);
}
