const ActiveOrderBox = () => {
	return (
		<div className="w-full bg-white rounded-lg p-4 flex flex-row items-center hover:bg-slate-50">
			<div className="flex flex-col gap-1">
				<p className="font-semibold">Order #123</p>
				<p className="text-gray-600">AU$0.01</p>
			</div>
			<div className="ml-auto flex items-center gap-2">
				<span className="w-2 h-2 bg-red-500 rounded-full"></span>
				<span>Order Placed</span>
			</div>
		</div>
	);
};

export default ActiveOrderBox;
