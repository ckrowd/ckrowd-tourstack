"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import {
	getFinancingEois,
	updateFinancingEoi,
} from "@/app/actions";
import EoiPdfViewer from "@/components/EoiPdfViewer";
import Loader from "@/components/Loader";

interface AdminProfile {
	orgName: string;
	contactPerson: string;
	role: string;
	adminSignature: string | null;
}

export default function FinancingAdminApplicationsPage() {
	const t = useTranslations("FinancingAdminApplicationsPage");
	const format = useFormatter();
	const queryClient = useQueryClient();

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [partnerName, setPartnerName] = useState("");
	const [termSheetUrl, setTermSheetUrl] = useState("");
	const [note, setNote] = useState("");
	const [contactPerson, setContactPerson] = useState("");
	const [adminProfile] = useState<AdminProfile>(() => {
		if (typeof window === "undefined") return { orgName: "", contactPerson: "", role: "", adminSignature: null };
		try {
			const raw = localStorage.getItem("fin_admin_profile");
			if (raw) return { ...{ orgName: "", contactPerson: "", role: "", adminSignature: null }, ...(JSON.parse(raw) as Partial<AdminProfile>) };
		} catch {}
		return { orgName: "", contactPerson: "", role: "", adminSignature: null };
	});
	const [ceoSig] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("platform_admin_ceo_signature");
	});
	const [pdfViewerEoiId, setPdfViewerEoiId] = useState<string | null>(null);

	const eoisQuery = useQuery({
		queryKey: ["financingEois"],
		queryFn: getFinancingEois,
	});

	const reviewMutation = useMutation({
		mutationFn: (vars: { id: string; body: Parameters<typeof updateFinancingEoi>[1] }) =>
			updateFinancingEoi(vars.id, vars.body),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["financingEois"] });
			}
		},
	});

	function toggleReview(eoi: Record<string, unknown>) {
		const id = String(eoi.id);
		if (selectedId === id) {
			setSelectedId(null);
			return;
		}
		setSelectedId(id);
		setPartnerName(String(eoi.partner_name ?? adminProfile.orgName ?? ""));
		setTermSheetUrl(String(eoi.term_sheet_url ?? ""));
		setNote(String(eoi.note ?? ""));
		setContactPerson(adminProfile.contactPerson ?? "");
		reviewMutation.reset();
	}

	function submitDisburse() {
		if (!selectedId) return;
		reviewMutation.mutate({
			id: selectedId,
			body: {
				finance_status: "disbursed",
				partner_name: partnerName.trim() || undefined,
				term_sheet_url: termSheetUrl.trim() || undefined,
				note: note.trim() || undefined,
			},
		});
	}

	const reviewDone = reviewMutation.data?.success === true;
	const reviewFailed = reviewMutation.isSuccess && reviewMutation.data?.success === false;

	const orgName = adminProfile.orgName || adminProfile.contactPerson;
	const orgInitials = orgName
		? orgName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
		: null;

	const eois = (eoisQuery.data?.data as Record<string, unknown>[] | null) ?? [];

	return (
		<>
			{pdfViewerEoiId && (
				<EoiPdfViewer
					eoiId={pdfViewerEoiId}
					portal="finance"
					adminSignature={adminProfile.adminSignature}
					ceoSignature={ceoSig}
					onClose={() => setPdfViewerEoiId(null)}
				/>
			)}

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
					{orgInitials && (
						<div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-high">
							<div className="w-6 h-6 rounded-lg bg-[#FF5A30]/15 flex items-center justify-center">
								<span className="text-[9px] font-black text-[#FF5A30]">{orgInitials}</span>
							</div>
							<span className="text-xs font-semibold text-on-surface">{orgName}</span>
							{adminProfile.role && (
								<span className="text-[10px] text-on-surface-variant">· {adminProfile.role}</span>
							)}
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={() => eoisQuery.refetch()}
					disabled={eoisQuery.isFetching}
					className="flex items-center gap-2 px-3 py-2 bg-surface-container-high text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-highest transition-colors disabled:opacity-60"
				>
					<span className="material-symbols-outlined text-sm">sync</span>
					{eoisQuery.isFetching ? t("actions.syncing") : t("actions.sync")}
				</button>
			</div>

			{eoisQuery.isLoading ? (
				<Loader />
			) : !eoisQuery.data?.success ? (
				<p className="text-sm font-medium text-red-600 py-10 text-center">
					{eoisQuery.data?.error || t("loadError")}
				</p>
			) : eois.length === 0 ? (
				<div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
					<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
						inbox
					</span>
					<p className="text-on-surface-variant font-medium text-sm">{t("eois.empty")}</p>
				</div>
			) : (
				<div className="space-y-4">
					{eois.map((eoi) => {
						const eoiId = String(eoi.id);
						const promoter = eoi.promoter as Record<string, unknown> | null;
						const artist = eoi.artist as Record<string, unknown> | null;
						const forwardedAt =
							eoi.forwarded_at != null
								? format.dateTime(new Date(String(eoi.forwarded_at)), { dateStyle: "medium" })
								: "—";
						const expanded = selectedId === eoiId;
						return (
							<div
								key={eoiId}
								className={`bg-surface-container-lowest rounded-2xl border shadow-sm transition-colors ${
									expanded ? "border-[#FF5A30]/60" : "border-outline-variant/10"
								}`}
							>
								<div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<p className="text-xs font-black text-[#FF5A30] uppercase tracking-widest mb-0.5">
											{`EOI-${eoiId.slice(-6).toUpperCase()}`}
										</p>
										<p className="font-(family-name:--font-manrope) font-semibold text-on-surface">
											{String(artist?.name ?? "—")}
											<span className="text-on-surface-variant font-normal text-sm ml-1">
												— {String(artist?.tour_name ?? "")}
											</span>
										</p>
										<p className="text-sm text-on-surface-variant mt-0.5">
											{String(promoter?.company_name ?? promoter?.contact_person ?? "—")}
											{" · "}
											{String(eoi.city ?? "—")}
										</p>
										<p className="text-xs text-on-surface-variant mt-1">
											{t("eois.forwardedOn")} {forwardedAt}
										</p>
									</div>
									<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
										<button
											type="button"
											onClick={() => setPdfViewerEoiId(eoiId)}
											className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5A30]/10 text-[#FF5A30] rounded-xl text-sm font-semibold hover:bg-[#FF5A30]/20 transition-colors"
										>
											<span className="material-symbols-outlined text-sm">draw</span>
											{t("eois.previewSign")}
										</button>
										<a
											href={`/api/eoi-pdf/${encodeURIComponent(eoiId)}?portal=finance`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors"
										>
											<span className="material-symbols-outlined text-sm">download</span>
											{t("eois.downloadPdf")}
										</a>
										<button
											type="button"
											onClick={() => toggleReview(eoi)}
											className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-high text-on-surface rounded-xl text-sm font-semibold hover:bg-surface-container-highest transition-colors"
										>
											<span className="material-symbols-outlined text-sm">
												{expanded ? "expand_less" : "rate_review"}
											</span>
											{expanded ? t("eois.closeReview") : t("eois.review")}
										</button>
									</div>
								</div>

								{expanded && (
									<form
										onSubmit={(e) => {
											e.preventDefault();
											submitDisburse();
										}}
										className="border-t border-outline-variant/10 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
									>
										<label className="block">
											<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
												{t("reviewForm.contactPerson")}
											</span>
											<input
												type="text"
												value={contactPerson}
												onChange={(e) => setContactPerson(e.target.value)}
												placeholder={t("reviewForm.contactPersonPlaceholder")}
												className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
											/>
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
												onChange={(e) => setTermSheetUrl(e.target.value)}
												placeholder={t("reviewForm.placeholders.termSheet")}
												className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
											/>
										</label>
										<label className="block">
											<span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
												{t("reviewForm.fields.note")}
											</span>
											<textarea
												rows={3}
												value={note}
												onChange={(e) => setNote(e.target.value)}
												placeholder={t("reviewForm.placeholders.note")}
												className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
											/>
										</label>
										<div className="sm:col-span-2 flex items-center justify-between gap-3">
											<div>
												{reviewDone && (
													<p className="text-sm font-medium text-emerald-700" role="status">
														{t("reviewForm.success")}
													</p>
												)}
												{(reviewFailed || reviewMutation.isError) && (
													<p className="text-sm font-medium text-red-600" role="alert">
														{reviewMutation.data?.error || t("reviewForm.error")}
													</p>
												)}
											</div>
											<button
												type="submit"
												disabled={reviewMutation.isPending}
												className="px-6 py-2.5 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-60"
											>
												{reviewMutation.isPending ? t("reviewForm.saving") : t("actions.disburse")}
											</button>
										</div>
									</form>
								)}
							</div>
						);
					})}
				</div>
			)}
		</>
	);
}
