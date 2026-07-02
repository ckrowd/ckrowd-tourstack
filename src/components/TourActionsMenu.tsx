"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteAdminTour, updateAdminTour } from "@/app/actions";
import DatePicker from "@/components/ui/DatePicker";
import { Link } from "@/i18n/routing";

const TOUR_STATUSES = [
	"under_review",
	"confirmed",
	"needs_revision",
	"rejected",
	"draft",
] as const;

type TourStatus = (typeof TOUR_STATUSES)[number];

type EditForm = {
	status: TourStatus;
	venue: string;
	city: string;
	date: string;
	capacity: string;
	feeUsd: string;
};

function statusLabel(s: string): string {
	return (
		{
			under_review: "Under Review",
			confirmed: "Confirmed",
			needs_revision: "Needs Revision",
			rejected: "Rejected",
			draft: "Draft",
		}[s] ?? s.replace(/_/g, " ")
	);
}

export default function TourActionsMenu({
	tourId,
	initialStatus,
	initialVenue,
	initialCity,
	initialDate,
	initialCapacity,
	initialFeeUsd,
}: {
	tourId: string;
	initialStatus?: string;
	initialVenue?: string;
	initialCity?: string;
	initialDate?: string;
	initialCapacity?: number | null;
	initialFeeUsd?: number;
}) {
	const t = useTranslations("TourActionsMenu");
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const [form, setForm] = useState<EditForm>({
		status: (initialStatus as TourStatus) ?? "under_review",
		venue: initialVenue ?? "",
		city: initialCity ?? "",
		date: initialDate ? initialDate.slice(0, 10) : "",
		capacity: initialCapacity != null ? String(initialCapacity) : "",
		feeUsd: initialFeeUsd != null ? String(initialFeeUsd) : "",
	});

	useEffect(() => {
		if (!open) return;
		function onClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, [open]);

	const deleteMutation = useMutation({
		mutationFn: () => deleteAdminTour(tourId),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("errorGeneric"));
				return;
			}
			setConfirmingDelete(false);
			setOpen(false);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	const editMutation = useMutation({
		mutationFn: () =>
			updateAdminTour(tourId, {
				status: form.status,
				venue: form.venue || undefined,
				city: form.city || undefined,
				date: form.date || undefined,
				capacity: form.capacity !== "" ? Number(form.capacity) : null,
				feeUsd: form.feeUsd !== "" ? Number(form.feeUsd) : undefined,
			}),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("editError"));
				return;
			}
			setEditing(false);
			setError(null);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("editError"));
		},
	});

	const inputClass =
		"w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20 transition";

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={t("openMenu")}
				onClick={() => setOpen((v) => !v)}
				className="ml-2 p-2 text-on-surface-variant hover:text-[#FF5A30] hover:bg-[#FF5A30]/10 rounded-lg transition-colors"
			>
				<span className="material-symbols-outlined">more_vert</span>
			</button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 mt-2 w-44 bg-surface rounded-xl shadow-lg border border-outline-variant/30 z-20 py-1"
				>
					<Link
						role="menuitem"
						href={`/admin/tours/${tourId}`}
						onClick={() => setOpen(false)}
						className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low"
					>
						<span className="material-symbols-outlined text-base">open_in_new</span>
						{t("viewDetail")}
					</Link>
					<button
						type="button"
						role="menuitem"
						onClick={() => {
							setOpen(false);
							setError(null);
							setEditing(true);
						}}
						className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low"
					>
						<span className="material-symbols-outlined text-base">edit</span>
						{t("edit")}
					</button>
					<button
						type="button"
						role="menuitem"
						onClick={() => {
							setOpen(false);
							setConfirmingDelete(true);
							setError(null);
						}}
						className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
					>
						<span className="material-symbols-outlined text-base">delete</span>
						{t("delete")}
					</button>
				</div>
			)}

			{/* ── Edit modal ─────────────────────────────────────────── */}
			{editing && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-label={t("editTitle")}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-on-surface font-(family-name:--font-manrope)">
								{t("editTitle")}
							</h3>
							<button
								type="button"
								onClick={() => { setEditing(false); setError(null); }}
								className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors"
								aria-label={t("cancel")}
							>
								<span className="material-symbols-outlined text-sm">close</span>
							</button>
						</div>

						{/* Status */}
						<div>
							<label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">
								{t("editFields.status")}
							</label>
							<select
								value={form.status}
								onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TourStatus }))}
								className={inputClass}
							>
								{TOUR_STATUSES.map((s) => (
									<option key={s} value={s}>{statusLabel(s)}</option>
								))}
							</select>
						</div>

						{/* Venue */}
						<div>
							<label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">
								{t("editFields.venue")}
							</label>
							<input
								type="text"
								value={form.venue}
								onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
								className={inputClass}
								placeholder={t("editFields.venuePlaceholder")}
							/>
						</div>

						{/* City */}
						<div>
							<label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">
								{t("editFields.city")}
							</label>
							<input
								type="text"
								value={form.city}
								onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
								className={inputClass}
								placeholder={t("editFields.cityPlaceholder")}
							/>
						</div>

						{/* Date */}
						<DatePicker
							label={t("editFields.date")}
							id="tour-edit-date"
							value={form.date}
							onChange={(v) => setForm((f) => ({ ...f, date: v }))}
						/>

						{/* Capacity + Fee side by side */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">
									{t("editFields.capacity")}
								</label>
								<input
									type="number"
									min={0}
									value={form.capacity}
									onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
									className={inputClass}
									placeholder="e.g. 5000"
								/>
							</div>
							<div>
								<label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">
									{t("editFields.feeUsd")}
								</label>
								<input
									type="number"
									min={0}
									value={form.feeUsd}
									onChange={(e) => setForm((f) => ({ ...f, feeUsd: e.target.value }))}
									className={inputClass}
									placeholder="e.g. 25000"
								/>
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-600 font-semibold">{error}</p>
						)}

						<div className="flex justify-end gap-2 pt-1">
							<button
								type="button"
								onClick={() => { setEditing(false); setError(null); }}
								disabled={editMutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={() => editMutation.mutate()}
								disabled={editMutation.isPending}
								className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#FF5A30] text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
							>
								{editMutation.isPending ? t("saving") : t("save")}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ── Delete confirm ─────────────────────────────────────── */}
			{confirmingDelete && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`tour-delete-${tourId}-title`}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
						<h3
							id={`tour-delete-${tourId}-title`}
							className="text-lg font-semibold text-on-surface mb-2"
						>
							{t("deleteTitle")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t("deleteDescription")}
						</p>
						{error && (
							<p className="mb-3 text-sm text-red-600 font-semibold">{error}</p>
						)}
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => { setConfirmingDelete(false); setError(null); }}
								disabled={deleteMutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={() => deleteMutation.mutate()}
								disabled={deleteMutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
							>
								{deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
