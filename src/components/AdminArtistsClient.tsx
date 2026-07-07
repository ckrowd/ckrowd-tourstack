"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import {
	approveRosterArtist,
	getAdminArtists,
	getAdminRosterArtists,
	rejectRosterArtist,
} from "@/app/actions";
import ArtistActionsMenu from "@/components/ArtistActionsMenu";
import PageTour from "@/components/PageTour";

type Tab = "submissions" | "published";
type StatusFilter = "all" | "pending" | "approved" | "rejected";

type SocialLinks = {
	instagram?: string;
	spotify?: string;
	youtube?: string;
	twitter?: string;
};

type RosterSubmission = {
	id: unknown;
	name: unknown;
	genre: unknown;
	nationality?: unknown;
	bio?: unknown;
	social_links?: unknown;
	image_url?: unknown;
	is_active?: unknown;
	status?: unknown;
	created_at?: unknown;
	manager_name?: unknown;
	manager_company?: unknown;
};

type AdminArtist = {
	id: unknown;
	name: unknown;
	genre: unknown;
	tour_name?: unknown;
	tour_start?: unknown;
	tour_end?: unknown;
	fee_min?: unknown;
	fee_max?: unknown;
	markets?: unknown;
	region?: unknown;
	tour_window?: unknown;
	is_trending?: unknown;
	is_active?: unknown;
	image_url?: unknown;
};

function statusStyle(status: unknown) {
	if (status === "approved")
		return "bg-emerald-100 text-emerald-700";
	if (status === "rejected")
		return "bg-red-100 text-red-600";
	return "bg-amber-100 text-amber-700";
}

export default function AdminArtistsClient() {
	const t = useTranslations("AdminArtistsPage");
	const format = useFormatter();
	const qc = useQueryClient();
	const [tab, setTab] = useState<Tab>("submissions");
	const [filter, setFilter] = useState<StatusFilter>("all");
	const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

	function showToast(msg: string, ok: boolean) {
		setToast({ msg, ok });
		setTimeout(() => setToast(null), 3500);
	}

	const submissionsQuery = useQuery({
		queryKey: ["admin-roster-artists"],
		queryFn: () => getAdminRosterArtists(),
		select: (r) => (r.data ?? []) as RosterSubmission[],
	});

	const publishedQuery = useQuery({
		queryKey: ["admin-published-artists"],
		queryFn: () => getAdminArtists(),
		select: (r) => (r.data ?? []) as AdminArtist[],
		enabled: tab === "published",
	});

	const approveMutation = useMutation({
		mutationFn: (id: string) => approveRosterArtist(id),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["admin-roster-artists"] });
				showToast(t("submissions.approveSuccess"), true);
			} else {
				showToast(result.error ?? t("submissions.approveError"), false);
			}
		},
		onError: () => showToast(t("submissions.approveError"), false),
	});

	const rejectMutation = useMutation({
		mutationFn: (id: string) => rejectRosterArtist(id),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["admin-roster-artists"] });
				showToast(t("submissions.rejectSuccess"), true);
			} else {
				showToast(result.error ?? t("submissions.rejectError"), false);
			}
		},
		onError: () => showToast(t("submissions.rejectError"), false),
	});

	const submissions = submissionsQuery.data ?? [];
	const pending = submissions.filter((a) => !a.status || a.status === "pending");
	const approved = submissions.filter((a) => a.status === "approved");
	const rejected = submissions.filter((a) => a.status === "rejected");

	const filtered =
		filter === "pending"
			? pending
			: filter === "approved"
				? approved
				: filter === "rejected"
					? rejected
					: submissions;

	const published = publishedQuery.data ?? [];

	const FILTERS: { key: StatusFilter; label: string; count: number }[] = [
		{ key: "all", label: t("submissions.filterAll"), count: submissions.length },
		{ key: "pending", label: t("submissions.filterPending"), count: pending.length },
		{ key: "approved", label: t("submissions.filterApproved"), count: approved.length },
		{ key: "rejected", label: t("submissions.filterRejected"), count: rejected.length },
	];

	return (
		<>
			<PageTour pageId="admin-artists" />
			{/* Header */}
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant font-medium">{t("description")}</p>
				</div>
			</div>

			{/* Tabs */}
			<div data-tour="admin-artists-tabs" className="flex gap-1 mb-6 bg-surface-container-low rounded-xl p-1 w-fit">
				{(["submissions", "published"] as Tab[]).map((t2) => (
					<button
						key={t2}
						type="button"
						onClick={() => setTab(t2)}
						className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
							tab === t2
								? "bg-surface text-on-surface shadow-sm"
								: "text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{t2 === "submissions" ? t("tabSubmissions") : t("tabPublished")}
					</button>
				))}
			</div>

			{/* ── Submissions tab ─────────────────────────────────────── */}
			{tab === "submissions" && (
				<div data-tour="admin-artists-list">
					{/* Stats */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						{[
							{ label: t("submissions.total"), value: submissions.length, icon: "groups", color: "text-[#FF5A2E]", bg: "bg-[#FF5A2E]/10" },
							{ label: t("submissions.pending"), value: pending.length, icon: "schedule", color: "text-amber-600", bg: "bg-amber-50" },
							{ label: t("submissions.approved"), value: approved.length, icon: "check_circle", color: "text-emerald-600", bg: "bg-emerald-50" },
							{ label: t("submissions.rejected"), value: rejected.length, icon: "cancel", color: "text-red-500", bg: "bg-red-50" },
						].map((s) => (
							<div
								key={s.label}
								className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex items-center gap-3"
							>
								<div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
									<span className={`material-symbols-outlined text-xl ${s.color}`}>
										{s.icon}
									</span>
								</div>
								<div>
									<p className="text-2xl font-black text-on-surface leading-none">{s.value}</p>
									<p className="text-xs text-on-surface-variant font-semibold mt-0.5">{s.label}</p>
								</div>
							</div>
						))}
					</div>

					{/* Filter bar */}
					<div className="flex flex-wrap gap-2 mb-5">
						{FILTERS.map((f) => (
							<button
								key={f.key}
								type="button"
								onClick={() => setFilter(f.key)}
								className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
									filter === f.key
										? "bg-[#FF5A2E] text-white"
										: "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
								}`}
							>
								{f.label}
								<span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === f.key ? "bg-white/20" : "bg-surface-container"}`}>
									{f.count}
								</span>
							</button>
						))}
					</div>

					{/* Artist submission cards */}
					{submissionsQuery.isLoading ? (
						<div className="py-16 flex justify-center">
							<span className="material-symbols-outlined animate-spin text-3xl text-[#FF5A2E]">progress_activity</span>
						</div>
					) : filtered.length === 0 ? (
						<div className="bg-surface-container-lowest rounded-2xl p-14 text-center shadow-sm">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">album</span>
							<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg mb-1">
								{filter === "all" ? t("submissions.noSubmissions") : t("submissions.noFiltered")}
							</p>
							<p className="text-on-surface-variant text-sm">{t("submissions.noSubmissionsDesc")}</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{filtered.map((artist): React.ReactNode => {
								const links = (artist.social_links ?? {}) as SocialLinks;
								const status = String(artist.status ?? "pending");
								const isPending = !artist.status || artist.status === "pending";
								const isBusy =
									approveMutation.isPending || rejectMutation.isPending;

								return (
									<div
										key={String(artist.id)}
										className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col"
									>
										{/* Photo header */}
										<div className="h-32 relative bg-surface-container-high shrink-0">
											{Boolean(artist.image_url) ? (
												<Image
													src={String(artist.image_url)}
													alt={String(artist.name ?? "")}
													fill
													className="object-cover"
													unoptimized
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<span className="material-symbols-outlined text-4xl text-on-surface-variant">
														person
													</span>
												</div>
											)}
											<div className="absolute top-2 left-2">
												<span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusStyle(artist.status)}`}>
													{status === "approved"
														? t("submissions.statusApproved")
														: status === "rejected"
															? t("submissions.statusRejected")
															: t("submissions.statusPending")}
												</span>
											</div>
										</div>

										{/* Body */}
										<div className="p-4 flex flex-col gap-3 flex-1">
											{/* Artist info */}
											<div>
												<p className="font-(family-name:--font-manrope) font-extrabold text-on-surface">
													{String(artist.name ?? "")}
												</p>
												<div className="flex items-center gap-2 mt-0.5 flex-wrap">
													<span className="text-xs text-on-surface-variant">{String(artist.genre ?? "")}</span>
													{Boolean(artist.nationality) && (
														<>
															<span className="text-outline-variant">·</span>
															<span className="text-xs text-on-surface-variant">{String(artist.nationality)}</span>
														</>
													)}
												</div>
											</div>

											{/* Bio */}
											{Boolean(artist.bio) && (
												<p className="text-xs text-on-surface-variant line-clamp-2">
													{String(artist.bio)}
												</p>
											)}

											{/* Social links */}
											{(links.instagram || links.spotify || links.youtube) && (
												<div className="flex items-center gap-2 flex-wrap">
													{links.instagram && (
														<a
															href={`https://instagram.com/${links.instagram.replace("@", "")}`}
															target="_blank"
															rel="noopener noreferrer"
															className="text-[11px] text-pink-500 font-semibold hover:underline"
														>
															Instagram
														</a>
													)}
													{links.spotify && (
														<a
															href={links.spotify}
															target="_blank"
															rel="noopener noreferrer"
															className="text-[11px] text-emerald-600 font-semibold hover:underline"
														>
															Spotify
														</a>
													)}
													{links.youtube && (
														<a
															href={links.youtube}
															target="_blank"
															rel="noopener noreferrer"
															className="text-[11px] text-red-500 font-semibold hover:underline"
														>
															YouTube
														</a>
													)}
												</div>
											)}

											{/* Manager attribution */}
											<div className="mt-auto pt-3 border-t border-outline-variant/10 flex items-center gap-2">
												<div className="w-7 h-7 rounded-full bg-[#FF5A2E]/10 flex items-center justify-center shrink-0">
													<span className="material-symbols-outlined text-sm text-[#FF5A2E]">manage_accounts</span>
												</div>
												<div className="min-w-0">
													<p className="text-[11px] font-semibold text-on-surface truncate">
														{artist.manager_company ? String(artist.manager_company) : "—"}
													</p>
													<p className="text-[10px] text-on-surface-variant truncate">
														{t("submissions.submittedBy")}{" "}
														{artist.manager_name ? String(artist.manager_name) : "—"}
													</p>
												</div>
												{Boolean(artist.created_at) && (
													<p className="text-[10px] text-on-surface-variant ml-auto shrink-0">
														{format.relativeTime(new Date(String(artist.created_at)))}
													</p>
												)}
											</div>

											{/* Approve / Reject — only for pending */}
											{isPending && (
												<div className="flex gap-2 pt-1">
													<button
														type="button"
														disabled={isBusy}
														onClick={() => approveMutation.mutate(String(artist.id))}
														className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-60 transition-colors"
													>
														<span className="material-symbols-outlined text-sm">check_circle</span>
														{t("submissions.approveBtn")}
													</button>
													<button
														type="button"
														disabled={isBusy}
														onClick={() => rejectMutation.mutate(String(artist.id))}
														className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
													>
														<span className="material-symbols-outlined text-sm">cancel</span>
														{t("submissions.rejectBtn")}
													</button>
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* ── Published tab ───────────────────────────────────────── */}
			{tab === "published" && (
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
							{t("allArtists")}
						</h3>
						<p className="text-sm text-on-surface-variant">
							{t("projectCount", { count: published.length })}
						</p>
					</div>

					{publishedQuery.isLoading ? (
						<div className="py-16 flex justify-center">
							<span className="material-symbols-outlined animate-spin text-3xl text-[#FF5A2E]">progress_activity</span>
						</div>
					) : published.length === 0 ? (
						<div className="bg-surface-container-low rounded-2xl p-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">album</span>
							<p className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg mb-2">{t("noArtists")}</p>
							<p className="text-on-surface-variant text-sm">{t("noArtistsDesc")}</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{published.map((artist) => {
								const isActive = Boolean(artist.is_active);
								const markets = Array.isArray(artist.markets)
									? (artist.markets as string[]).join(", ")
									: String(artist.markets ?? "");

								return (
									<div
										key={String(artist.id)}
										className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-md transition-shadow"
									>
										<div className="h-36 relative bg-surface-container-high">
											{Boolean(artist.image_url) ? (
												<Image
													src={String(artist.image_url)}
													alt={String(artist.name ?? "")}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<span className="material-symbols-outlined text-4xl text-on-surface-variant">album</span>
												</div>
											)}
											<div className="absolute top-3 left-3">
												<span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
													{isActive ? t("active") : t("inactive")}
												</span>
											</div>
											<div className="absolute top-2 right-2">
												<ArtistActionsMenu
													artistId={String(artist.id)}
													initial={{
														name: String(artist.name ?? ""),
														genre: String(artist.genre ?? ""),
														tourName: String(artist.tour_name ?? ""),
														tourStart: artist.tour_start ? String(artist.tour_start) : undefined,
														tourEnd: artist.tour_end ? String(artist.tour_end) : undefined,
														feeMin: artist.fee_min != null ? Number(artist.fee_min) : null,
														feeMax: artist.fee_max != null ? Number(artist.fee_max) : null,
														region: String(artist.region ?? ""),
														markets: Array.isArray(artist.markets) ? (artist.markets as string[]) : [],
														isActive,
														isTrending: Boolean(artist.is_trending),
													}}
												/>
											</div>
										</div>

										<div className="p-4">
											<p className="font-(family-name:--font-manrope) font-extrabold text-on-surface truncate">
												{String(artist.name ?? "")}
											</p>
											<p className="text-xs text-on-surface-variant mt-0.5 truncate">
												{String(artist.tour_name ?? "")}
											</p>
											<div className="mt-3 space-y-1.5">
												<div className="flex items-center gap-1.5 text-on-surface-variant">
													<span className="material-symbols-outlined text-sm">music_note</span>
													<span className="text-xs font-medium">{String(artist.genre ?? "")}</span>
												</div>
												{markets && (
													<div className="flex items-center gap-1.5 text-on-surface-variant">
														<span className="material-symbols-outlined text-sm">location_on</span>
														<span className="text-xs font-medium truncate">{markets}</span>
													</div>
												)}
												<div className="flex items-center gap-1.5 text-on-surface-variant">
													<span className="material-symbols-outlined text-sm">event</span>
													<span className="text-xs font-medium">{String(artist.tour_window ?? "")}</span>
												</div>
												<div className="flex items-center gap-1.5 text-on-surface-variant">
													<span className="material-symbols-outlined text-sm">monetization_on</span>
													<span className="text-xs font-medium">
														{artist.fee_min != null && artist.fee_max != null
															? `$${Math.round(Number(artist.fee_min) / 1000)}k – $${Math.round(Number(artist.fee_max) / 1000)}k`
															: "—"}
													</span>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* Toast */}
			{toast && (
				<div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${toast.ok ? "bg-emerald-500" : "bg-rose-500"}`}>
					{toast.msg}
				</div>
			)}
		</>
	);
}
