"use client";

import { useState } from "react";

type FaqProps = {
	items: { q: string; a: string }[];
};

/** Single-open accordion. Pure client interactivity, keyboard accessible. */
export default function Faq({ items }: FaqProps) {
	const [open, setOpen] = useState(0);

	return (
		<div className="flex flex-col">
			{items.map((item, i) => {
				const isOpen = i === open;
				return (
					<div key={item.q} className="border-b border-white/10">
						<button
							type="button"
							onClick={() => setOpen(isOpen ? -1 : i)}
							aria-expanded={isOpen}
							className="flex w-full items-center justify-between gap-5 py-6 text-left"
						>
							<span className="text-lg font-semibold text-white">{item.q}</span>
							<span
								className="material-symbols-outlined text-[#FF5A30] shrink-0 transition-transform duration-300"
								style={{ transform: isOpen ? "rotate(45deg)" : "none" }}
							>
								add
							</span>
						</button>
						<div
							className="overflow-hidden transition-[max-height] duration-[400ms] ease-out"
							style={{ maxHeight: isOpen ? 240 : 0 }}
						>
							<p className="pb-6 text-[15px] leading-relaxed text-slate-400 max-w-[54ch]">
								{item.a}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
