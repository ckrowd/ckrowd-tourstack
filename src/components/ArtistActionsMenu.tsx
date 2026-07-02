"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteAdminArtist, updateAdminArtist } from "@/app/actions";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

type EditForm = {
	name: string;
	genre: string;
	tourName: string;
	tourStart: string;
	tourEnd: string;
	feeMin: string;
	feeMax: string;
	region: string;
	markets: string;
	isActive: boolean;
	isTrending: boolean;
};

export default function ArtistActionsMenu({
	artistId,
	initial,
}: {
	artistId: string;
	initial: {
		name?: string;
		genre?: string;
		tourName?: string;
		tourStart?: string;
		tourEnd?: string;
		feeMin?: number | null;
		feeMax?: number | null;
		region?: string;
		markets?: string[];
		isActive?: boolean;
		isTrending?: boolean;
	};
}) {
	const t = useTranslations("ArtistActionsMenu");
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const [form, setForm] = useState<EditForm>({
		name: initial.name ?? "",
		genre: initial.genre ?? "",
		tourName: initial.tourName ?? "",
		tourStart: initial.tourStart ? initial.tourStart.slice(0, 10) : "",
		tourEnd: initial.tourEnd ? initial.tourEnd.slice(0, 10) : "",
		feeMin: initial.feeMin != null ? String(initial.feeMin) : "",
		feeMax: initial.feeMax != null ? String(initial.feeMax) : "",
		region: initial.region ?? "",
		markets: Array.isArray(initial.markets) ? initial.markets.join(", ") : "",
		isActive: initial.isActive ?? true,
		isTrending: initial.isTrending ?? false,
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

	const editMutation = useMutation({
		mutationFn: () =>
			updateAdminArtist(artistId, {
				name: form.name || undefined,
				genre: form.genre || undefined,
				tourName: form.tourName || undefined,
				tourStart: form.tourStart || undefined,
				tourEnd: form.tourEnd || undefined,
				feeMin: form.feeMin !== "" ? Number(form.feeMin) : undefined,
				feeMax: form.feeMax !== "" ? Number(form.feeMax) : undefined,
				region: form.region || undefined,
				markets: form.markets
					? form.markets.split(",").map((m) => m.trim()).filter(Boolean)
					: undefined,
				isActive: form.isActive,
				isTrending: form.isTrending,
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

	const deleteMutation = useMutation({
		mutationFn: () => deleteAdminArtist(artistId),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("errorGeneric"));
				return;
			}
			setConfirmingDelete(false);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	const inputClass =
		"w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20 transition";
	const labelClass =
		"block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5";

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={t("openMenu")}
				onClick={() => setOpen((v) => !v)}
				className="p-1.5 text-on-surface-variant hover:text-[#FF5A30] hover:bg-[#FF5A30]/10 rounded-lg transition-colors"
			>
				<span className="material-symbols-outlined text-lg">more_vert</span>
			</button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 mt-1 w-40 bg-surface rounded-xl shadow-lg border border-outline-variant/30 z-20 py-1"
				>
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
							setError(null);
							setConfirmingDelete(true);
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
					<div className="bg-surface rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
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

						{/* Active / Trending toggles */}
						<div className="flex gap-4">
							{(
								[
									{ key: "isActive" as const, label: t("fields.active") },
									{ key: "isTrending" as const, label: t("fields.trending") },
								] as const
							).map(({ key, label }) => (
								<button
									key={key}
									type="button"
									role="switch"
									aria-checked={form[key]}
									onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
									className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
										form[key]
											? "border-[#FF5A30] bg-[#FF5A30]/5 text-[#FF5A30]"
											: "border-outline-variant/30 text-on-surface-variant"
									}`}
								>
									<span>{label}</span>
									<span className="material-symbols-outlined text-base" style={{ fontVariationSettings: form[key] ? "'FILL' 1" : "'FILL' 0" }}>
										{key === "isActive" ? "toggle_on" : "trending_up"}
									</span>
								</button>
							))}
						</div>

						{/* Name + Genre */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className={labelClass}>{t("fields.name")}</label>
								<input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} placeholder={t("fields.namePlaceholder")} />
							</div>
							<div>
								<label className={labelClass}>{t("fields.genre")}</label>
								<input type="text" value={form.genre} onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))} className={inputClass} placeholder={t("fields.genrePlaceholder")} />
							</div>
						</div>

						{/* Tour Name */}
						<div>
							<label className={labelClass}>{t("fields.tourName")}</label>
							<input type="text" value={form.tourName} onChange={(e) => setForm((f) => ({ ...f, tourName: e.target.value }))} className={inputClass} placeholder={t("fields.tourNamePlaceholder")} />
						</div>

						{/* Tour Start + End */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className={labelClass}>{t("fields.tourStart")}</label>
								<input type="date" value={form.tourStart} onChange={(e) => setForm((f) => ({ ...f, tourStart: e.target.value }))} className={inputClass} />
							</div>
							<div>
								<label className={labelClass}>{t("fields.tourEnd")}</label>
								<input type="date" value={form.tourEnd} onChange={(e) => setForm((f) => ({ ...f, tourEnd: e.target.value }))} className={inputClass} />
							</div>
						</div>

						{/* Fee Min + Max */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className={labelClass}>{t("fields.feeMin")}</label>
								<FormattedNumberInput value={form.feeMin} onChange={(v) => setForm((f) => ({ ...f, feeMin: v }))} className={inputClass} placeholder={t("fields.feeMinPlaceholder")} />
							</div>
							<div>
								<label className={labelClass}>{t("fields.feeMax")}</label>
								<FormattedNumberInput value={form.feeMax} onChange={(v) => setForm((f) => ({ ...f, feeMax: v }))} className={inputClass} placeholder={t("fields.feeMaxPlaceholder")} />
							</div>
						</div>

						{/* Region */}
						<div>
							<label className={labelClass}>{t("fields.region")}</label>
							<input type="text" value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} className={inputClass} placeholder={t("fields.regionPlaceholder")} />
						</div>

						{/* Markets */}
						<div>
							<label className={labelClass}>{t("fields.markets")}</label>
							<input type="text" value={form.markets} onChange={(e) => setForm((f) => ({ ...f, markets: e.target.value }))} className={inputClass} placeholder="Lagos, Accra, Nairobi" />
							<p className="text-[10px] text-on-surface-variant mt-1">{t("fields.marketsHint")}</p>
						</div>

						{error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

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
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
						<h3 className="text-lg font-semibold text-on-surface mb-2">
							{t("deleteTitle")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t("deleteDescription")}
						</p>
						{error && <p className="mb-3 text-sm text-red-600 font-semibold">{error}</p>}
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
