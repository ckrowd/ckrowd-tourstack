"use client";

import { useTranslations } from "next-intl";
import Icon from "@/components/icons";
import { useId, useState } from "react";
import EcosystemReadiness from "@/components/EcosystemReadiness";
import FinancingFaq from "@/components/FinancingFaq";
import HowItWorksModal from "@/components/HowItWorksModal";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import { Link } from "@/i18n/routing";
import type { EcosystemReadiness as Readiness } from "@/lib/eligibility";

type Application = { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null };

const PRODUCT_CARD_KEYS = [
	"tourStopAdvance",
	"venueBuildOutCredit",
	"eventInsuranceBundle",
	"marketingTicketingFloat",
	"creditGuarantee",
	"promoterBusiness",
] as const;

function statusToTone(status: string): StatusTone {
	switch (status) {
		case "approved": return "approved";
		case "declined": return "rejected";
		case "disbursed": return "booked";
		default: return "pending";
	}
}

interface Props {
	applications: Application[];
	locale: string;
	readiness?: Readiness;
}

export default function FinancingApplyClient({ applications, locale, readiness }: Props) {
	const t = useTranslations("FinancingApplyPage");
	const tFin = useTranslations("FinancingPage");
	const modalTitleId = useId();

	const financingFaqs = Object.values(
		tFin.raw("faqs") as Record<string, { q: string; a: string }>,
	);

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
					<div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto bg-surface-container-low rounded-2xl shadow-2xl no-scrollbar">
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
								<Icon name="x" size={18} />
							</button>
						</div>
						<div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{PRODUCT_CARD_KEYS.map((key) => (
								<div
									key={key}
									className="tsd-card p-6 flex flex-col gap-3"
								>
									<span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start">
										{t(`productCards.${key}.tag`)}
									</span>
									<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-base">
										{t(`packages.${key}`)}
									</p>
									<p className="text-sm text-on-surface-variant leading-relaxed flex-1">
										{t(`productCards.${key}.description`)}
									</p>
									<dl className="grid grid-cols-2 gap-2 pt-3 border-t border-outline-variant/15">
										{(["amount", "term", "rate", "eligibility"] as const).map((stat) => (
											<div key={stat}>
												<dt className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
													{t(`productCardLabels.${stat}`)}
												</dt>
												<dd className="text-xs font-semibold text-on-surface mt-0.5">
													{t(`productCards.${key}.${stat}`)}
												</dd>
											</div>
										))}
									</dl>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Header */}
			<div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-primary block mb-2">
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
						data-tour="financing-products"
						onClick={() => setProductsOpen(true)}
						className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
					>
						<Icon name="shapes" size={16} className="text-primary" />
						{t("productsButton")}
					</button>
					<HowItWorksModal
						title={tFin("howItWorksTitle")}
						buttonLabel={tFin("howItWorksButton")}
						steps={[
							{ step: "01", title: tFin("steps.s1.title"), desc: tFin("steps.s1.description") },
							{ step: "02", title: tFin("steps.s2.title"), desc: tFin("steps.s2.description") },
							{ step: "03", title: tFin("steps.s3.title"), desc: tFin("steps.s3.description") },
							{ step: "04", title: tFin("steps.s4.title"), desc: tFin("steps.s4.description") },
							{ step: "05", title: tFin("steps.s5.title"), desc: tFin("steps.s5.description") },
						]}
					/>
					<FinancingFaq faqs={financingFaqs} />
				</div>
			</div>

			{/* Ecosystem readiness gate */}
			{readiness && !readiness.eligible && (
				<div className="mb-8">
					<EcosystemReadiness readiness={readiness} />
				</div>
			)}

			{/* Financing partner */}
			<div className="mb-8">
				<p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
					{t("partnersLabel")}
				</p>
				{/* Partner name/logo withheld until confirmation is received */}
				<div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest w-fit">
					<span className="text-xs font-semibold text-on-surface">Banking Partner</span>
				</div>
			</div>

			{/* Applications list */}
			<div data-tour="financing-apply">
				<h2 className="font-(family-name:--font-manrope) text-xl font-semibold text-on-surface mb-5">
					{t("myApplications")}
				</h2>
				{applications.length === 0 ? (
					<div className="tsd-card p-10 text-center">
						<Icon name="financing" size={36} className="text-on-surface-variant block mb-3" />
						<p className="text-sm font-semibold text-on-surface-variant">
							{t("noApplications")}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{applications.map((app) => {
							const status = String(app.status ?? "pending");
							return (
								<div
									key={String(app.id)}
									className="tsd-card tsd-card-hover p-6"
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
										<StatusBadge tone={statusToTone(status)} dot className="shrink-0">
											{t(`statuses.${status}`)}
										</StatusBadge>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="p-3 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-semibold text-on-surface-variant mb-1">
												{t("requested")}
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
									<div className="mt-4">
										<Link
											href={`/financing/${String(app.id)}`}
											className="text-sm font-semibold text-primary hover:underline"
										>
											{t("viewDetails")}
										</Link>
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
