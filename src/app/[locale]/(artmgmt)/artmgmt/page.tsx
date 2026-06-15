"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import Loader from "@/components/Loader";
import {
	createRosterArtist,
	deleteRosterArtist,
	getRosterArtists,
	updateRosterArtist,
} from "@/app/actions";

type RosterArtist = {
	id: unknown;
	name: unknown;
	genre: unknown;
	nationality?: unknown;
	bio?: unknown;
	social_links?: unknown;
	image_url?: unknown;
	is_active?: unknown;
	created_at?: unknown;
};

type SocialLinks = {
	instagram?: string;
	spotify?: string;
	youtube?: string;
	twitter?: string;
};

type ArtistForm = {
	name: string;
	genre: string;
	nationality: string;
	bio: string;
	instagram: string;
	spotify: string;
	youtube: string;
	imageUrl: string;
	isActive: boolean;
};

const emptyForm: ArtistForm = {
	name: "",
	genre: "",
	nationality: "",
	bio: "",
	instagram: "",
	spotify: "",
	youtube: "",
	imageUrl: "",
	isActive: true,
};

export default function ArtmgmtPage() {
	const t = useTranslations("ArtmgmtPage");
	const format = useFormatter();
	const qc = useQueryClient();

	const [showForm, setShowForm] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [form, setForm] = useState<ArtistForm>(emptyForm);
	const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
	const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

	function showToast(msg: string, ok: boolean) {
		setToast({ msg, ok });
		setTimeout(() => setToast(null), 3500);
	}

	const { data: artists = [] as RosterArtist[], isLoading } = useQuery({
		queryKey: ["roster-artists"],
		queryFn: () => getRosterArtists(),
		select: (r) => (r.data ?? []) as RosterArtist[],
	});

	const createMutation = useMutation({
		mutationFn: (payload: Parameters<typeof createRosterArtist>[0]) =>
			createRosterArtist(payload),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["roster-artists"] });
				setShowForm(false);
				setForm(emptyForm);
				showToast(t("form.createSuccess"), true);
			} else {
				showToast(result.error || t("form.createError"), false);
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: Parameters<typeof updateRosterArtist>[1];
		}) => updateRosterArtist(id, payload),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["roster-artists"] });
				setShowForm(false);
				setEditId(null);
				setForm(emptyForm);
				showToast(t("form.updateSuccess"), true);
			} else {
				showToast(result.error || t("form.updateError"), false);
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteRosterArtist(id),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["roster-artists"] });
				showToast(t("deleteSuccess"), true);
			} else {
				showToast(result.error || t("deleteError"), false);
			}
		},
	});

	function openAdd() {
		setEditId(null);
		setForm(emptyForm);
		setShowForm(true);
	}

	function openEdit(artist: (typeof artists)[number]) {
		const links = (artist.social_links ?? {}) as SocialLinks;
		setEditId(String(artist.id));
		setForm({
			name: String(artist.name ?? ""),
			genre: String(artist.genre ?? ""),
			nationality: artist.nationality ? String(artist.nationality) : "",
			bio: artist.bio ? String(artist.bio) : "",
			instagram: links.instagram ?? "",
			spotify: links.spotify ?? "",
			youtube: links.youtube ?? "",
			imageUrl: artist.image_url ? String(artist.image_url) : "",
			isActive: Boolean(artist.is_active),
		});
		setShowForm(true);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const socialLinks = {
			...(form.instagram ? { instagram: form.instagram } : {}),
			...(form.spotify ? { spotify: form.spotify } : {}),
			...(form.youtube ? { youtube: form.youtube } : {}),
		};
		const bodyFields = {
			name: form.name,
			genre: form.genre,
			...(form.nationality ? { nationality: form.nationality } : {}),
			...(form.bio ? { bio: form.bio } : {}),
			...(Object.keys(socialLinks).length ? { socialLinks } : {}),
			...(form.imageUrl ? { imageUrl: form.imageUrl } : {}),
			isActive: form.isActive,
		};
		if (editId) {
			updateMutation.mutate({ id: editId, payload: bodyFields });
		} else {
			createMutation.mutate(bodyFields);
		}
	}

	const isBusy = createMutation.isPending || updateMutation.isPending;
	const inputCls =
		"w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40 placeholder:text-slate-400";

	const totalArtists = artists.length;
	const activeArtists = artists.filter((a) => Boolean(a.is_active)).length;
	const inactiveArtists = totalArtists - activeArtists;

	return (
		<div>
			{/* Header */}
			<div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
				<div>
					<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-semibold uppercase tracking-wider mb-3">
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
					className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm hover:bg-[#e04e27] transition-colors shadow-md shadow-[#FF5A30]/20"
				>
					<span className="material-symbols-outlined text-sm">add</span>
					{t("addArtist")}
				</button>
			</div>

			{/* Stats row */}
			{!isLoading && (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-[#FF5A30] text-xl">
								groups
							</span>
						</div>
						<div>
							<p className="text-2xl font-black text-slate-900 leading-none">
								{totalArtists}
							</p>
							<p className="text-xs text-slate-500 font-semibold mt-0.5">
								{t("stats.total")}
							</p>
						</div>
					</div>

					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-emerald-600 text-xl">
								verified
							</span>
						</div>
						<div>
							<p className="text-2xl font-black text-slate-900 leading-none">
								{activeArtists}
							</p>
							<p className="text-xs text-slate-500 font-semibold mt-0.5">
								{t("stats.active")}
							</p>
						</div>
					</div>

					<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-slate-400 text-xl">
								pause_circle
							</span>
						</div>
						<div>
							<p className="text-2xl font-black text-slate-900 leading-none">
								{inactiveArtists}
							</p>
							<p className="text-xs text-slate-500 font-semibold mt-0.5">
								{t("stats.inactive")}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Toast */}
			{toast && (
				<div
					className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl transition-all ${toast.ok ? "bg-emerald-500" : "bg-rose-500"}`}
				>
					{toast.msg}
				</div>
			)}

			{/* Artist grid */}
			{isLoading ? (
				<Loader />
			) : artists.length === 0 && !showForm ? (
				<div className="flex flex-col items-center justify-center py-24 text-on-surface-variant text-center">
					<span className="material-symbols-outlined text-5xl mb-4 text-slate-300">
						star_border
					</span>
					<p className="font-semibold text-lg">{t("noArtists")}</p>
					<p className="text-sm mt-1">{t("noArtistsHint")}</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
					{artists.map((artist) => {
						const links = (artist.social_links ?? {}) as SocialLinks;
						return (
							<div
								key={String(artist.id)}
								className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
							>
								<div className="flex items-start gap-3">
									{artist.image_url ? (
										<Image
											src={String(artist.image_url)}
											alt={String(artist.name)}
											width={56}
											height={56}
											className="w-14 h-14 rounded-xl object-cover shrink-0"
											unoptimized
										/>
									) : (
										<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF5A30]/20 to-orange-100 flex items-center justify-center shrink-0">
											<span className="material-symbols-outlined text-[#FF5A30] text-2xl">
												person
											</span>
										</div>
									)}
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-slate-900 truncate">
											{String(artist.name)}
										</p>
										<p className="text-xs text-slate-500">{String(artist.genre)}</p>
										{Boolean(artist.nationality) && (
											<p className="text-xs text-slate-400 mt-0.5">
												{String(artist.nationality)}
											</p>
										)}
									</div>
									<span
										className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${artist.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
									>
										{artist.is_active ? t("active") : t("inactive")}
									</span>
								</div>

								{Boolean(artist.bio) && (
									<p className="text-xs text-slate-500 line-clamp-2">
										{String(artist.bio)}
									</p>
								)}

								<div className="flex items-center gap-2 flex-wrap">
									{links.instagram && (
										<a
											href={`https://instagram.com/${links.instagram.replace("@", "")}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-pink-500 font-medium hover:underline"
										>
											Instagram
										</a>
									)}
									{links.spotify && (
										<a
											href={links.spotify}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-emerald-600 font-medium hover:underline"
										>
											Spotify
										</a>
									)}
									{links.youtube && (
										<a
											href={links.youtube}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-red-500 font-medium hover:underline"
										>
											YouTube
										</a>
									)}
								</div>

								<div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-50">
									<p className="text-[10px] text-slate-400 flex-1">
										{artist.created_at
											? format.relativeTime(new Date(String(artist.created_at)))
											: ""}
									</p>
									<button
										type="button"
										onClick={() => openEdit(artist)}
										className="text-xs text-[#FF5A30] font-semibold hover:underline"
									>
										{t("editArtist")}
									</button>
									<button
										type="button"
										onClick={() => setConfirmDeleteId(String(artist.id))}
										className="text-xs text-rose-500 font-semibold hover:underline"
									>
										{t("deleteArtist")}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Add/Edit form modal */}
			{showForm && (
				<div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
						<div className="flex items-center justify-between mb-5">
							<h2 className="font-(family-name:--font-manrope) text-xl font-black text-slate-900">
								{editId ? t("form.editTitle") : t("form.addTitle")}
							</h2>
							<button
								type="button"
								onClick={() => {
									setShowForm(false);
									setEditId(null);
									setForm(emptyForm);
								}}
								className="text-slate-400 hover:text-slate-700"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.name")} *
								</label>
								<input
									type="text"
									required
									value={form.name}
									onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
									placeholder={t("form.namePlaceholder")}
									className={inputCls}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.genre")} *
								</label>
								<input
									type="text"
									required
									value={form.genre}
									onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}
									placeholder={t("form.genrePlaceholder")}
									className={inputCls}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.nationality")}
								</label>
								<input
									type="text"
									value={form.nationality}
									onChange={(e) =>
										setForm((p) => ({ ...p, nationality: e.target.value }))
									}
									placeholder={t("form.nationalityPlaceholder")}
									className={inputCls}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.bio")}
								</label>
								<textarea
									rows={3}
									value={form.bio}
									onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
									placeholder={t("form.bioPlaceholder")}
									className={`${inputCls} resize-none`}
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-semibold text-slate-700 mb-1">
										{t("form.instagram")}
									</label>
									<input
										type="text"
										value={form.instagram}
										onChange={(e) =>
											setForm((p) => ({ ...p, instagram: e.target.value }))
										}
										placeholder={t("form.instagramPlaceholder")}
										className={inputCls}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold text-slate-700 mb-1">
										{t("form.spotify")}
									</label>
									<input
										type="text"
										value={form.spotify}
										onChange={(e) =>
											setForm((p) => ({ ...p, spotify: e.target.value }))
										}
										placeholder={t("form.spotifyPlaceholder")}
										className={inputCls}
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.youtube")}
								</label>
								<input
									type="text"
									value={form.youtube}
									onChange={(e) => setForm((p) => ({ ...p, youtube: e.target.value }))}
									placeholder={t("form.youtubePlaceholder")}
									className={inputCls}
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold text-slate-700 mb-1">
									{t("form.imageUrl")}
								</label>
								<input
									type="url"
									value={form.imageUrl}
									onChange={(e) =>
										setForm((p) => ({ ...p, imageUrl: e.target.value }))
									}
									placeholder={t("form.imageUrlPlaceholder")}
									className={inputCls}
								/>
							</div>

							<label className="flex items-center gap-3 cursor-pointer">
								<button
									type="button"
									role="switch"
									aria-checked={form.isActive}
									onClick={() =>
										setForm((p) => ({ ...p, isActive: !p.isActive }))
									}
									className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-[#FF5A30]" : "bg-slate-300"}`}
								>
									<span
										className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-4" : ""}`}
									/>
								</button>
								<span className="text-sm font-medium text-slate-700">
									{t("form.isActive")}
								</span>
							</label>

							<div className="flex gap-3 mt-2">
								<button
									type="submit"
									disabled={isBusy}
									className="flex-1 py-3 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm hover:bg-[#e04e27] disabled:opacity-60 transition-colors"
								>
									{isBusy ? t("form.saving") : t("form.save")}
								</button>
								<button
									type="button"
									onClick={() => {
										setShowForm(false);
										setEditId(null);
										setForm(emptyForm);
									}}
									className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
								>
									{t("form.cancel")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete confirm dialog */}
			{confirmDeleteId && (
				<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
					<div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
						<span className="material-symbols-outlined text-rose-500 text-4xl mb-3 block">
							delete_forever
						</span>
						<p className="font-semibold text-slate-900 mb-4">{t("confirmDelete")}</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									deleteMutation.mutate(confirmDeleteId);
									setConfirmDeleteId(null);
								}}
								className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors"
							>
								{t("deleteArtist")}
							</button>
							<button
								type="button"
								onClick={() => setConfirmDeleteId(null)}
								className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
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
