"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTourFromEoi, forwardEoi, updateAdminEoi } from "@/app/actions";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

type Action = "approve" | "revision" | "reject" | "create_stop";

const ACTION_STATUS: Record<
	Exclude<Action, "create_stop">,
	"approved" | "needs_revision" | "rejected"
> = {
	approve: "approved",
	revision: "needs_revision",
	reject: "rejected",
};

const HIDDEN_FOR_STATUS: Record<string, Exclude<Action, "create_stop">[]> = {
	approved: ["approve"],
	needs_revision: ["revision"],
	rejected: ["reject"],
};

type TourStopForm = {
	venue: string;
	city: string;
	date: string;
	feeUsd: string;
	capacity: string;
	country: string;
};

export default function EoiActionPanel({
	eoiId,
	currentStatus,
	eoiCity = "",
	forwardedToFinance = false,
	forwardedToInsurance = false,
	signedOff = false,
}: {
	eoiId: string;
	currentStatus: string;
	eoiCity?: string;
	forwardedToFinance?: boolean;
	forwardedToInsurance?: boolean;
	signedOff?: boolean;
}) {
	const t = useTranslations("EoiActionPanel");
	const router = useRouter();
	const [open, setOpen] = useState<Action | null>(null);
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [sendDropdownOpen, setSendDropdownOpen] = useState(false);
	const [stopForm, setStopForm] = useState<TourStopForm>({
		venue: "",
		city: eoiCity,
		date: "",
		feeUsd: "",
		capacity: "",
		country: "",
	});

	const statusMutation = useMutation({
		mutationFn: async (action: Exclude<Action, "create_stop">) => {
			const body: Parameters<typeof updateAdminEoi>[1] = {
				status: ACTION_STATUS[action],
			};
			if (action === "revision") body.revisionNotes = notes.trim();
			else if (notes.trim()) body.flagNote = notes.trim();
			return updateAdminEoi(eoiId, body);
		},
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("errorGeneric"));
				return;
			}
			setOpen(null);
			setNotes("");
			setError(null);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	const [forwardError, setForwardError] = useState<string | null>(null);

	const forwardMutation = useMutation({
		mutationFn: (target: "finance" | "insurance" | "both") => forwardEoi(eoiId, target),
		onSuccess: (result) => {
			if (!result.success) {
				setForwardError(result.error || t("errorGeneric"));
				return;
			}
			setSendDropdownOpen(false);
			setForwardError(null);
			router.refresh();
		},
		onError: (err) => {
			setForwardError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	const [signOffError, setSignOffError] = useState<string | null>(null);
	const [signOffOpen, setSignOffOpen] = useState(false);

	const signOffMutation = useMutation({
		mutationFn: () =>
			updateAdminEoi(eoiId, { status: "approved", flagNote: "signed_off" }),
		onSuccess: (result) => {
			if (!result.success) {
				setSignOffError(result.error || t("signOffError"));
				return;
			}
			setSignOffOpen(false);
			setSignOffError(null);
			router.refresh();
		},
		onError: (err) => {
			setSignOffError(err instanceof Error ? err.message : t("signOffError"));
		},
	});

	const stopMutation = useMutation({
		mutationFn: () =>
			createTourFromEoi({
				eoiId,
				venue: stopForm.venue.trim(),
				city: stopForm.city.trim(),
				date: stopForm.date,
				feeUsd: Number(stopForm.feeUsd),
				capacity: stopForm.capacity ? Number(stopForm.capacity) : undefined,
				country: stopForm.country.trim() || undefined,
			}),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("errorGeneric"));
				return;
			}
			setOpen(null);
			setError(null);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	function startAction(action: Action) {
		setOpen(action);
		setNotes("");
		setError(null);
		if (action === "create_stop") {
			setStopForm({ venue: "", city: eoiCity, date: "", feeUsd: "", capacity: "", country: "" });
		}
	}

	function submitStatus() {
		const action = open as Exclude<Action, "create_stop">;
		if (action === "revision" && notes.trim().length === 0) {
			setError(t("revisionNotesRequired"));
			return;
		}
		statusMutation.mutate(action);
	}

	function submitStop() {
		if (!stopForm.venue.trim()) { setError(t("venueRequired")); return; }
		if (!stopForm.city.trim()) { setError(t("cityRequired")); return; }
		if (!stopForm.date) { setError(t("dateRequired")); return; }
		if (!stopForm.feeUsd || Number(stopForm.feeUsd) <= 0) { setError(t("feeRequired")); return; }
		stopMutation.mutate();
	}

	const hidden = HIDDEN_FOR_STATUS[currentStatus] ?? [];
	const showApprove = !hidden.includes("approve");
	const showRevision = !hidden.includes("revision");
	const showReject = !hidden.includes("reject");
	const showCreateStop = currentStatus !== "rejected";
	const showSend = currentStatus === "approved" && (!forwardedToFinance || !forwardedToInsurance);
	const showSignOff = !signedOff && currentStatus === "approved" && (forwardedToFinance || forwardedToInsurance);
	const isPending = statusMutation.isPending || stopMutation.isPending || forwardMutation.isPending || signOffMutation.isPending;

	return (
		<>
			{(forwardedToFinance || forwardedToInsurance || signedOff) && (
				<div className="flex flex-wrap gap-2 mt-2">
					{forwardedToFinance && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 bg-status-contacted/10 rounded-lg text-xs text-status-contacted font-semibold">
							<span className="material-symbols-outlined text-xs text-status-contacted">account_balance</span>
							{t("forwardedTo", { target: t("finance") })}
						</div>
					)}
					{forwardedToInsurance && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 bg-status-approved/10 rounded-lg text-xs text-status-approved font-semibold">
							<span className="material-symbols-outlined text-xs text-status-approved">verified_user</span>
							{t("forwardedTo", { target: t("insurance") })}
						</div>
					)}
					{signedOff && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-500/20 rounded-lg text-xs text-teal-700 dark:text-teal-300 font-semibold">
							<span className="material-symbols-outlined text-xs text-teal-500">task_alt</span>
							{t("signedOff")}
						</div>
					)}
				</div>
			)}
			<div className="flex flex-wrap md:flex-nowrap items-center gap-3 pt-4 border-t border-outline-variant/10">
				{showApprove && (
					<button
						type="button"
						onClick={() => startAction("approve")}
						className="flex-1 py-2.5 bg-status-approved/10 text-status-approved rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-status-approved/20 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">check_circle</span>
						{t("approve")}
					</button>
				)}
				{showRevision && (
					<button
						type="button"
						onClick={() => startAction("revision")}
						className="flex-1 py-2.5 bg-status-contacted/10 text-status-contacted rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-status-contacted/20 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">edit_note</span>
						{t("revision")}
					</button>
				)}
				{showReject && (
					<button
						type="button"
						onClick={() => startAction("reject")}
						className="flex-1 py-2.5 bg-status-rejected/10 text-status-rejected rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-status-rejected/20 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">cancel</span>
						{t("reject")}
					</button>
				)}
				{showCreateStop && (
					<button
						type="button"
						onClick={() => startAction("create_stop")}
						className="flex-1 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">add_location_alt</span>
						{t("createStop")}
					</button>
				)}
				{showSend && (
					<div className="relative flex-1">
						<button
							type="button"
							onClick={() => { setSendDropdownOpen((v) => !v); setForwardError(null); }}
							disabled={isPending}
							className="w-full py-2.5 bg-status-booked/10 text-status-booked rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-status-booked/20 transition-colors disabled:opacity-60"
						>
							<span className="material-symbols-outlined text-sm">send</span>
							{t("send")}
							<span className="material-symbols-outlined text-xs">arrow_drop_down</span>
						</button>
						{sendDropdownOpen && (
							<div className="absolute left-0 bottom-full mb-1 w-full bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-20">
								{!forwardedToFinance && (
									<button
										type="button"
										onClick={() => forwardMutation.mutate("finance")}
										disabled={forwardMutation.isPending}
										className="w-full px-4 py-3 text-left text-sm font-semibold text-on-surface-variant hover:bg-status-contacted/10 flex items-center gap-2 disabled:opacity-50"
									>
										<span className="material-symbols-outlined text-sm">account_balance</span>
										{t("sendToFinance")}
										{forwardMutation.isPending && <span className="material-symbols-outlined text-xs animate-spin ml-auto">progress_activity</span>}
									</button>
								)}
								{!forwardedToInsurance && (
									<button
										type="button"
										onClick={() => forwardMutation.mutate("insurance")}
										disabled={forwardMutation.isPending}
										className="w-full px-4 py-3 text-left text-sm font-semibold text-on-surface-variant hover:bg-status-approved/10 flex items-center gap-2 disabled:opacity-50"
									>
										<span className="material-symbols-outlined text-sm">shield</span>
										{t("sendToInsurance")}
										{forwardMutation.isPending && <span className="material-symbols-outlined text-xs animate-spin ml-auto">progress_activity</span>}
									</button>
								)}
								{!forwardedToFinance && !forwardedToInsurance && (
									<button
										type="button"
										onClick={() => forwardMutation.mutate("both")}
										disabled={forwardMutation.isPending}
										className="w-full px-4 py-3 text-left text-sm font-semibold text-on-surface-variant hover:bg-status-booked/10 flex items-center gap-2 disabled:opacity-50"
									>
										<span className="material-symbols-outlined text-sm">send</span>
										{t("sendToBoth")}
										{forwardMutation.isPending && <span className="material-symbols-outlined text-xs animate-spin ml-auto">progress_activity</span>}
									</button>
								)}
								{forwardError && (
									<p className="px-4 py-2 text-xs text-status-rejected font-semibold border-t border-status-rejected/20 bg-status-rejected/10">
										{forwardError}
									</p>
								)}
							</div>
						)}
					</div>
				)}
				{showSignOff && (
					<button
						type="button"
						onClick={() => { setSignOffOpen(true); setSignOffError(null); }}
						disabled={isPending}
						className="flex-1 py-2.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-100 transition-colors disabled:opacity-60"
					>
						<span className="material-symbols-outlined text-sm">task_alt</span>
						{t("signOff")}
					</button>
				)}
			</div>

			{signOffOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`eoi-signoff-${eoiId}-title`}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
						<h3
							id={`eoi-signoff-${eoiId}-title`}
							className="text-lg font-semibold text-on-surface mb-2"
						>
							{t("signOffTitle")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-5">
							{t("signOffDescription")}
						</p>
						{signOffError && <p className="mb-4 text-sm text-red-600 font-semibold">{signOffError}</p>}
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => { setSignOffOpen(false); setSignOffError(null); }}
								disabled={signOffMutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={() => signOffMutation.mutate()}
								disabled={signOffMutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
							>
								{signOffMutation.isPending ? t("submitting") : t("signOffConfirm")}
							</button>
						</div>
					</div>
				</div>
			)}

			{open && open !== "create_stop" && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`eoi-action-${eoiId}-title`}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
						<h3
							id={`eoi-action-${eoiId}-title`}
							className="text-lg font-semibold text-on-surface mb-2"
						>
							{t(`${open}Title`)}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t(`${open}Description`)}
						</p>

						<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
							{open === "revision" ? t("revisionNotesLabel") : t("optionalNotesLabel")}
						</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
							placeholder={
								open === "revision" ? t("revisionNotesPlaceholder") : t("optionalNotesPlaceholder")
							}
						/>

						{error && <p className="mt-2 text-sm text-red-600 font-semibold">{error}</p>}

						<div className="flex justify-end gap-2 mt-5">
							<button
								type="button"
								onClick={() => { setOpen(null); setError(null); }}
								disabled={isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={submitStatus}
								disabled={isPending}
								className={`px-4 py-2 rounded-lg text-sm font-semibold text-on-primary disabled:opacity-60 ${
									open === "approve"
										? "bg-status-approved hover:opacity-90"
										: open === "revision"
											? "bg-status-contacted hover:opacity-90"
											: "bg-status-rejected hover:opacity-90"
								}`}
							>
								{isPending ? t("submitting") : t(`${open}Confirm`)}
							</button>
						</div>
					</div>
				</div>
			)}

			{open === "create_stop" && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`eoi-stop-${eoiId}-title`}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
						<h3
							id={`eoi-stop-${eoiId}-title`}
							className="text-lg font-semibold text-on-surface mb-1"
						>
							{t("createStopTitle")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-5">
							{t("createStopDescription")}
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="sm:col-span-2">
								<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("venue")} *
								</label>
								<input
									type="text"
									value={stopForm.venue}
									onChange={(e) => setStopForm((f) => ({ ...f, venue: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
									placeholder={t("venuePlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("city")} *
								</label>
								<input
									type="text"
									value={stopForm.city}
									onChange={(e) => setStopForm((f) => ({ ...f, city: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
									placeholder={t("cityPlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("country")}
								</label>
								<input
									type="text"
									value={stopForm.country}
									onChange={(e) => setStopForm((f) => ({ ...f, country: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
									placeholder={t("countryPlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("date")} *
								</label>
								<input
									type="date"
									value={stopForm.date}
									onChange={(e) => setStopForm((f) => ({ ...f, date: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("feeUsd")} *
								</label>
								<FormattedNumberInput
									value={stopForm.feeUsd}
									onChange={(v) => setStopForm((f) => ({ ...f, feeUsd: v }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
									placeholder="e.g. 25,000"
								/>
							</div>
							<div className="sm:col-span-2">
								<label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("capacity")}
								</label>
								<FormattedNumberInput
									value={stopForm.capacity}
									onChange={(v) => setStopForm((f) => ({ ...f, capacity: v }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40"
									placeholder={t("capacityPlaceholder")}
								/>
							</div>
						</div>

						{error && <p className="mt-3 text-sm text-red-600 font-semibold">{error}</p>}

						<div className="flex justify-end gap-2 mt-6">
							<button
								type="button"
								onClick={() => { setOpen(null); setError(null); }}
								disabled={isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={submitStop}
								disabled={isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#FF5A2E] hover:opacity-90 disabled:opacity-60"
							>
								{isPending ? t("creating") : t("createStopConfirm")}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
