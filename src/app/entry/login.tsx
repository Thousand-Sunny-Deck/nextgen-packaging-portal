export default function LoginPage() {
	return (
		<>
			<div className="flex flex-row h-screen w-screen">
				<div className="relative h-screen w-3/5">
					<img
						src="/login.jpg"
						alt="Logo"
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-black opacity-60"></div>
					<h1 className="absolute top-10 left-10 text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
						NEXTGEN
					</h1>
					<h1 className="absolute top-28 left-10 text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
						PACKAGING
					</h1>
				</div>
				<div className="flex flex-col items-center justify-center h-screen w-2/5">
					<h1 className="text-4xl font-bold mb-14">LOG IN</h1>
					<form className="flex flex-col space-y-4 w-1/2 max-w-sm">
						<input
							type="email"
							placeholder="Email"
							className="p-3 border border-gray-300 rounded-md h-10"
						/>
						<input
							type="password"
							placeholder="Password"
							className="p-3 border border-gray-300 rounded-md h-10"
						/>
						<a
							href="#"
							className="text-sm text-gray-500 hover:text-gray-700 underline self-end"
						>
							Sign up
						</a>
						<button
							type="submit"
							className="mt-0 p-1 bg-black text-white rounded-md hover:bg-blue-700 w-1/2 mx-auto h-10 hover:cursor-pointer"
						>
							Login
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
