"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";

type Faq = { q: string; a: string };

/**
 * FAQ as an on-demand help panel: a question/help control that opens a modal
 * listing every question, each expandable to reveal its answer.
 */
export default function FinancingFaq({ faqs }: { faqs: Faq[] }) {
	const t = useTranslations("FinancingPage");
	const [open, setOpen] = useState(false);
	const [expanded, setExpanded] = useState<number | null>(0);
	const titleId = useId();

	// Close on Escape and lock background scroll while the modal is open.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [open]);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
			>
				<span className="material-symbols-outlined text-base text-[#FF5A2E]">
					help
				</span>
				{t("faqButton")}
			</button>

			{open && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={titleId}
				>
					{/* Backdrop */}
					<button
						type="button"
						aria-label={t("faqClose")}
						onClick={() => setOpen(false)}
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					/>

					{/* Panel */}
					<div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl no-scrollbar">
						<div className="sticky top-0 flex items-start justify-between gap-4 bg-surface-container-lowest p-6 border-b border-outline-variant/10">
							<div>
								<h2
									id={titleId}
									className="font-(family-name:--font-manrope) text-xl font-semibold text-on-surface"
								>
									{t("faqTitle")}
								</h2>
								<p className="text-sm text-on-surface-variant mt-1">
									{t("faqSubtitle")}
								</p>
							</div>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label={t("faqClose")}
								className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="p-6 space-y-2">
							{faqs.map((f, i) => {
								const isOpen = expanded === i;
								return (
									<div
										key={f.q}
										className="rounded-xl border border-outline-variant/10 overflow-hidden"
									>
										<button
											type="button"
											aria-expanded={isOpen}
											onClick={() => setExpanded(isOpen ? null : i)}
											className="w-full flex items-center justify-between gap-3 text-left p-4 hover:bg-surface-container-low transition-colors"
										>
											<span className="font-(family-name:--font-manrope) font-semibold text-sm text-on-surface">
												{f.q}
											</span>
											<span
												className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform ${
													isOpen ? "rotate-180" : ""
												}`}
											>
												expand_more
											</span>
										</button>
										{isOpen && (
											<p className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">
												{f.a}
											</p>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
