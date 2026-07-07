"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { getAdminFinancing, updateFinancingApplication } from "@/app/actions";
import Loader from "@/components/Loader";
import Button from "@/components/ui/Button";
import PageTour from "@/components/PageTour";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";

type Application = NonNullable<
	Awaited<ReturnType<typeof getAdminFinancing>>["data"]
>[number];

const REVIEW_STATUSES = ["under_review", "approved", "rejected"] as const;
type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const FILTERS = [
	"all",
	"pending",
	"under_review",
	"approved",
	"rejected",
	"disbursed",
] as const;

function statusToTone(status: string): StatusTone {
	switch (status) {
		case "approved":
			return "approved";
		case "rejected":
			return "rejected";
		case "under_review":
			return "contacted";
		case "disbursed":
			return "booked";
		default:
			return "pending";
	}
}

function tourStatusToTone(status: string): StatusTone {
	switch (status) {
		case "confirmed":
		case "active":
			return "approved";
		case "under_review":
			return "contacted";
		case "cancelled":
			return "rejected";
		default:
			return "pending";
	}
}

function promoterName(f: Application): string {
	const p = f.promoter;
	return p.company_name ?? p.contact_person ?? p.user.name ?? p.user.email ?? "—";
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

export default function AdminFinancingPage() {
	const t = useTranslations("AdminFinancingPage");
	const format = useFormatter();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [decision, setDecision] = useState<ReviewStatus>("under_review");
	const [partnerName, setPartnerName] = useState("");
	const [termSheetUrl, setTermSheetUrl] = useState("");
	const [note, setNote] = useState("");

	const query = useQuery({
		queryKey: ["adminFinancingPlatform"],
		queryFn: () => getAdminFinancing(),
	});

	const reviewMutation = useMutation({
		mutationFn: (vars: {
			id: string;
			body: Parameters<typeof updateFinancingApplication>[1];
		}) => updateFinancingApplication(vars.id, vars.body),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({
					queryKey: ["adminFinancingPlatform"],
				});
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
			if (filter !== "all" && String(f.status ?? "pending") !== filter)
				return false;
			if (!term) return true;
			return (
				promoterName(f).toLowerCase().includes(term) ||
				tourLabel(f).toLowerCase().includes(term)
			);
		});
	}, [query.data, filter, search]);

	function selectForReview(f: Application) {
		const id = String(f.id);
		setSelectedId(id);
		const cur = String(f.status ?? "pending") as ReviewStatus;
		setDecision(REVIEW_STATUSES.includes(cur) ? cur : "under_review");
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

	function quickForward(f: Application) {
		if (String(f.tour?.status ?? "") !== "confirmed") return;
		reviewMutation.mutate({ id: String(f.id), body: { status: "approved" } });
	}

	function quickReject(f: Application) {
		reviewMutation.mutate({ id: String(f.id), body: { status: "rejected" } });
	}

	const reviewDone = reviewMutation.data?.success === true;
	const reviewFailed =
		reviewMutation.isSuccess && reviewMutation.data?.success === false;

	return (
		<>
			<PageTour pageId="admin-financing" />
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
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
					className="flex items-center gap-2 px-3 py-2 bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-60"
				>
					<span className="material-symbols-outlined text-sm">sync</span>
					{query.isFetching ? t("syncing") : t("sync")}
				</button>
			</div>

			<div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
				<span className="material-symbols-outlined text-amber-600 text-base mt-0.5 shrink-0">
					info
				</span>
				<p className="text-sm text-amber-800 font-medium">{t("forwardingNotice")}</p>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm mb-8">
				<div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
					<div className="flex flex-wrap gap-2">
						{FILTERS.map((key) => (
							<Button
								key={key}
								type="button"
								variant={filter === key ? "primary" : "secondary"}
								aria-pressed={filter === key}
								onClick={() => setFilter(key)}
								className="text-xs font-black uppercase tracking-wider"
							>
								{t(`filters.${key}`)}
							</Button>
						))}
					</div>
					<label className="relative">
						<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
							search
						</span>
						<input
							type="search"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder={t("searchPlaceholder")}
							className="w-full sm:w-64 rounded-xl border border-outline-variant/20 bg-surface-container-low px-9 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
						/>
					</label>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-8">
				<div data-tour="admin-financing-list" className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<h2 className="text-base font-(family-name:--font-manrope) font-semibold mb-6">
						{t("queueTitle")}
					</h2>

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
								const tourStatus = String(f.tour?.status ?? "");
								const canForward =
									f.tour != null && tourStatus === "confirmed";
								const blockReason = !f.tour
									? t("noTourBlocked")
									: !canForward
										? t("approvalBlocked")
										: "";
								const amount = `${String(f.currency ?? "USD")} ${Number(f.amount_requested ?? 0).toLocaleString()}`;
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
												? "border-[#FF5A2E]/60"
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
														<span className="text-xs font-black text-[#FF5A2E] uppercase tracking-widest">
															{`#${id.slice(-6).toUpperCase()}`}
														</span>
														<StatusBadge tone={statusToTone(status)}>
															{t(`status.${status}`)}
														</StatusBadge>
														{f.tour ? (
															<StatusBadge tone={tourStatusToTone(tourStatus)}>
																<span className="material-symbols-outlined text-[10px]">
																	{canForward ? "check_circle" : "pending"}
																</span>
																{t(`tourStatus.${tourStatus || "unknown"}`)}
															</StatusBadge>
														) : (
															<StatusBadge tone="neutral">{t("noTour")}</StatusBadge>
														)}
													</div>
													<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-base">
														{promoterName(f)}
													</h3>
													<p className="text-sm text-on-surface-variant mt-0.5">
														{tourLabel(f)}
													</p>
												</div>
											</div>
											<div className="lg:text-right shrink-0">
												<p className="text-lg font-(family-name:--font-manrope) font-black text-on-surface">
													{amount}
												</p>
												<p className="text-xs text-on-surface-variant">
													{t("requestedOn")}{" "}
													{created}
												</p>
											</div>
										</div>

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
														value={format.dateTime(
															new Date(f.tour.date),
															{ dateStyle: "medium" },
														)}
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
												</div>
											</div>
										) : null}

										{blockReason &&
										status !== "approved" &&
										status !== "rejected" &&
										status !== "disbursed" ? (
											<div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
												<span className="material-symbols-outlined text-amber-600 text-sm shrink-0">
													lock
												</span>
												<p className="text-xs text-amber-800 font-medium">
													{blockReason}
												</p>
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
											{status !== "approved" &&
												status !== "rejected" &&
												status !== "disbursed" && (
													<button
														type="button"
														onClick={() => quickForward(f)}
														disabled={
															!canForward || reviewMutation.isPending
														}
														title={blockReason}
														className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:cursor-not-allowed ${
															canForward
																? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
																: "bg-slate-100 text-slate-400 opacity-60"
														}`}
													>
														<span className="material-symbols-outlined text-sm">
															forward
														</span>
														{t("actions.forward")}
													</button>
												)}
											{status !== "rejected" &&
												status !== "disbursed" && (
													<button
														type="button"
														onClick={() => quickReject(f)}
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
								onSubmit={(e) => {
									e.preventDefault();
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
										onChange={(e) =>
											setDecision(e.target.value as ReviewStatus)
										}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
									>
										{REVIEW_STATUSES.map((s) => (
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
										onChange={(e) => setPartnerName(e.target.value)}
										placeholder={t("reviewForm.placeholders.partner")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
									/>
								</label>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.fields.termSheet")}
									</span>
									<input
										type="url"
										value={termSheetUrl}
										onChange={(e) => setTermSheetUrl(e.target.value)}
										placeholder={t("reviewForm.placeholders.termSheet")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
									/>
								</label>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.fields.note")}
									</span>
									<textarea
										rows={4}
										value={note}
										onChange={(e) => setNote(e.target.value)}
										placeholder={t("reviewForm.placeholders.note")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
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
									<p
										className="text-sm font-medium text-red-600"
										role="alert"
									>
										{reviewMutation.data?.error || t("reviewForm.error")}
									</p>
								)}
								<Button type="submit" disabled={reviewMutation.isPending} className="w-full shadow-lg shadow-primary/20">
									{reviewMutation.isPending
										? t("reviewForm.saving")
										: t("reviewForm.submit")}
								</Button>
							</form>
						)}
					</div>

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("reviewChecklist.title")}
						</h3>
						<div className="space-y-3">
							{(t.raw("reviewChecklist.items") as string[]).map((item) => (
								<div
									key={item}
									className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl"
								>
									<span className="material-symbols-outlined text-[#FF5A2E] text-base mt-0.5">
										rule
									</span>
									<p className="text-sm text-on-surface-variant">{item}</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
