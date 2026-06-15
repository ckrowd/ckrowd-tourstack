"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getRosterArtists } from "@/app/actions";

type RosterArtist = {
	id: unknown;
	name: unknown;
	genre: unknown;
	nationality?: unknown;
	image_url?: unknown;
	is_active?: unknown;
};

function ArtmgmtSearchModal({ onClose }: { onClose: () => void }) {
	const t = useTranslations("ArtmgmtSearch");
	const inputRef = useRef<HTMLInputElement>(null);
	const [term, setTerm] = useState("");

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	const { data: artists = [], isFetching } = useQuery({
		queryKey: ["roster-artists"],
		queryFn: getRosterArtists,
		select: (r) => (r.data ?? []) as RosterArtist[],
	});

	const filtered =
		term.length >= 1
			? artists.filter((a) => {
					const q = term.toLowerCase();
					return (
						String(a.name ?? "").toLowerCase().includes(q) ||
						String(a.genre ?? "").toLowerCase().includes(q) ||
						String(a.nationality ?? "").toLowerCase().includes(q)
					);
				})
			: artists;

	return (
		<div
			className="fixed inset-0 z-[60] flex flex-col items-center pt-[8vh] px-4 pb-8"
			aria-modal="true"
			role="dialog"
			aria-label={t("dialogLabel")}
		>
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-label={t("close")}
			/>

			{/* Card */}
			<div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
				{/* Input */}
				<div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
					<span
						className={`material-symbols-outlined text-xl transition-colors ${isFetching ? "text-[#FF5A30]" : "text-slate-400"}`}
					>
						{isFetching ? "progress_activity" : "search"}
					</span>
					<input
						ref={inputRef}
						type="text"
						value={term}
						onChange={(e) => setTerm(e.target.value)}
						placeholder={t("placeholder")}
						className="flex-1 text-base text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
						aria-label={t("placeholder")}
						autoComplete="off"
					/>
					{term && (
						<button
							type="button"
							onClick={() => setTerm("")}
							className="text-slate-400 hover:text-slate-600 transition-colors"
							aria-label={t("clear")}
						>
							<span className="material-symbols-outlined text-lg">close</span>
						</button>
					)}
					<kbd
						className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-slate-200 text-[11px] font-mono text-slate-500 cursor-pointer hover:bg-slate-50"
						onClick={onClose}
					>
						Esc
					</kbd>
				</div>

				{/* Results */}
				<div className="overflow-y-auto flex-1">
					{term.length < 1 ? (
						<div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
							<span className="material-symbols-outlined text-4xl">
								manage_search
							</span>
							<p className="text-sm font-medium">{t("typeToSearch")}</p>
							<p className="text-xs">{t("hint")}</p>
						</div>
					) : filtered.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
							<span className="material-symbols-outlined text-4xl">
								search_off
							</span>
							<p className="text-sm font-medium">
								{t("noResults", { term })}
							</p>
						</div>
					) : (
						<div>
							<p className="px-4 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
								{t("artistsLabel")}
							</p>
							{filtered.map((artist) => (
								<div
									key={String(artist.id)}
									className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
								>
									<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A30]/20 to-orange-100 flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-[#FF5A30] text-base">
											person
										</span>
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-semibold text-slate-900 truncate">
											{String(artist.name)}
										</p>
										<p className="text-xs text-slate-500 truncate">
											{String(artist.genre ?? "")}
											{artist.nationality
												? ` · ${String(artist.nationality)}`
												: ""}
										</p>
									</div>
									<span
										className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${artist.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
									>
										{artist.is_active ? t("active") : t("inactive")}
									</span>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-slate-100 px-4 py-2.5 flex items-center gap-2 text-[11px] text-slate-400">
					<kbd className="px-1.5 py-0.5 rounded border border-slate-200 font-mono">
						Esc
					</kbd>
					<span>{t("keyClose")}</span>
				</div>
			</div>
		</div>
	);
}

export default function ArtmgmtSearch() {
	const t = useTranslations("ArtmgmtSearch");
	const [open, setOpen] = useState(false);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	return (
		<>
			{/* Desktop: pill trigger */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={t("openSearch")}
				className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-colors text-sm text-slate-400 min-w-52"
			>
				<span className="material-symbols-outlined text-base leading-none">
					search
				</span>
				<span className="flex-1 text-left text-[13px]">{t("placeholder")}</span>
				<kbd className="flex items-center gap-0.5 text-[10px] font-mono border border-slate-300 rounded px-1 py-0.5 text-slate-400">
					<span>⌘</span>K
				</kbd>
			</button>

			{/* Mobile: icon only */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={t("openSearch")}
				className="lg:hidden p-2 hover:bg-slate-50/50 rounded-lg transition-all active:scale-95"
			>
				<span className="material-symbols-outlined text-[#494455]">search</span>
			</button>

			{open &&
				createPortal(
					<ArtmgmtSearchModal onClose={() => setOpen(false)} />,
					document.body,
				)}
		</>
	);
}
