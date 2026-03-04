import Image from "next/image";

const DowntimePage = () => {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
			<div className="max-w-md w-full text-center">
				<Image
					src="/assets/downtime.jpg"
					alt="Downtime maintenance illustration"
					width={400}
					height={400}
					className="mx-auto mb-8"
					priority
				/>

				<h1 className="text-4xl font-bold text-gray-900 mb-4">
					Scheduled Downtime
				</h1>

				<p className="text-gray-500 mb-2">
					We&apos;re currently down for maintenance.
				</p>

				<p className="text-gray-500">
					Please check back soon. Thanks for your patience.
				</p>
			</div>
		</div>
	);
};

export default DowntimePage;
