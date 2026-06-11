"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import {
	createArtistPitch,
	deleteArtistPitch,
	getArtistPitches,
	getRosterArtists,
	updateArtistPitch,
} from "@/app/actions";

type PitchStatus = "pending" | "accepted" | "rejected";

type Pitch = {
	id: unknown;
	tour_name: unknown;
	promoter_contact?: unknown;
	notes?: unknown;
	status: unknown;
	created_at?: unknown;
	roster_artist: {
		id: unknown;
		name: unknown;
		genre: unknown;
		image_url?: unknown;
	};
};

type RosterArtist = {
	id: unknown;
	name: unknown;
	genre: unknown;
};

const STATUS_STYLES: Record<PitchStatus, string> = {
	pending: "bg-amber-100 text-amber-700",
	accepted: "bg-emerald-100 text-emerald-700",
	rejected: "bg-rose-100 text-rose-500",
};

const STATUS_ICONS: Record<PitchStatus, string> = {
	pending: "schedule",
	accepted: "check_circle",
	rejected: "cancel",
};

export default function ArtmgmtSubmissionsPage() {
	const t = useTranslations("ArtmgmtSubmissionsPage");
	const format = useFormatter();
	const qc = useQueryClient();

	const [showForm, setShowForm] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

	const [form, setForm] = useState({
		rosterArtistId: "",
		tourName: "",
		promoterContact: "",
		notes: "",
	});

	function showToast(msg: string, ok: boolean) {
		setToast({ msg, ok });
		setTimeout(() => setToast(null), 3500);
	}

	const { data: pitches = [] as Pitch[], isLoading } = useQuery({
		queryKey: ["artist-pitches"],
		queryFn: getArtistPitches,
		select: (r) => (r.data ?? []) as Pitch[],
	});

	const { data: rosterArtists = [] as RosterArtist[] } = useQuery({
		queryKey: ["roster-artists"],
		queryFn: getRosterArtists,
		select: (r) => (r.data ?? []) as RosterArtist[],
	});

	const createMutation = useMutation({
		mutationFn: createArtistPitch,
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["artist-pitches"] });
				closeForm();
				showToast(t("createSuccess"), true);
			} else {
				showToast(result.error || t("createError"), false);
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateArtistPitch>[1] }) =>
			updateArtistPitch(id, body),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["artist-pitches"] });
				closeForm();
				showToast(t("updateSuccess"), true);
			} else {
				showToast(result.error || t("updateError"), false);
			}
		},
	});

	const statusMutation = useMutation({
		mutationFn: ({ id, status }: { id: string; status: PitchStatus }) =>
			updateArtistPitch(id, { status }),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["artist-pitches"] });
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteArtistPitch,
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["artist-pitches"] });
				showToast(t("deleteSuccess"), true);
			} else {
				showToast(result.error || t("deleteError"), false);
			}
		},
	});

	function openAdd() {
		setEditId(null);
		setForm({ rosterArtistId: "", tourName: "", promoterContact: "", notes: "" });
		setShowForm(true);
	}

	function openEdit(pitch: Pitch) {
		setEditId(String(pitch.id));
		setForm({
			rosterArtistId: String(pitch.roster_artist.id),
			tourName: String(pitch.tour_name),
			promoterContact: pitch.promoter_contact ? String(pitch.promoter_contact) : "",
			notes: pitch.notes ? String(pitch.notes) : "",
		});
		setShowForm(true);
	}

	function closeForm() {
		setShowForm(false);
		setEditId(null);
		setForm({ rosterArtistId: "", tourName: "", promoterContact: "", notes: "" });
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const body = {
			rosterArtistId: form.rosterArtistId,
			tourName: form.tourName,
			...(form.promoterContact ? { promoterContact: form.promoterContact } : {}),
			...(form.notes ? { notes: form.notes } : {}),
		};
		if (editId) {
			updateMutation.mutate({ id: editId, body });
		} else {
			createMutation.mutate(body);
		}
	}

	const isBusy = createMutation.isPending || updateMutation.isPending;

	const pending = pitches.filter((p) => p.status === "pending").length;
	const accepted = pitches.filter((p) => p.status === "accepted").length;
	const rejected = pitches.filter((p) => p.status === "rejected").length;

	const inputCls =
		"w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40 placeholder:text-slate-400";

	return (
		<div>
			{/* Header */}
			<div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
				<div>
					<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-bold uppercase tracking-wider mb-3">
						{t("badge")}
					</span>
					<h1 className="font-(family-name:--font-manrope) text-3xl font-black text-on-surface">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
				</div>
				<button
					type="button"
					onClick={openAdd}
					className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5A30] text-white rounded-xl font-bold text-sm hover:bg-[#e04e27] transition-colors shadow-md shadow-[#FF5A30]/20"
				>
					<span className="material-symbols-outlined text-sm">add</span>
					{t("newPitch")}
				</button>
			</div>

			{/* Stats */}
			{!isLoading && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-amber-500 text-xl">schedule</span>
						</div>
						<div>
							<p className="text-2xl font-black text-slate-900 leading-none">{pending}</p>
							<p className="text-xs text-slate-500 font-semibold mt-0.5">{t("stats.pending")}</p>
						</div>
					</div>
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
						</div>
						<div>
							<p className="text-2xl font-black text-slate-900 leading-none">{accepted}</p>
							<p className="text-xs text-slate-500 font-semibold mt-0.5">{t("stats.accepted")}</p>
						</div>
					</div>
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-rose-400 text-xl">cancel</span>
						</div>
						<div>
							<p className="text-2xl font-black text-slate-900 leading-none">{rejected}</p>
							<p className="text-xs text-slate-500 font-semibold mt-0.5">{t("stats.rejected")}</p>
						</div>
					</div>
				</div>
			)}

			{/* Toast */}
			{toast && (
				<div
					className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${toast.ok ? "bg-emerald-500" : "bg-rose-500"}`}
				>
					{toast.msg}
				</div>
			)}

			{/* Pitch list */}
			{isLoading ? (
				<div className="flex items-center justify-center py-24">
					<span className="material-symbols-outlined animate-spin text-3xl text-[#FF5A30]">
						progress_activity
					</span>
				</div>
			) : pitches.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 text-center">
					<span className="material-symbols-outlined text-5xl mb-4 text-slate-300">send</span>
					<p className="font-bold text-lg text-on-surface">{t("noPitches")}</p>
					<p className="text-sm text-on-surface-variant mt-1">{t("noPitchesHint")}</p>
				</div>
			) : (
				<div className="space-y-3">
					{pitches.map((pitch) => {
						const status = String(pitch.status) as PitchStatus;
						return (
							<div
								key={String(pitch.id)}
								className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
							>
								<div className="flex items-start gap-4 flex-wrap">
									{/* Artist avatar */}
									<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A30]/20 to-orange-100 flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-[#FF5A30] text-lg">person</span>
									</div>

									{/* Main info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<p className="font-bold text-slate-900">
												{String(pitch.roster_artist.name)}
											</p>
											<span className="text-slate-300">·</span>
											<p className="text-sm text-slate-500">{String(pitch.roster_artist.genre)}</p>
										</div>
										<p className="text-sm font-semibold text-slate-700 mt-0.5">
											<span className="material-symbols-outlined text-xs text-slate-400 mr-1 align-middle">
												music_note
											</span>
											{String(pitch.tour_name)}
										</p>
										{pitch.promoter_contact && (
											<p className="text-xs text-slate-400 mt-0.5">
												{t("contact")}: {String(pitch.promoter_contact)}
											</p>
										)}
										{pitch.notes && (
											<p className="text-xs text-slate-500 mt-1 line-clamp-2">{String(pitch.notes)}</p>
										)}
									</div>

									{/* Status badge + date */}
									<div className="flex flex-col items-end gap-2 shrink-0">
										<span
											className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
										>
											<span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
												{STATUS_ICONS[status] ?? STATUS_ICONS.pending}
											</span>
											{t(`status.${status}`)}
										</span>
										{pitch.created_at && (
											<span className="text-[10px] text-slate-400">
												{format.relativeTime(new Date(String(pitch.created_at)))}
											</span>
										)}
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-50 flex-wrap">
									{/* Status change buttons */}
									{status !== "accepted" && (
										<button
											type="button"
											disabled={statusMutation.isPending}
											onClick={() => statusMutation.mutate({ id: String(pitch.id), status: "accepted" })}
											className="text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
										>
											{t("markAccepted")}
										</button>
									)}
									{status !== "rejected" && (
										<button
											type="button"
											disabled={statusMutation.isPending}
											onClick={() => statusMutation.mutate({ id: String(pitch.id), status: "rejected" })}
											className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-50"
										>
											{t("markRejected")}
										</button>
									)}
									{status !== "pending" && (
										<button
											type="button"
											disabled={statusMutation.isPending}
											onClick={() => statusMutation.mutate({ id: String(pitch.id), status: "pending" })}
											className="text-xs font-semibold text-amber-600 hover:underline disabled:opacity-50"
										>
											{t("markPending")}
										</button>
									)}
									<span className="flex-1" />
									<button
										type="button"
										onClick={() => openEdit(pitch)}
										className="text-xs font-semibold text-[#FF5A30] hover:underline"
									>
										{t("edit")}
									</button>
									<button
										type="button"
										onClick={() => setConfirmDeleteId(String(pitch.id))}
										className="text-xs font-semibold text-rose-500 hover:underline"
									>
										{t("delete")}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Add / Edit modal */}
			{showForm && (
				<div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
						<div className="flex items-center justify-between mb-5">
							<h2 className="font-(family-name:--font-manrope) text-xl font-black text-slate-900">
								{editId ? t("form.editTitle") : t("form.addTitle")}
							</h2>
							<button type="button" onClick={closeForm} className="text-slate-400 hover:text-slate-700">
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.artist")} *
								</label>
								<select
									required
									value={form.rosterArtistId}
									onChange={(e) => setForm((p) => ({ ...p, rosterArtistId: e.target.value }))}
									className={inputCls}
									disabled={!!editId}
								>
									<option value="">{t("form.artistPlaceholder")}</option>
									{rosterArtists.map((a) => (
										<option key={String(a.id)} value={String(a.id)}>
											{String(a.name)} — {String(a.genre)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.tourName")} *
								</label>
								<input
									type="text"
									required
									value={form.tourName}
									onChange={(e) => setForm((p) => ({ ...p, tourName: e.target.value }))}
									placeholder={t("form.tourNamePlaceholder")}
									className={inputCls}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.promoterContact")}
								</label>
								<input
									type="text"
									value={form.promoterContact}
									onChange={(e) => setForm((p) => ({ ...p, promoterContact: e.target.value }))}
									placeholder={t("form.promoterContactPlaceholder")}
									className={inputCls}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.notes")}
								</label>
								<textarea
									rows={3}
									value={form.notes}
									onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
									placeholder={t("form.notesPlaceholder")}
									className={`${inputCls} resize-none`}
								/>
							</div>

							<div className="flex gap-3 mt-2">
								<button
									type="submit"
									disabled={isBusy}
									className="flex-1 py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm hover:bg-[#e04e27] disabled:opacity-60 transition-colors"
								>
									{isBusy ? t("form.saving") : t("form.save")}
								</button>
								<button
									type="button"
									onClick={closeForm}
									className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
								>
									{t("form.cancel")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete confirm */}
			{confirmDeleteId && (
				<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
						<span className="material-symbols-outlined text-rose-500 text-4xl mb-3 block">
							delete_forever
						</span>
						<p className="font-bold text-slate-900 mb-4">{t("confirmDelete")}</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									deleteMutation.mutate(confirmDeleteId);
									setConfirmDeleteId(null);
								}}
								className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors"
							>
								{t("delete")}
							</button>
							<button
								type="button"
								onClick={() => setConfirmDeleteId(null)}
								className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
							>
								{t("form.cancel")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
