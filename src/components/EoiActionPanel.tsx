"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTourFromEoi, updateAdminEoi } from "@/app/actions";

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
}: {
	eoiId: string;
	currentStatus: string;
	eoiCity?: string;
}) {
	const t = useTranslations("EoiActionPanel");
	const router = useRouter();
	const [open, setOpen] = useState<Action | null>(null);
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
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
	const isPending = statusMutation.isPending || stopMutation.isPending;

	return (
		<>
			<div className="flex flex-wrap md:flex-nowrap items-center gap-3 pt-4 border-t border-outline-variant/10">
				{showApprove && (
					<button
						type="button"
						onClick={() => startAction("approve")}
						className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">check_circle</span>
						{t("approve")}
					</button>
				)}
				{showRevision && (
					<button
						type="button"
						onClick={() => startAction("revision")}
						className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">edit_note</span>
						{t("revision")}
					</button>
				)}
				{showReject && (
					<button
						type="button"
						onClick={() => startAction("reject")}
						className="flex-1 py-2.5 bg-red-50 text-red-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">cancel</span>
						{t("reject")}
					</button>
				)}
				{showCreateStop && (
					<button
						type="button"
						onClick={() => startAction("create_stop")}
						className="flex-1 py-2.5 bg-[#FF5A30]/10 text-[#FF5A30] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#FF5A30]/20 transition-colors"
					>
						<span className="material-symbols-outlined text-sm">add_location_alt</span>
						{t("createStop")}
					</button>
				)}
			</div>

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
							className="text-lg font-bold text-on-surface mb-2"
						>
							{t(`${open}Title`)}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t(`${open}Description`)}
						</p>

						<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
							{open === "revision" ? t("revisionNotesLabel") : t("optionalNotesLabel")}
						</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
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
								className={`px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60 ${
									open === "approve"
										? "bg-emerald-600 hover:bg-emerald-700"
										: open === "revision"
											? "bg-blue-600 hover:bg-blue-700"
											: "bg-red-600 hover:bg-red-700"
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
							className="text-lg font-bold text-on-surface mb-1"
						>
							{t("createStopTitle")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-5">
							{t("createStopDescription")}
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="sm:col-span-2">
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("venue")} *
								</label>
								<input
									type="text"
									value={stopForm.venue}
									onChange={(e) => setStopForm((f) => ({ ...f, venue: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
									placeholder={t("venuePlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("city")} *
								</label>
								<input
									type="text"
									value={stopForm.city}
									onChange={(e) => setStopForm((f) => ({ ...f, city: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
									placeholder={t("cityPlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("country")}
								</label>
								<input
									type="text"
									value={stopForm.country}
									onChange={(e) => setStopForm((f) => ({ ...f, country: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
									placeholder={t("countryPlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("date")} *
								</label>
								<input
									type="date"
									value={stopForm.date}
									onChange={(e) => setStopForm((f) => ({ ...f, date: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
								/>
							</div>
							<div>
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("feeUsd")} *
								</label>
								<input
									type="number"
									min="1"
									value={stopForm.feeUsd}
									onChange={(e) => setStopForm((f) => ({ ...f, feeUsd: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
									placeholder="e.g. 25000"
								/>
							</div>
							<div className="sm:col-span-2">
								<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
									{t("capacity")}
								</label>
								<input
									type="number"
									min="1"
									value={stopForm.capacity}
									onChange={(e) => setStopForm((f) => ({ ...f, capacity: e.target.value }))}
									className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
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
								className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#FF5A30] hover:opacity-90 disabled:opacity-60"
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
