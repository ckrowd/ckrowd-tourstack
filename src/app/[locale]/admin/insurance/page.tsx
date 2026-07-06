"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
	getInsuranceApplications,
	updateInsuranceApplication,
} from "@/app/actions";
import Loader from "@/components/Loader";

type Application = Record<string, unknown>;

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

function statusClass(status: string) {
	switch (status) {
		case "approved":
			return "bg-emerald-100 text-emerald-800";
		case "rejected":
			return "bg-red-100 text-red-800";
		case "under_review":
			return "bg-blue-100 text-blue-800";
		case "disbursed":
			return "bg-purple-100 text-purple-800";
		default:
			return "bg-yellow-100 text-yellow-800";
	}
}

function tourStatusClass(status: string) {
	switch (status) {
		case "confirmed":
		case "active":
			return "bg-emerald-100 text-emerald-700";
		case "under_review":
			return "bg-blue-100 text-blue-700";
		case "cancelled":
			return "bg-red-100 text-red-700";
		default:
			return "bg-amber-100 text-amber-700";
	}
}

function promoterName(a: Application): string {
	const promoter = a.promoter as Record<string, unknown> | null;
	const user = promoter?.user as Record<string, unknown> | null;
	return String(
		promoter?.company_name ??
			promoter?.contact_person ??
			user?.name ??
			user?.email ??
			"—",
	);
}

function tourLabel(a: Application): string {
	const tour = a.tour as Record<string, unknown> | null;
	const artist = tour?.artist as Record<string, unknown> | null;
	if (!artist) return "—";
	return String(artist.tour_name ?? artist.name ?? "—");
}

export default function AdminInsurancePage() {
	const t = useTranslations("AdminInsurancePage");
	const format = useFormatter();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [decision, setDecision] = useState<ReviewStatus>("under_review");
	const [partnerName, setPartnerName] = useState("");
	const [note, setNote] = useState("");

	const query = useQuery({
		queryKey: ["adminInsurancePlatform"],
		queryFn: () => getInsuranceApplications(),
	});

	const reviewMutation = useMutation({
		mutationFn: (vars: {
			id: string;
			body: Parameters<typeof updateInsuranceApplication>[1];
		}) => updateInsuranceApplication(vars.id, vars.body),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({
					queryKey: ["adminInsurancePlatform"],
				});
				void queryClient.invalidateQueries({
					queryKey: ["insuranceApplications"],
				});
			}
		},
	});

	const applications = useMemo(() => {
		const list = (
			query.data?.success ? (query.data.data ?? []) : []
		) as Application[];
		const term = search.trim().toLowerCase();
		return list.filter((a) => {
			if (filter !== "all" && String(a.status ?? "pending") !== filter)
				return false;
			if (!term) return true;
			return (
				promoterName(a).toLowerCase().includes(term) ||
				tourLabel(a).toLowerCase().includes(term)
			);
		});
	}, [query.data, filter, search]);

	function selectForReview(a: Application) {
		const id = String(a.id);
		setSelectedId(id);
		const cur = String(a.status ?? "pending") as ReviewStatus;
		setDecision(REVIEW_STATUSES.includes(cur) ? cur : "under_review");
		setPartnerName(String(a.partner_name ?? ""));
		setNote(String(a.note ?? ""));
		reviewMutation.reset();
	}

	function submitReview() {
		if (!selectedId) return;
		reviewMutation.mutate({
			id: selectedId,
			body: {
				status: decision,
				partnerName: partnerName.trim() || undefined,
				note: note.trim() || undefined,
			},
		});
	}

	function quickForward(a: Application) {
		const tour = a.tour as Record<string, unknown> | null;
		if (!tour || String(tour.status ?? "") !== "confirmed") return;
		reviewMutation.mutate({ id: String(a.id), body: { status: "approved" } });
	}

	function quickReject(a: Application) {
		reviewMutation.mutate({ id: String(a.id), body: { status: "rejected" } });
	}

	const reviewDone = reviewMutation.data?.success === true;
	const reviewFailed =
		reviewMutation.isSuccess && reviewMutation.data?.success === false;

	return (
		<>
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
				<p className="text-sm text-amber-800 font-medium">
					{t("forwardingNotice")}
				</p>
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
										? "bg-[#FF5A2E] text-white"
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
							onChange={(e) => setSearch(e.target.value)}
							placeholder={t("searchPlaceholder")}
							className="w-full sm:w-64 rounded-xl border border-outline-variant/20 bg-surface-container-low px-9 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
						/>
					</label>
				</div>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<h2 className="text-base font-(family-name:--font-manrope) font-semibold mb-6">
						{t("requestsTitle")}
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
								shield
							</span>
							<p className="text-on-surface-variant font-medium text-sm">
								{t("empty")}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{applications.map((a) => {
								const id = String(a.id);
								const status = String(a.status ?? "pending");
								const tour = a.tour as Record<string, unknown> | null;
								const tourStatus = String(tour?.status ?? "");
								const canForward =
									tour != null && tourStatus === "confirmed";
								const blockReason = !tour
									? t("noTourBlocked")
									: !canForward
										? t("approvalBlocked")
										: "";
								const coverage = `${String(a.currency ?? "USD")} ${Number(a.amount_requested ?? 0).toLocaleString()}`;
								const created = a.created_at
									? format.dateTime(new Date(String(a.created_at)), {
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
														shield
													</span>
												</div>
												<div className="min-w-0">
													<div className="flex items-center gap-2 flex-wrap mb-1">
														<span className="text-xs font-black text-[#FF5A2E] uppercase tracking-widest">
															{`#${id.slice(-6).toUpperCase()}`}
														</span>
														<span
															className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(status)}`}
														>
															{t(`status.${status}`)}
														</span>
														{tour ? (
															<span
																className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-tighter flex items-center gap-1 ${tourStatusClass(tourStatus)}`}
															>
																<span className="material-symbols-outlined text-[10px]">
																	{canForward ? "check_circle" : "pending"}
																</span>
																{t(`tourStatus.${tourStatus || "unknown"}`)}
															</span>
														) : (
															<span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-tighter">
																{t("noTour")}
															</span>
														)}
													</div>
													<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-base">
														{promoterName(a)}
													</h3>
													<p className="text-sm text-on-surface-variant mt-0.5">
														{tourLabel(a)}
													</p>
												</div>
											</div>
											<div className="lg:text-right shrink-0">
												<p className="text-lg font-(family-name:--font-manrope) font-black text-on-surface">
													{coverage}
												</p>
												<p className="text-xs text-on-surface-variant">
													{t("requested")} · {t("requestedOn")} {created}
												</p>
											</div>
										</div>

										{tour ? (
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
													{[
														{
															label: t("tour.venue"),
															value: String(tour.venue ?? "—"),
														},
														{
															label: t("tour.date"),
															value: tour.date
																? format.dateTime(
																		new Date(String(tour.date)),
																		{ dateStyle: "medium" },
																	)
																: "—",
														},
														{
															label: t("tour.location"),
															value: [
																String(tour.city ?? ""),
																String(tour.country ?? ""),
															]
																.filter(Boolean)
																.join(", "),
														},
													].map((d) => (
														<div key={d.label}>
															<p className="text-[10px] uppercase font-semibold text-on-surface-variant">
																{d.label}
															</p>
															<p className="font-semibold text-on-surface truncate">
																{d.value || "—"}
															</p>
														</div>
													))}
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
												onClick={() => selectForReview(a)}
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
														onClick={() => quickForward(a)}
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
														onClick={() => quickReject(a)}
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
										{t("reviewForm.decision")}
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
										{t("reviewForm.partner")}
									</span>
									<input
										type="text"
										value={partnerName}
										onChange={(e) => setPartnerName(e.target.value)}
										placeholder={t("reviewForm.partnerPlaceholder")}
										className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
									/>
								</label>
								<label className="block">
									<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
										{t("reviewForm.note")}
									</span>
									<textarea
										rows={4}
										value={note}
										onChange={(e) => setNote(e.target.value)}
										placeholder={t("reviewForm.notePlaceholder")}
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
								<button
									type="submit"
									disabled={reviewMutation.isPending}
									className="w-full py-3 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-opacity disabled:opacity-60"
								>
									{reviewMutation.isPending
										? t("reviewForm.saving")
										: t("reviewForm.save")}
								</button>
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
