export default function Home() {
	const a = [1, 2, 2, 3, 4]
		.map((x) => x * 3)
		.filter((x) => x % 2 === 0)
		.reduce((x) => x++);

	const b: any = {};
	return (
		<div>
			{a} {b}
		</div>
	);
}
