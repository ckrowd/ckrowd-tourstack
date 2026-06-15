"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { applyForFinancing } from "@/app/actions";
import HowItWorksModal from "@/components/HowItWorksModal";

type Tour = { id: string; name?: string | null; city?: string | null; artist?: { name?: string | null } | null };
type Application = { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null };

const INSURANCE_PRODUCTS: { id: Parameters<typeof applyForFinancing>[0]["product"]; labelKey: string; icon: string }[] = [
	{ id: "Event Cancellation", labelKey: "eventCancellation", icon: "event_busy" },
	{ id: "Event Insurance Bundle", labelKey: "eventInsuranceBundle", icon: "shield" },
	{ id: "Touring Workforce", labelKey: "touringWorkforce", icon: "engineering" },
	{ id: "Aviation & Equipment", labelKey: "aviationEquipment", icon: "flight" },
	{ id: "Audience Ticket Protection", labelKey: "audienceTicketProtection", icon: "confirmation_number" },
];

interface Props {
	tours: Tour[];
	applications: Application[];
	locale: string;
}

export default function InsuranceApplyClient({ tours, applications, locale }: Props) {
	const t = useTranslations("InsuranceApplyPage");
	const tIns = useTranslations("InsurancePage");
	const queryClient = useQueryClient();
	const faqTitleId = useId();

	const [tourId, setTourId] = useState<string>("");
	const [product, setProduct] = useState<Parameters<typeof applyForFinancing>[0]["product"]>(INSURANCE_PRODUCTS[0].id);
	const [amount, setAmount] = useState("");
	const [faqOpen, setFaqOpen] = useState(false);
	const [faqExpanded, setFaqExpanded] = useState<number | null>(0);

	const applyMutation = useMutation({
		mutationFn: applyForFinancing,
		onSuccess: (result) => {
			if (result.success) {
				setAmount("");
				setTourId("");
				void queryClient.invalidateQueries({ queryKey: ["financingApplications"] });
			}
		},
	});

	const errorMessage = applyMutation.data && !applyMutation.data.success
		? (applyMutation.data.error ?? t("errors.failed"))
		: applyMutation.error
			? t("errors.failed")
			: null;

	const selectClass = "w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none";
	const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant";

	return (
		<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
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
				<div className="flex items-center gap-2 shrink-0">
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

			{/* Product showcase */}
			<div className="mb-10">
				<h2 className="font-(family-name:--font-manrope) font-semibold text-xl text-on-surface mb-5">
					{t("productsTitle")}
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{(t.raw("productSuite") as { name: string; tag: string; desc: string }[]).map((product) => (
						<div
							key={product.name}
							className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex flex-col gap-3"
						>
							<span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF5A30] bg-[#FF5A30]/10 px-2 py-0.5 rounded-full self-start">
								{product.tag}
							</span>
							<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-sm">
								{product.name}
							</p>
							<p className="text-xs text-on-surface-variant leading-relaxed flex-1">
								{product.desc}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* Apply form */}
			<div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm mb-10">
				<h2 className="font-(family-name:--font-manrope) font-semibold text-xl text-on-surface mb-6">
					{t("applyTitle")}
				</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const parsedAmount = Number(amount);
						if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
						applyMutation.mutate({
							product,
							amountRequested: parsedAmount,
							currency: "USD",
							...(tourId ? { tourId } : {}),
						});
					}}
					className="space-y-6"
				>
					{/* Choose tour */}
					<div>
						<label htmlFor="ins-tour" className={labelClass}>
							{t("fields.tour")}
						</label>
						<div className="relative">
							<select
								id="ins-tour"
								value={tourId}
								onChange={(e) => setTourId(e.target.value)}
								className={selectClass}
							>
								<option value="">{t("fields.tourNone")}</option>
								{tours.map((tour) => (
									<option key={tour.id} value={tour.id}>
										{tour.artist?.name ?? t("fields.unknownArtist")}
										{tour.city ? ` — ${tour.city}` : ""}
									</option>
								))}
							</select>
							<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								expand_more
							</span>
						</div>
						{tours.length === 0 && (
							<p className="mt-2 flex items-center gap-1.5 text-xs text-on-surface-variant/70">
								<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
								{t("fields.tourHint")}
							</p>
						)}
					</div>

					{/* Choose package */}
					<div>
						<p className={labelClass}>{t("fields.package")}</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{INSURANCE_PRODUCTS.map((p) => (
								<div key={p.id} className="relative group">
									<button
										type="button"
										role="radio"
										aria-checked={product === p.id}
										onClick={() => setProduct(p.id)}
										className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
											product === p.id
												? "border-[#FF5A30] bg-[#FF5A30]/5"
												: "border-outline-variant/20 hover:border-outline-variant/50"
										}`}
									>
										<span
											className={`material-symbols-outlined text-xl shrink-0 ${product === p.id ? "text-[#FF5A30]" : "text-on-surface-variant"}`}
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{p.icon}
										</span>
										<span className={`text-sm font-semibold font-(family-name:--font-manrope) ${product === p.id ? "text-[#FF5A30]" : "text-on-surface"}`}>
											{t(`packages.${p.labelKey}`)}
										</span>
									</button>
									<div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl bg-gray-900 px-3 py-2.5 text-center text-xs leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 z-50">
										{t(`packageDescriptions.${p.labelKey}`)}
										<div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Sum insured */}
					<div className="max-w-xs">
						<label htmlFor="ins-amount" className={labelClass}>
							{t("fields.sumInsured")}
						</label>
						<div className="flex items-center gap-2">
							<span className="text-sm font-semibold text-on-surface-variant w-10 shrink-0 text-center">
								USD
							</span>
							<input
								id="ins-amount"
								type="number"
								min={1}
								required
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0"
								className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
					</div>

					{errorMessage && (
						<p className="text-sm text-rose-700 font-medium">{errorMessage}</p>
					)}
					{applyMutation.data?.success && (
						<p className="text-sm text-emerald-700 font-medium">{t("success")}</p>
					)}

					<button
						type="submit"
						disabled={applyMutation.isPending}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{applyMutation.isPending ? t("actions.submitting") : t("actions.submit")}
					</button>
				</form>
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
							const statusColor =
								status === "approved"
									? "bg-emerald-100 text-emerald-800"
									: status === "declined"
										? "bg-red-100 text-red-800"
										: "bg-yellow-100 text-yellow-800";
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
										<span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tight shrink-0 ${statusColor}`}>
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
