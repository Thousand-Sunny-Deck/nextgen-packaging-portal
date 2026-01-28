"use client";

import { useEffect } from "react";

export function HashScrollHandler() {
	useEffect(() => {
		if (window.location.hash === "#all-invoices") {
			const element = document.getElementById("all-invoices");
			if (element) {
				setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
			}
		}
	}, []);

	return null;
}
