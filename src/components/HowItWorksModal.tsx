"use client";

import { useEffect, useId, useState } from "react";

type Step = { step: string; title: string; desc: string };

export default function HowItWorksModal({
	title,
	subtitle,
	steps,
	buttonLabel,
	grouped = false,
}: {
	title: string;
	subtitle?: string;
	steps: Step[];
	buttonLabel: string;
	grouped?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const titleId = useId();

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [open]);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`inline-flex items-center gap-2 px-4 py-2.5 text-on-surface text-sm font-semibold transition-colors ${
					grouped
						? "bg-surface-container-lowest hover:bg-surface-container-low"
						: "rounded-xl bg-surface-container-highest hover:bg-surface-container-high"
				}`}
				aria-label={buttonLabel}
			>
				<span className="material-symbols-outlined text-[#FF5A2E]" style={{ fontSize: "18px" }}>
					info
				</span>
				<span>{buttonLabel}</span>
			</button>

			{open && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
				>
					<button
						type="button"
						aria-label="Close"
						onClick={() => setOpen(false)}
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					/>
					<div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl no-scrollbar">
						<div className="sticky top-0 flex items-start justify-between gap-4 bg-surface-container-lowest p-6 border-b border-outline-variant/10">
							<div>
								<h2
									id={titleId}
									className="font-(family-name:--font-manrope) text-xl font-semibold text-on-surface"
								>
									{title}
								</h2>
								{subtitle && (
									<p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>
								)}
							</div>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label="Close"
								className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6">
							<div className="relative pl-8">
								<div className="absolute left-[14px] top-2 bottom-2 w-px bg-outline-variant/30" />
								<div className="space-y-6">
									{steps.map((s, i) => (
										<div key={s.step} className="relative flex gap-4">
											<div
												className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 ${
													i === 0
														? "bg-[#FF5A2E] text-white border-[#FF5A2E]"
														: "bg-surface text-[#FF5A2E] border-[#FF5A2E]/40"
												}`}
											>
												{s.step}
											</div>
											<div>
												<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-sm">
													{s.title}
												</p>
												<p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
													{s.desc}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
