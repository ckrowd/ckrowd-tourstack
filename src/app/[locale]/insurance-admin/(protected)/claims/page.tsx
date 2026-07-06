"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import Loader from "@/components/Loader";
import {
	createInsuranceClaim,
	getInsuranceApplications,
	getInsuranceClaims,
	updateInsuranceClaim,
} from "@/app/actions";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

const CLAIM_STATUSES = [
	"open",
	"under_review",
	"settled",
	"rejected",
] as const;
type ClaimStatus = (typeof CLAIM_STATUSES)[number];

const FILTERS = ["all", ...CLAIM_STATUSES] as const;

function statusClass(status: string) {
	switch (status) {
		case "settled":
			return "text-emerald-700 bg-emerald-50";
		case "rejected":
			return "text-red-700 bg-red-50";
		case "under_review":
			return "text-blue-700 bg-blue-50";
		default:
			return "text-yellow-600 bg-yellow-50";
	}
}

type Claim = Record<string, unknown>;
type Application = Record<string, unknown>;

function promoterName(record: Claim | Application): string {
	const promoter = record.promoter as Record<string, unknown> | null;
	const user = promoter?.user as Record<string, unknown> | null;
	return String(
		promoter?.company_name ??
			promoter?.contact_person ??
			user?.name ??
			user?.email ??
			"—",
	);
}

export default function InsuranceAdminClaimsPage() {
	const t = useTranslations("InsuranceAdminClaimsPage");
	const format = useFormatter();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
	const [showForm, setShowForm] = useState(false);
	const [applicationId, setApplicationId] = useState("");
	const [description, setDescription] = useState("");
	const [amountClaimed, setAmountClaimed] = useState("");
	const [claimNotes, setClaimNotes] = useState("");

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [reviewStatus, setReviewStatus] = useState<ClaimStatus>("under_review");
	const [settlement, setSettlement] = useState("");
	const [reviewNotes, setReviewNotes] = useState("");

	const claimsQuery = useQuery({
		queryKey: ["insuranceClaims"],
		queryFn: () => getInsuranceClaims(),
	});

	const applicationsQuery = useQuery({
		queryKey: ["insuranceApplications"],
		queryFn: () => getInsuranceApplications(),
	});

	const createMutation = useMutation({
		mutationFn: createInsuranceClaim,
		onSuccess: (result) => {
			if (result.success) {
				setApplicationId("");
				setDescription("");
				setAmountClaimed("");
				setClaimNotes("");
				setShowForm(false);
				void queryClient.invalidateQueries({ queryKey: ["insuranceClaims"] });
			}
		},
	});

	const reviewMutation = useMutation({
		mutationFn: (vars: {
			id: string;
			body: Parameters<typeof updateInsuranceClaim>[1];
		}) => updateInsuranceClaim(vars.id, vars.body),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["insuranceClaims"] });
			}
		},
	});

	const applications = (
		applicationsQuery.data?.success ? (applicationsQuery.data.data ?? []) : []
	) as Application[];

	const claims = useMemo(() => {
		const list = (
			claimsQuery.data?.success ? (claimsQuery.data.data ?? []) : []
		) as Claim[];
		if (filter === "all") return list;
		return list.filter((c) => String(c.status ?? "open") === filter);
	}, [claimsQuery.data, filter]);

	function handleCreate(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const amount = Number.parseInt(amountClaimed, 10);
		if (!applicationId || !description.trim() || !Number.isFinite(amount) || amount < 1) {
			return;
		}
		createMutation.mutate({
			applicationId,
			description: description.trim(),
			amountClaimed: amount,
			notes: claimNotes.trim() || undefined,
		});
	}

	function toggleReview(c: Claim) {
		const id = String(c.id);
		if (selectedId === id) {
			setSelectedId(null);
			return;
		}
		setSelectedId(id);
		setReviewStatus((String(c.status ?? "under_review") as ClaimStatus) || "under_review");
		setSettlement(c.settlement_amount != null ? String(c.settlement_amount) : "");
		setReviewNotes(String(c.notes ?? ""));
		reviewMutation.reset();
	}

	function submitReview() {
		if (!selectedId) return;
		const settlementValue = settlement.trim()
			? Number.parseInt(settlement, 10)
			: undefined;
		reviewMutation.mutate({
			id: selectedId,
			body: {
				status: reviewStatus,
				settlementAmount:
					settlementValue != null && Number.isFinite(settlementValue)
						? settlementValue
						: undefined,
				notes: reviewNotes.trim() || undefined,
			},
		});
	}

	const createDone = createMutation.data?.success === true;
	const createFailed =
		createMutation.isSuccess && createMutation.data?.success === false;
	const reviewDone = reviewMutation.data?.success === true;
	const reviewFailed =
		reviewMutation.isSuccess && reviewMutation.data?.success === false;

	return (
		<>
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
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
					onClick={() => setShowForm((v) => !v)}
					className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5A2E] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#FF5A2E]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined text-base">
						{showForm ? "close" : "add"}
					</span>
					{showForm ? t("newClaim.cancel") : t("newClaim.title")}
				</button>
			</div>

			{showForm && (
				<form
					onSubmit={handleCreate}
					className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
				>
					<h3 className="sm:col-span-2 font-(family-name:--font-manrope) font-semibold text-base">
						{t("newClaim.title")}
					</h3>
					{applications.length === 0 ? (
						<p className="sm:col-span-2 text-sm text-on-surface-variant">
							{t("newClaim.noApplications")}
						</p>
					) : (
						<>
							<label className="block sm:col-span-2">
								<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("newClaim.application")}
								</span>
								<select
									required
									value={applicationId}
									onChange={(event) => setApplicationId(event.target.value)}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
								>
									<option value="">{t("newClaim.selectApplication")}</option>
									{applications.map((app) => (
										<option key={String(app.id)} value={String(app.id)}>
											{promoterName(app)} —{" "}
											{`${String(app.currency ?? "USD")} ${Number(
												app.amount_requested ?? 0,
											).toLocaleString()}`}
										</option>
									))}
								</select>
							</label>
							<label className="block sm:col-span-2">
								<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("newClaim.description")}
								</span>
								<input
									type="text"
									required
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									placeholder={t("newClaim.descriptionPlaceholder")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("newClaim.amount")}
								</span>
								<FormattedNumberInput
									required
									value={amountClaimed}
									onChange={(v) => setAmountClaimed(v)}
									placeholder={t("newClaim.amountPlaceholder")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("newClaim.notes")}
								</span>
								<input
									type="text"
									value={claimNotes}
									onChange={(event) => setClaimNotes(event.target.value)}
									placeholder={t("newClaim.notesPlaceholder")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
								/>
							</label>
							<div className="sm:col-span-2 flex items-center justify-between gap-3">
								<div>
									{createDone && (
										<p
											className="text-sm font-medium text-emerald-700"
											role="status"
										>
											{t("newClaim.success")}
										</p>
									)}
									{(createFailed || createMutation.isError) && (
										<p
											className="text-sm font-medium text-red-600"
											role="alert"
										>
											{createMutation.data?.error || t("newClaim.error")}
										</p>
									)}
								</div>
								<button
									type="submit"
									disabled={createMutation.isPending}
									className="px-5 py-2.5 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
								>
									{createMutation.isPending
										? t("newClaim.submitting")
										: t("newClaim.submit")}
								</button>
							</div>
						</>
					)}
				</form>
			)}

			<div className="flex flex-wrap gap-2 mb-6">
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

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
						{t("claimsTitle")}
					</h3>
					<span className="material-symbols-outlined text-[#FF5A2E]">
						assignment_late
					</span>
				</div>

				{claimsQuery.isLoading ? (
					<Loader />
				) : !claimsQuery.data?.success ? (
					<p className="text-sm font-medium text-red-600 py-10 text-center">
						{claimsQuery.data?.error || t("loadError")}
					</p>
				) : claims.length === 0 ? (
					<div className="py-12 text-center">
						<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
							assignment_late
						</span>
						<p className="text-on-surface-variant font-medium text-sm">
							{t("empty")}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{claims.map((claim) => {
							const id = String(claim.id);
							const status = String(claim.status ?? "open");
							const application = claim.application as Record<
								string,
								unknown
							> | null;
							const amount = `${String(claim.currency ?? "USD")} ${Number(
								claim.amount_claimed ?? 0,
							).toLocaleString()}`;
							const created = claim.created_at
								? format.dateTime(new Date(String(claim.created_at)), {
										dateStyle: "medium",
									})
								: "—";
							const expanded = selectedId === id;
							return (
								<div
									key={id}
									className={`border rounded-xl transition-colors ${
										expanded
											? "border-[#FF5A2E]/60"
											: "border-outline-variant/10"
									}`}
								>
									<div className="flex items-center justify-between gap-4 p-4">
										<div className="min-w-0">
											<p className="text-base font-semibold text-on-surface truncate">
												{promoterName(claim)}
											</p>
											<p className="text-sm text-on-surface-variant mt-1 truncate">
												{String(claim.description ?? "—")}
											</p>
											<p className="text-xs text-on-surface-variant mt-0.5">
												{t("applicationRef")}:{" "}
												<span className="font-semibold">
													{application
														? `#${String(application.id).slice(-6).toUpperCase()}`
														: "—"}
												</span>
												{" — "}
												<span className="font-semibold">{amount}</span>
												{" — "}
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
												onClick={() => toggleReview(claim)}
												className="text-xs font-semibold text-[#FF5A2E] hover:underline"
											>
												{expanded ? t("closeReview") : t("reviewClaim")}
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
												<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("review.status")}
												</span>
												<select
													value={reviewStatus}
													onChange={(event) =>
														setReviewStatus(
															event.target.value as ClaimStatus,
														)
													}
													className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
												>
													{CLAIM_STATUSES.map((s) => (
														<option key={s} value={s}>
															{t(`status.${s}`)}
														</option>
													))}
												</select>
											</label>
											<label className="block">
												<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("review.settlement")}
												</span>
												<FormattedNumberInput
													value={settlement}
													onChange={(v) => setSettlement(v)}
													placeholder={t("review.settlementPlaceholder")}
													className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
												/>
											</label>
											<label className="block sm:col-span-2">
												<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
													{t("review.notes")}
												</span>
												<textarea
													rows={3}
													value={reviewNotes}
													onChange={(event) =>
														setReviewNotes(event.target.value)
													}
													placeholder={t("review.notesPlaceholder")}
													className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
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
													className="px-5 py-2.5 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
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
		</>
	);
}
