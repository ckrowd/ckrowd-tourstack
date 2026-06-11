"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
	getInsuranceApplications,
	getInsuranceEois,
	updateInsuranceApplication,
} from "@/app/actions";
import Loader from "@/components/Loader";

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
			return "text-emerald-700 bg-emerald-50";
		case "rejected":
			return "text-red-700 bg-red-50";
		case "under_review":
			return "text-blue-700 bg-blue-50";
		default:
			return "text-yellow-600 bg-yellow-50";
	}
}

type Application = Record<string, unknown>;

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

export default function InsuranceAdminApplicationsPage() {
	const t = useTranslations("InsuranceAdminApplicationsPage");
	const format = useFormatter();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [decision, setDecision] = useState<Status>("under_review");
	const [partnerName, setPartnerName] = useState("");
	const [note, setNote] = useState("");

	const query = useQuery({
		queryKey: ["insuranceApplications"],
		queryFn: () => getInsuranceApplications(),
	});

	const eoisQuery = useQuery({
		queryKey: ["insuranceEois"],
		queryFn: getInsuranceEois,
	});

	const reviewMutation = useMutation({
		mutationFn: (vars: {
			id: string;
			body: Parameters<typeof updateInsuranceApplication>[1];
		}) => updateInsuranceApplication(vars.id, vars.body),
		onSuccess: (result) => {
			if (result.success) {
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
		if (filter === "all") return list;
		return list.filter((a) => String(a.status ?? "pending") === filter);
	}, [query.data, filter]);

	function toggleReview(a: Application) {
		const id = String(a.id);
		if (selectedId === id) {
			setSelectedId(null);
			return;
		}
		setSelectedId(id);
		setDecision(
			(String(a.status ?? "under_review") as Status) || "under_review",
		);
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

	const reviewDone = reviewMutation.data?.success === true;
	const reviewFailed =
		reviewMutation.isSuccess && reviewMutation.data?.success === false;

	return (
		<>
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant font-medium">
						{t("description")}
					</p>
				</div>
				<button
					type="button"
					onClick={() => query.refetch()}
					disabled={query.isFetching}
					className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high text-on-surface rounded-xl text-sm font-bold hover:bg-surface-container-highest transition-colors disabled:opacity-60 shrink-0"
				>
					<span className="material-symbols-outlined text-sm">sync</span>
					{query.isFetching ? t("refreshing") : t("refresh")}
				</button>
			</div>

			<div className="flex flex-wrap gap-2 mb-6">
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

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
						{t("requestsTitle")}
					</h3>
					<span className="material-symbols-outlined text-[#FF5A30]">
						shield
					</span>
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
							shield
						</span>
						<p className="text-on-surface-variant font-medium text-sm">
							{t("empty")}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{applications.map((app) => {
							const id = String(app.id);
							const status = String(app.status ?? "pending");
							const coverage = `${String(app.currency ?? "USD")} ${Number(
								app.amount_requested ?? 0,
							).toLocaleString()}`;
							const created = app.created_at
								? format.dateTime(new Date(String(app.created_at)), {
										dateStyle: "medium",
									})
								: "—";
							const expanded = selectedId === id;
							return (
								<div
									key={id}
									className={`border rounded-xl transition-colors ${
										expanded
											? "border-[#FF5A30]/60"
											: "border-outline-variant/10"
									}`}
								>
									<div className="flex items-center justify-between gap-4 p-4">
										<div className="min-w-0">
											<p className="text-base font-bold text-on-surface truncate">
												{promoterName(app)}
											</p>
											<p className="text-sm text-on-surface-variant mt-1">
												{tourLabel(app)} —{" "}
												<span className="font-semibold">
													{coverage} {t("requested")}
												</span>
											</p>
											<p className="text-xs text-on-surface-variant mt-0.5">
												{created}
											</p>
										</div>
										<div className="flex flex-col items-end gap-2 shrink-0">
											<span
												className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(status)}`}
											>
												{t(`status.${status}`)}
											</span>
											<button
												type="button"
												onClick={() => toggleReview(app)}
												className="text-xs font-bold text-[#FF5A30] hover:underline"
											>
												{expanded ? t("closeReview") : t("reviewDetails")}
											</button>
										</div>
									</div>

									{expanded && (
										<form
											onSubmit={(event) => {
												event.preventDefault();
												submitReview();
											}}
											className="border-t border-outline-variant/10 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
										>
											<label className="block">
												<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("review.decision")}
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
												<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("review.partner")}
												</span>
												<input
													type="text"
													value={partnerName}
													onChange={(event) =>
														setPartnerName(event.target.value)
													}
													placeholder={t("review.partnerPlaceholder")}
													className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
												/>
											</label>
											<label className="block sm:col-span-2">
												<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("review.note")}
												</span>
												<textarea
													rows={3}
													value={note}
													onChange={(event) => setNote(event.target.value)}
													placeholder={t("review.notePlaceholder")}
													className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
												/>
											</label>
											<div className="sm:col-span-2 flex items-center justify-between gap-3">
												<div>
													{reviewDone && (
														<p
															className="text-sm font-medium text-emerald-700"
															role="status"
														>
															{t("review.success")}
														</p>
													)}
													{(reviewFailed || reviewMutation.isError) && (
														<p
															className="text-sm font-medium text-red-600"
															role="alert"
														>
															{reviewMutation.data?.error ||
																t("review.error")}
														</p>
													)}
												</div>
												<button
													type="submit"
													disabled={reviewMutation.isPending}
													className="px-5 py-2.5 bg-[#FF5A30] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
												>
													{reviewMutation.isPending
														? t("review.saving")
														: t("review.save")}
												</button>
											</div>
										</form>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Forwarded EOIs */}
			<div className="mt-10">
				<h2 className="text-lg font-black font-(family-name:--font-manrope) text-on-surface mb-4">
					{t("eois.title")}
				</h2>
				{eoisQuery.isLoading ? (
					<p className="text-sm text-on-surface-variant">{t("eois.loading")}</p>
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
										<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
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
										href={`/api/eoi-pdf/${encodeURIComponent(eoiId)}?portal=insurance`}
										target="_blank"
										rel="noopener noreferrer"
										className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-100 transition-colors"
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
