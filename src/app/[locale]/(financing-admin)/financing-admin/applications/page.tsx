"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { getAdminFinancing, getFinancingEois, updateFinancingApplication } from "@/app/actions";
import Loader from "@/components/Loader";

// Fully typed application straight from the server action's response — no
// hand-written shape, so it tracks any backend change automatically.
type Application = NonNullable<
	Awaited<ReturnType<typeof getAdminFinancing>>["data"]
>[number];

const STATUSES = [
	"pending",
	"under_review",
	"approved",
	"rejected",
	"disbursed",
] as const;
type Status = (typeof STATUSES)[number];

const FILTERS = ["all", ...STATUSES] as const;

function statusClass(status: string) {
	switch (status) {
		case "approved":
		case "disbursed":
			return "bg-emerald-100 text-emerald-800";
		case "rejected":
			return "bg-red-100 text-red-800";
		case "under_review":
			return "bg-blue-100 text-blue-800";
		default:
			return "bg-yellow-100 text-yellow-800";
	}
}

function promoterName(f: Application): string {
	const p = f.promoter;
	return (
		p.company_name ?? p.contact_person ?? p.user.name ?? p.user.email ?? "—"
	);
}

function tourLabel(f: Application): string {
	const artist = f.tour?.artist;
	if (!artist) return "—";
	return artist.tour_name ?? artist.name ?? "—";
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
				{label}
			</p>
			<p className="font-semibold text-on-surface truncate">{value || "—"}</p>
		</div>
	);
}

export default function FinancingAdminApplicationsPage() {
	const t = useTranslations("FinancingAdminApplicationsPage");
	const format = useFormatter();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [decision, setDecision] = useState<Status>("under_review");
	const [partnerName, setPartnerName] = useState("");
	const [termSheetUrl, setTermSheetUrl] = useState("");
	const [note, setNote] = useState("");

	const query = useQuery({
		queryKey: ["adminFinancing"],
		queryFn: () => getAdminFinancing(),
	});

	const eoisQuery = useQuery({
		queryKey: ["financingEois"],
		queryFn: getFinancingEois,
	});

	const reviewMutation = useMutation({
		mutationFn: (vars: {
			id: string;
			body: Parameters<typeof updateFinancingApplication>[1];
		}) => updateFinancingApplication(vars.id, vars.body),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["adminFinancing"] });
			}
		},
	});

	const applications = useMemo(() => {
		const list = (
			query.data?.success ? (query.data.data ?? []) : []
		) as Application[];
		const term = search.trim().toLowerCase();
		return list.filter((f) => {
			if (filter !== "all" && String(f.status ?? "pending") !== filter) {
				return false;
			}
			if (!term) return true;
			return (
				promoterName(f).toLowerCase().includes(term) ||
				tourLabel(f).toLowerCase().includes(term)
			);
		});
	}, [query.data, filter, search]);

	const checklist = t.raw("reviewChecklist.items") as string[];

	function selectForReview(f: Application) {
		const id = String(f.id);
		setSelectedId(id);
		setDecision(
			(String(f.status ?? "under_review") as Status) || "under_review",
		);
		setPartnerName(String(f.partner_name ?? ""));
		setTermSheetUrl(String(f.term_sheet_url ?? ""));
		setNote(String(f.note ?? ""));
		reviewMutation.reset();
	}

	function submitReview() {
		if (!selectedId) return;
		reviewMutation.mutate({
			id: selectedId,
			body: {
				status: decision,
				partnerName: partnerName.trim() || undefined,
				termSheetUrl: termSheetUrl.trim() || undefined,
				note: note.trim() || undefined,
			},
		});
	}

	function quickDecision(f: Application, status: Status) {
		reviewMutation.mutate({ id: String(f.id), body: { status } });
	}

	const reviewDone = reviewMutation.data?.success === true;
	const reviewFailed =
		reviewMutation.isSuccess && reviewMutation.data?.success === false;

	return (
		<>
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant text-sm font-medium max-w-3xl">
						{t("description")}
					</p>
				</div>
				<button
					type="button"
					onClick={() => query.refetch()}
					disabled={query.isFetching}
					className="flex items-center gap-2 px-3 py-2 bg-surface-container-high text-on-surface rounded-xl font-(family-name:--font-manrope) text-xs font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-60"
				>
					<span className="material-symbols-outlined text-sm">sync</span>
					{query.isFetching ? t("actions.syncing") : t("actions.sync")}
				</button>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm mb-8">
				<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
					<div className="flex flex-wrap gap-2">
						{FILTERS.map((key) => (
							<button
								key={key}
								type="button"
								aria-pressed={filter === key}
								onClick={() => setFilter(key)}
								className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
									filter === key
										? "bg-[#FF5A30] text-white"
										: "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
								}`}
							>
								{t(`filters.${key}`)}
							</button>
						))}
					</div>
					<label className="relative">
						<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
							search
						</span>
						<input
							type="search"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={t("searchPlaceholder")}
							className="w-full sm:w-64 rounded-xl border border-outline-variant/20 bg-surface-container-low px-9 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
						/>
					</label>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-base font-(family-name:--font-manrope) font-semibold">
							{t("queueTitle")}
						</h2>
					</div>

					{query.isLoading ? (
						<Loader />
					) : !query.data?.success ? (
						<p className="text-sm font-medium text-red-600 py-10 text-center">
							{query.data?.error || t("loadError")}
						</p>
					) : applications.length === 0 ? (
						<div className="py-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
								account_balance_wallet
							</span>
							<p className="text-on-surface-variant font-medium text-sm">
								{t("empty")}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{applications.map((f) => {
								const id = String(f.id);
								const status = String(f.status ?? "pending");
								const documents = Array.isArray(f.documents)
									? (f.documents as unknown[]).length
									: 0;
								const amount = `${String(f.currency ?? "USD")} ${Number(
									f.amount_requested ?? 0,
								).toLocaleString()}`;
								const created = f.created_at
									? format.dateTime(new Date(String(f.created_at)), {
											dateStyle: "medium",
										})
									: "—";
								const isSelected = selectedId === id;
								return (
									<div
										key={id}
										className={`bg-surface-container-low rounded-2xl p-6 border transition-colors ${
											isSelected
												? "border-[#FF5A30]/60"
												: "border-outline-variant/10"
										}`}
									>
										<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
											<div className="flex items-start gap-4 min-w-0">
												<div className="w-12 h-12 rounded-xl shrink-0 bg-surface-container-high flex items-center justify-center">
													<span className="material-symbols-outlined text-on-surface-variant">
														account_balance_wallet
													</span>
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-2 flex-wrap mb-1">
														<span className="text-xs font-black text-[#FF5A30] uppercase tracking-widest">
															{`#${id.slice(-6).toUpperCase()}`}
														</span>
														<span
															className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(status)}`}
														>
															{t(`status.${status}`)}
														</span>
													</div>
													<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-base">
														{promoterName(f)}
													</h3>
													<p className="text-sm text-on-surface-variant mt-0.5">
														{tourLabel(f)}
													</p>
												</div>
											</div>
											<div className="lg:text-right">
												<p className="text-lg font-(family-name:--font-manrope) font-black text-on-surface">
													{amount}
												</p>
												<p className="text-xs text-on-surface-variant">
													{t("requestedOn")} {created}
												</p>
											</div>
										</div>

										<div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
											{[
												{
													icon: "category",
													label: t("fields.product"),
													value: String(f.product ?? "—"),
												},
												{
													icon: "description",
													label: t("fields.documents"),
													value: t("documentsCount", { count: documents }),
												},
												{
													icon: "account_balance",
													label: t("fields.partner"),
													value: String(f.partner_name ?? t("unassigned")),
												},
											].map((detail) => (
												<div
													key={detail.label}
													className="bg-surface-container-lowest rounded-lg p-3"
												>
													<div className="flex items-center gap-1 text-on-surface-variant mb-1">
														<span className="material-symbols-outlined text-xs">
															{detail.icon}
														</span>
														<span className="text-[10px] font-semibold uppercase tracking-wider">
															{detail.label}
														</span>
													</div>
													<p className="text-sm font-semibold text-on-surface truncate">
														{detail.value}
													</p>
												</div>
											))}
										</div>

										{(f.bank_name ??
											f.account_number ??
											f.account_name ??
											f.purpose) != null && (
											<div className="mt-3 rounded-lg bg-surface-container-lowest p-3">
												<div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
													<div className="flex items-center gap-1 text-on-surface-variant">
														<span className="material-symbols-outlined text-xs">
															payments
														</span>
														<span className="text-[10px] font-semibold uppercase tracking-wider">
															{t("fields.banking")}
														</span>
													</div>
													{f.account_name ? (
														<span
															className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${f.account_verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
														>
															{f.account_verified
																? t("banking.verified")
																: t("banking.unverified")}
														</span>
													) : null}
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
													{f.bank_name ? (
														<div>
															<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
																{t("banking.bank")}
															</p>
															<p className="font-semibold text-on-surface truncate">
																{String(f.bank_name)}
															</p>
														</div>
													) : null}
													{f.account_number ? (
														<div>
															<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
																{t("banking.account")}
															</p>
															<p className="font-semibold text-on-surface font-mono">
																****
																{String(f.account_number).slice(-4)}
															</p>
														</div>
													) : null}
													{f.account_name ? (
														<div>
															<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
																{t("banking.holder")}
															</p>
															<p className="font-semibold text-on-surface truncate">
																{String(f.account_name)}
															</p>
														</div>
													) : null}
												</div>
												{f.purpose ? (
													<div className="mt-2 pt-2 border-t border-outline-variant/10">
														<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
															{t("banking.purpose")}
														</p>
														<p className="text-xs text-on-surface mt-0.5">
															{String(f.purpose)}
														</p>
													</div>
												) : null}
											</div>
										)}

										{f.tour ? (
											<div className="mt-3 rounded-lg bg-surface-container-lowest p-3">
												<div className="flex items-center gap-1 text-on-surface-variant mb-2">
													<span className="material-symbols-outlined text-xs">
														tour
													</span>
													<span className="text-[10px] font-semibold uppercase tracking-wider">
														{t("tour.title")}
													</span>
												</div>
												<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
													<Detail
														label={t("tour.venue")}
														value={f.tour.venue}
													/>
													<Detail
														label={t("tour.date")}
														value={format.dateTime(new Date(f.tour.date), {
															dateStyle: "medium",
														})}
													/>
													<Detail
														label={t("tour.location")}
														value={[f.tour.city, f.tour.country]
															.filter(Boolean)
															.join(", ")}
													/>
													<Detail
														label={t("tour.artist")}
														value={f.tour.artist.name}
													/>
													<Detail
														label={t("tour.genre")}
														value={f.tour.artist.genre}
													/>
													<Detail
														label={t("tour.capacity")}
														value={
															f.tour.capacity != null
																? format.number(f.tour.capacity)
																: "—"
														}
													/>
													<Detail
														label={t("tour.ticketsSold")}
														value={format.number(f.tour.tickets_sold)}
													/>
													<Detail
														label={t("tour.fee")}
														value={`${f.currency} ${format.number(f.tour.fee_usd)}`}
													/>
													{f.tour.financing_amount != null ? (
														<Detail
															label={t("tour.financingAmount")}
															value={`${f.currency} ${format.number(f.tour.financing_amount)}`}
														/>
													) : null}
												</div>
											</div>
										) : null}

										<div className="mt-3 rounded-lg bg-surface-container-lowest p-3">
											<div className="flex items-center gap-1 text-on-surface-variant mb-2">
												<span className="material-symbols-outlined text-xs">
													description
												</span>
												<span className="text-[10px] font-semibold uppercase tracking-wider">
													{t("docs.title")}
												</span>
											</div>
											{f.documents.length === 0 && !f.term_sheet_url ? (
												<p className="text-xs text-on-surface-variant">
													{t("docs.none")}
												</p>
											) : (
												<div className="flex flex-wrap gap-2">
													{f.documents.map((url, i) => (
														<a
															key={`${i}-${url}`}
															href={url}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
														>
															<span className="material-symbols-outlined text-xs">
																attach_file
															</span>
															{t("docs.open", { index: i + 1 })}
														</a>
													))}
													{f.term_sheet_url ? (
														<a
															href={f.term_sheet_url}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF5A30]/10 text-xs font-semibold text-[#FF5A30] hover:bg-[#FF5A30]/20 transition-colors"
														>
															<span className="material-symbols-outlined text-xs">
																open_in_new
															</span>
															{t("docs.viewTermSheet")}
														</a>
													) : null}
												</div>
											)}
										</div>

										{f.approved_at || f.note ? (
											<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
												{f.approved_at ? (
													<Detail
														label={t("fields.approvedOn")}
														value={format.dateTime(new Date(f.approved_at), {
															dateStyle: "medium",
														})}
													/>
												) : null}
												{f.note ? (
													<div className="sm:col-span-2">
														<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
															{t("fields.note")}
														</p>
														<p className="text-xs text-on-surface mt-0.5 whitespace-pre-line">
															{f.note}
														</p>
													</div>
												) : null}
											</div>
										) : null}

										<div className="mt-5 flex flex-wrap md:flex-nowrap items-center gap-3 pt-4 border-t border-outline-variant/10">
											<button
												type="button"
												onClick={() => selectForReview(f)}
												className="flex-1 py-2 bg-surface-container-lowest text-on-surface rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
											>
												<span className="material-symbols-outlined text-sm">
													rate_review
												</span>
												{t("actions.review")}
											</button>
											{status !== "approved" && status !== "disbursed" && (
												<button
													type="button"
													onClick={() => quickDecision(f, "approved")}
													disabled={reviewMutation.isPending}
													className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors disabled:opacity-60"
												>
													<span className="material-symbols-outlined text-sm">
														check_circle
													</span>
													{t("actions.approve")}
												</button>
											)}
											{status !== "rejected" && status !== "disbursed" && (
												<button
													type="button"
													onClick={() => quickDecision(f, "rejected")}
													disabled={reviewMutation.isPending}
													className="flex-1 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors disabled:opacity-60"
												>
													<span className="material-symbols-outlined text-sm">
														cancel
													</span>
													{t("actions.reject")}
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className="space-y-6">
					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("reviewForm.title")}
						</h3>
						{!selectedId ? (
							<p className="text-sm text-on-surface-variant py-4">
								{t("reviewForm.selectHint")}
							</p>
						) : (
							<form
								onSubmit={(event) => {
									event.preventDefault();
									submitReview();
								}}
								className="space-y-4"
							>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.fields.decision")}
									</span>
									<select
										value={decision}
										onChange={(event) =>
											setDecision(event.target.value as Status)
										}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									>
										{STATUSES.map((s) => (
											<option key={s} value={s}>
												{t(`status.${s}`)}
											</option>
										))}
									</select>
								</label>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.fields.partner")}
									</span>
									<input
										type="text"
										value={partnerName}
										onChange={(event) => setPartnerName(event.target.value)}
										placeholder={t("reviewForm.placeholders.partner")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</label>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.fields.termSheet")}
									</span>
									<input
										type="url"
										value={termSheetUrl}
										onChange={(event) => setTermSheetUrl(event.target.value)}
										placeholder={t("reviewForm.placeholders.termSheet")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</label>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.fields.note")}
									</span>
									<textarea
										rows={4}
										value={note}
										onChange={(event) => setNote(event.target.value)}
										placeholder={t("reviewForm.placeholders.note")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</label>
								{reviewDone && (
									<p
										className="text-sm font-medium text-emerald-700"
										role="status"
									>
										{t("reviewForm.success")}
									</p>
								)}
								{(reviewFailed || reviewMutation.isError) && (
									<p className="text-sm font-medium text-red-600" role="alert">
										{reviewMutation.data?.error || t("reviewForm.error")}
									</p>
								)}
								<button
									type="submit"
									disabled={reviewMutation.isPending}
									className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-60"
								>
									{reviewMutation.isPending
										? t("reviewForm.saving")
										: t("reviewForm.submit")}
								</button>
							</form>
						)}
					</div>

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("reviewChecklist.title")}
						</h3>
						<div className="space-y-3">
							{checklist.map((item) => (
								<div
									key={item}
									className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl"
								>
									<span className="material-symbols-outlined text-[#FF5A30] text-base mt-0.5">
										rule
									</span>
									<p className="text-sm text-on-surface-variant">{item}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Forwarded EOIs */}
			<div className="mt-10">
				<h2 className="text-lg font-black font-(family-name:--font-manrope) text-on-surface mb-4">
					{t("eois.title")}
				</h2>
				{eoisQuery.isLoading ? (
					<Loader size={36} />
				) : !eoisQuery.data?.success || (eoisQuery.data?.data as unknown[])?.length === 0 ? (
					<div className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-sm">
						<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">inbox</span>
						<p className="text-sm text-on-surface-variant font-medium">{t("eois.empty")}</p>
					</div>
				) : (
					<div className="space-y-4">
						{(eoisQuery.data?.data as Record<string, unknown>[]).map((eoi) => {
							const eoiId = String(eoi.id);
							const promoter = eoi.promoter as Record<string, unknown> | null;
							const artist = eoi.artist as Record<string, unknown> | null;
							const forwardedAt = eoi.forwarded_at != null
								? format.dateTime(new Date(String(eoi.forwarded_at)), { dateStyle: "medium" })
								: "—";
							return (
								<div key={eoiId} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<p className="text-xs font-black text-[#FF5A30] uppercase tracking-widest mb-0.5">
											{`EOI-${eoiId.slice(-6).toUpperCase()}`}
										</p>
										<p className="font-(family-name:--font-manrope) font-semibold text-on-surface">
											{String(artist?.name ?? "—")}
											<span className="text-on-surface-variant font-normal text-sm ml-1">— {String(artist?.tour_name ?? "")}</span>
										</p>
										<p className="text-sm text-on-surface-variant mt-0.5">
											{String(promoter?.company_name ?? promoter?.contact_person ?? "—")} · {String(eoi.city ?? "—")}
										</p>
										<p className="text-xs text-on-surface-variant mt-1">
											{t("eois.forwardedOn")} {forwardedAt}
										</p>
									</div>
									<a
										href={`/api/eoi-pdf/${encodeURIComponent(eoiId)}?portal=finance`}
										target="_blank"
										rel="noopener noreferrer"
										className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors"
									>
										<span className="material-symbols-outlined text-sm">download</span>
										{t("eois.downloadPdf")}
									</a>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
