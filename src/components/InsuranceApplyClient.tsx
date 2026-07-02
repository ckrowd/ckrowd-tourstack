"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import HowItWorksModal from "@/components/HowItWorksModal";

type Application = { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null };

interface Props {
	applications: Application[];
	locale: string;
}

function insStatusColor(status: string) {
	switch (status) {
		case "approved": return "bg-emerald-100 text-emerald-800";
		case "declined": return "bg-red-100 text-red-800";
		case "disbursed": return "bg-purple-100 text-purple-800";
		default: return "bg-yellow-100 text-yellow-800";
	}
}

export default function InsuranceApplyClient({ applications, locale }: Props) {
	const t = useTranslations("InsuranceApplyPage");
	const tIns = useTranslations("InsurancePage");
	const faqTitleId = useId();
	const modalTitleId = useId();

	const [faqOpen, setFaqOpen] = useState(false);
	const [faqExpanded, setFaqExpanded] = useState<number | null>(0);
	const [productsOpen, setProductsOpen] = useState(false);

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			{/* Products modal */}
			{productsOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={modalTitleId}
				>
					<button
						type="button"
						aria-label="Close"
						onClick={() => setProductsOpen(false)}
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					/>
					<div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-surface-container-low rounded-2xl shadow-2xl no-scrollbar">
						<div className="sticky top-0 flex items-center justify-between gap-4 bg-surface-container-low p-6 border-b border-outline-variant/10">
							<h2 id={modalTitleId} className="font-(family-name:--font-manrope) text-xl font-semibold text-on-surface">
								{t("productsModalTitle")}
							</h2>
							<button
								type="button"
								onClick={() => setProductsOpen(false)}
								aria-label="Close"
								className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
							{(t.raw("productSuite") as { name: string; tag: string; desc: string }[]).map((suite) => (
								<div
									key={suite.name}
									className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex flex-col gap-3"
								>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF5A30] bg-[#FF5A30]/10 px-2 py-0.5 rounded-full self-start">
										{suite.tag}
									</span>
									<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-sm">
										{suite.name}
									</p>
									<p className="text-xs text-on-surface-variant leading-relaxed flex-1">
										{suite.desc}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* FAQ modal */}
			{faqOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={faqTitleId}
				>
					<button
						type="button"
						aria-label={tIns("faqClose")}
						onClick={() => setFaqOpen(false)}
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					/>
					<div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl no-scrollbar">
						<div className="sticky top-0 flex items-start justify-between gap-4 bg-surface-container-lowest p-6 border-b border-outline-variant/10">
							<h2 id={faqTitleId} className="font-(family-name:--font-manrope) text-xl font-semibold text-on-surface">
								{tIns("faq.title")}
							</h2>
							<button
								type="button"
								onClick={() => setFaqOpen(false)}
								aria-label={tIns("faqClose")}
								className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>
						<div className="p-6 space-y-2">
							{(tIns.raw("faq.items") as { q: string; a: string }[]).map((f, i) => {
								const isExpanded = faqExpanded === i;
								return (
									<div key={f.q} className="rounded-xl border border-outline-variant/10 overflow-hidden">
										<button
											type="button"
											aria-expanded={isExpanded}
											onClick={() => setFaqExpanded(isExpanded ? null : i)}
											className="w-full flex items-center justify-between gap-3 text-left p-4 hover:bg-surface-container-low transition-colors"
										>
											<span className="font-(family-name:--font-manrope) font-semibold text-sm text-on-surface">{f.q}</span>
											<span className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
												expand_more
											</span>
										</button>
										{isExpanded && (
											<p className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">{f.a}</p>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("promoterPortal")}
					</span>
					<h1 className="text-3xl font-semibold font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant font-medium max-w-xl">
						{t("description")}
					</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<button
						type="button"
						onClick={() => setProductsOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
					>
						<span className="material-symbols-outlined text-base text-[#FF5A30]">category</span>
						{t("productsButton")}
					</button>
					<HowItWorksModal
						title={tIns("howItWorksTitle")}
						subtitle={tIns("howItWorksSubtitle")}
						buttonLabel={tIns("howItWorksButton")}
						steps={(tIns.raw("ecosystemFlow") as { label: string; desc: string }[]).map((s, i) => ({
							step: String(i + 1).padStart(2, "0"),
							title: s.label,
							desc: s.desc,
						}))}
					/>
					<button
						type="button"
						onClick={() => setFaqOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
					>
						<span className="material-symbols-outlined text-base text-[#FF5A30]">help</span>
						{tIns("faqButton")}
					</button>
				</div>
			</div>

			{/* Insurance partner */}
			<div className="mb-8">
				<p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
					{t("partnersLabel")}
				</p>
				<div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest w-fit">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/sanlam-allianz.png" alt="Sanlam Allianz" className="h-7 w-auto object-contain" />
					<span className="text-xs font-semibold text-on-surface">Sanlam Allianz</span>
				</div>
			</div>

			{/* Applications list */}
			<div>
				<h2 className="font-(family-name:--font-manrope) text-xl font-semibold text-on-surface mb-5">
					{t("myApplications")}
				</h2>
				{applications.length === 0 ? (
					<div className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-sm">
						<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
							shield
						</span>
						<p className="text-sm font-semibold text-on-surface-variant">
							{t("noApplications")}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{applications.map((app) => {
							const status = String(app.status ?? "pending");
							const color = insStatusColor(status);
							return (
								<div
									key={String(app.id)}
									className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-transparent hover:border-outline-variant/20 transition-all"
								>
									<div className="flex items-start justify-between gap-4 mb-4">
										<div>
											<p className="font-(family-name:--font-manrope) font-semibold text-on-surface">
												{String(app.product ?? t("application"))}
											</p>
											<p className="text-sm text-on-surface-variant mt-0.5">
												{String(app.tour?.artist?.name ?? "")}
											</p>
										</div>
										<span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tight shrink-0 ${color}`}>
											{t(`statuses.${status}`)}
										</span>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="p-3 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-semibold text-on-surface-variant mb-1">
												{t("sumInsured")}
											</p>
											<p className="font-semibold text-on-surface">
												{String(app.currency ?? "USD")}{" "}
												{Number(app.amount_requested).toLocaleString(locale)}
											</p>
										</div>
										<div className="p-3 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-semibold text-on-surface-variant mb-1">
												{t("appliedOn")}
											</p>
											<p className="font-semibold text-on-surface">
												{app.created_at
													? new Date(String(app.created_at)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
													: "—"}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</main>
	);
}
