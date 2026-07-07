"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type SearchResult, searchDashboard } from "@/app/actions";
import { Link } from "@/i18n/routing";

const CATEGORY_LABELS: Record<SearchResult["category"], string> = {
	tour: "Tour",
	eoi: "EOI",
	financing: "Financing",
	venue: "Venue",
};

const CATEGORY_COLORS: Record<SearchResult["category"], string> = {
	tour: "bg-primary/10 text-primary",
	eoi: "bg-status-contacted/10 text-status-contacted",
	financing: "bg-status-approved/10 text-status-approved",
	venue: "bg-status-booked/10 text-status-booked",
};

function SearchModal({ onClose }: { onClose: () => void }) {
	const t = useTranslations("GlobalSearch");
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const [term, setTerm] = useState("");
	const [debouncedTerm, setDebouncedTerm] = useState("");
	const [activeIdx, setActiveIdx] = useState(0);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const id = setTimeout(() => setDebouncedTerm(term), 320);
		return () => clearTimeout(id);
	}, [term]);

	useEffect(() => {
		setActiveIdx(0);
	}, [debouncedTerm]);

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	const { data: results = [], isFetching } = useQuery({
		queryKey: ["global-search", debouncedTerm],
		queryFn: () => searchDashboard(debouncedTerm),
		enabled: debouncedTerm.length >= 2,
		staleTime: 30_000,
	});

	function onKeyDown(e: React.KeyboardEvent) {
		if (results.length === 0) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIdx((i) => Math.min(i + 1, results.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIdx((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const r = results[activeIdx];
			if (r) {
				router.push(r.href as `/${string}`);
				onClose();
			}
		}
	}

	const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
		(acc[r.category] ??= []).push(r);
		return acc;
	}, {});

	const showEmpty = debouncedTerm.length >= 2 && !isFetching && results.length === 0;
	const showHint = debouncedTerm.length < 2 && !isFetching;

	let globalIdx = 0;

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
			<div className="relative z-10 w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
				{/* Input row */}
				<div className="flex items-center gap-3 px-4 py-4 border-b border-outline-variant/20">
					<span
						className={`material-symbols-outlined text-xl transition-colors ${isFetching ? "text-primary" : "text-on-surface-variant"}`}
					>
						{isFetching ? "progress_activity" : "search"}
					</span>
					<input
						ref={inputRef}
						type="text"
						value={term}
						onChange={(e) => setTerm(e.target.value)}
						onKeyDown={onKeyDown}
						placeholder={t("placeholder")}
						className="flex-1 text-base text-on-surface placeholder:text-on-surface-variant outline-none bg-transparent"
						aria-label={t("placeholder")}
						autoComplete="off"
					/>
					{term && (
						<button
							type="button"
							onClick={() => setTerm("")}
							className="text-on-surface-variant hover:text-on-surface transition-colors"
							aria-label={t("clear")}
						>
							<span className="material-symbols-outlined text-lg">close</span>
						</button>
					)}
					<kbd
						className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-outline-variant/30 text-[11px] font-mono text-on-surface-variant cursor-pointer hover:bg-surface-container-low"
						onClick={onClose}
					>
						Esc
					</kbd>
				</div>

				{/* Results */}
				<div ref={listRef} className="overflow-y-auto flex-1">
					{showHint && (
						<div className="flex flex-col items-center justify-center py-14 gap-3 text-on-surface-variant">
							<span className="material-symbols-outlined text-4xl">manage_search</span>
							<p className="text-sm font-medium">{t("typeToSearch")}</p>
							<p className="text-xs">{t("hint")}</p>
						</div>
					)}

					{showEmpty && (
						<div className="flex flex-col items-center justify-center py-14 gap-3 text-on-surface-variant">
							<span className="material-symbols-outlined text-4xl">search_off</span>
							<p className="text-sm font-medium">{t("noResults", { term: debouncedTerm })}</p>
						</div>
					)}

					{Object.entries(grouped).map(([category, items]) => (
						<div key={category}>
							<p className="px-4 pt-4 pb-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
								{CATEGORY_LABELS[category as SearchResult["category"]]}
							</p>
							{items.map((result) => {
								const idx = globalIdx++;
								const isActive = idx === activeIdx;
								return (
									<Link
										key={result.id + result.href}
										href={result.href as `/${string}`}
										onClick={onClose}
										onMouseEnter={() => setActiveIdx(idx)}
										className={`flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? "bg-surface-container-low" : "hover:bg-surface-container-low"}`}
									>
										<span
											className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${CATEGORY_COLORS[result.category as SearchResult["category"]]}`}
										>
											<span className="material-symbols-outlined text-sm">
												{result.icon}
											</span>
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-on-surface truncate">
												{result.title}
											</p>
											{result.subtitle && (
												<p className="text-xs text-on-surface-variant truncate">
													{result.subtitle}
												</p>
											)}
										</div>
										<span
											className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[result.category as SearchResult["category"]]}`}
										>
											{CATEGORY_LABELS[result.category as SearchResult["category"]]}
										</span>
									</Link>
								);
							})}
						</div>
					))}
				</div>

				{/* Footer */}
				<div className="border-t border-outline-variant/20 px-4 py-2.5 flex items-center gap-4 text-[11px] text-on-surface-variant">
					<span className="flex items-center gap-1">
						<kbd className="px-1.5 py-0.5 rounded border border-outline-variant/30 font-mono">↑↓</kbd>
						{t("keyNavigate")}
					</span>
					<span className="flex items-center gap-1">
						<kbd className="px-1.5 py-0.5 rounded border border-outline-variant/30 font-mono">↵</kbd>
						{t("keySelect")}
					</span>
					<span className="flex items-center gap-1">
						<kbd className="px-1.5 py-0.5 rounded border border-outline-variant/30 font-mono">Esc</kbd>
						{t("keyClose")}
					</span>
				</div>
			</div>
		</div>
	);
}

export default function GlobalSearch() {
	const t = useTranslations("GlobalSearch");
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
				className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/80 hover:bg-surface-container transition-colors text-sm text-on-surface-variant min-w-52"
			>
				<span className="material-symbols-outlined text-base leading-none">search</span>
				<span className="flex-1 text-left text-[13px]">{t("placeholder")}</span>
				<kbd className="flex items-center gap-0.5 text-[10px] font-mono border border-outline-variant/40 rounded px-1 py-0.5 text-on-surface-variant">
					<span>⌘</span>K
				</kbd>
			</button>

			{/* Mobile: icon only */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label={t("openSearch")}
				className="lg:hidden p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95"
			>
				<span className="material-symbols-outlined text-on-surface-variant">search</span>
			</button>

			{open && createPortal(
				<SearchModal onClose={() => setOpen(false)} />,
				document.body,
			)}
		</>
	);
}
