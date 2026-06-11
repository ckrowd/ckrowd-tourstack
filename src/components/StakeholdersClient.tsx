"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import Loader from "@/components/Loader";
import {
	createOnboardingLink,
	exportStakeholders,
	getOnboardingLinks,
	getStakeholders,
	type StakeholderSubmission,
} from "@/app/actions";

const CATEGORIES = ["service", "workforce", "artmgmt"] as const;

function humanizeLabel(value: string): string {
	return value
		.replace(/_/g, " ")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown, formatBoolean?: (v: boolean) => string): string {
	if (value == null || value === "") return "—";
	if (Array.isArray(value)) {
		return value.length
			? value.map((v) => humanizeLabel(String(v))).join(", ")
			: "—";
	}
	if (typeof value === "boolean") return formatBoolean ? formatBoolean(value) : String(value);
	if (typeof value === "object") return JSON.stringify(value);
	return humanizeLabel(String(value));
}

function SubmissionRow({
	submission,
	onOpen,
}: {
	submission: StakeholderSubmission;
	onOpen: () => void;
}) {
	const format = useFormatter();
	return (
		<button
			type="button"
			onClick={onOpen}
			className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
		>
			<div className="min-w-0">
				<p className="text-sm font-bold text-on-surface truncate">
					{submission.name}
				</p>
				<p className="text-xs text-on-surface-variant truncate">
					{submission.email} · <span className="capitalize">{submission.category.replace(/_/g, " ")}</span>
				</p>
			</div>
			<div className="flex items-center gap-3 shrink-0">
				<span className="text-[10px] text-on-surface-variant">
					{format.dateTime(new Date(submission.submitted_at), {
						dateStyle: "medium",
					})}
				</span>
				<span className="material-symbols-outlined text-on-surface-variant text-base">
					chevron_right
				</span>
			</div>
		</button>
	);
}

function SubmissionModal({
	submission,
	onClose,
}: {
	submission: StakeholderSubmission;
	onClose: () => void;
}) {
	const t = useTranslations("StakeholdersPage");
	const format = useFormatter();

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);

	const extra = submission.extra_data ?? {};
	const baseRows: [string, string | null][] = [
		[t("submissions.email"), submission.email],
		[t("submissions.phone"), submission.phone],
		[t("submissions.company"), submission.company],
		[t("submissions.country"), submission.country],
	];
	const proofFileId =
		typeof extra.proofFileId === "string" ? extra.proofFileId : null;
	const proofFileName =
		typeof extra.proofFileName === "string"
			? extra.proofFileName
			: t("submissions.attachedFile");
	const hiddenExtraKeys = new Set(["proofFileId", "proofFileName"]);

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			<button
				type="button"
				aria-label={t("submissions.close")}
				onClick={onClose}
				className="absolute inset-0 bg-black/40 cursor-default border-none"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={submission.name}
				className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl"
			>
				<div className="sticky top-0 flex items-start justify-between gap-3 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-lowest">
					<div className="min-w-0">
						<h3 className="font-(family-name:--font-manrope) font-bold text-on-surface truncate">
							{submission.name}
						</h3>
						<p className="text-xs text-on-surface-variant capitalize">
							{submission.category.replace(/_/g, " ")}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label={t("submissions.close")}
						className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>
				<div className="px-6 py-5">
					<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
						{t("submissions.submittedOn")}{" "}
						{format.dateTime(new Date(submission.submitted_at), {
							dateStyle: "medium",
							timeStyle: "short",
						})}
					</p>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
						{baseRows.map(([rowLabel, value]) => (
							<div key={rowLabel} className="min-w-0">
								<dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
									{rowLabel}
								</dt>
								<dd className="text-sm text-on-surface break-words">
									{value ? value : "—"}
								</dd>
							</div>
						))}
						{Object.entries(extra)
							.filter(([key]) => !hiddenExtraKeys.has(key))
							.map(([key, value]) => (
								<div key={key} className="min-w-0">
									<dt className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
										{humanizeLabel(key)}
									</dt>
									<dd className="text-sm text-on-surface break-words">
										{formatValue(value, (v) => v ? t("yes") : t("no"))}
									</dd>
								</div>
							))}
					</dl>
					{proofFileId && (
						<div className="mt-6 rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 flex items-center gap-3">
							<span className="material-symbols-outlined text-[#FF5A30] shrink-0">
								attach_file
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
									{t("submissions.proofFile")}
								</p>
								<p className="text-sm text-on-surface truncate">{proofFileName}</p>
							</div>
							<a
								href={`/api/download/${encodeURIComponent(proofFileId)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FF5A30] text-white text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
							>
								<span className="material-symbols-outlined text-sm">download</span>
								{t("submissions.download")}
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function StakeholdersClient() {
	const t = useTranslations("StakeholdersPage");
	const locale = useLocale();
	const queryClient = useQueryClient();
	const [categoryFilter, setCategoryFilter] = useState<"all" | (typeof CATEGORIES)[number]>("all");
	const [selectedSubmission, setSelectedSubmission] =
		useState<StakeholderSubmission | null>(null);
	const [copied, setCopied] = useState(false);

	const closeModal = useCallback(() => setSelectedSubmission(null), []);

	const linksQuery = useQuery({
		queryKey: ["onboardingLinks"],
		queryFn: getOnboardingLinks,
	});

	const stakeholdersQuery = useQuery({
		queryKey: ["stakeholders"],
		queryFn: () => getStakeholders(),
	});

	const generateEcosystemMutation = useMutation({
		mutationFn: async (missing: (typeof CATEGORIES)[number][]) => {
			return Promise.all(missing.map((cat) => createOnboardingLink({ category: cat })));
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["onboardingLinks"] });
		},
	});

	const exportMutation = useMutation({
		mutationFn: () => exportStakeholders("csv"),
		onSuccess: (result) => {
			if (!result.success || !result.data) return;
			const blob = new Blob(
				[
					typeof result.data === "string"
						? result.data
						: JSON.stringify(result.data),
				],
				{ type: "text/csv" },
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "stakeholders.csv";
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}, 100);
		},
	});

	const links = linksQuery.data?.success ? (linksQuery.data.data ?? []) : [];
	const submissions = stakeholdersQuery.data?.data ?? [];

	const serviceToken = links.find((l) => l.category === "service" && l.is_active)?.token;
	const workforceToken = links.find((l) => l.category === "workforce" && l.is_active)?.token;
	const artmgmtToken = links.find((l) => l.category === "artmgmt" && l.is_active)?.token;

	const universalUrl =
		serviceToken && workforceToken && artmgmtToken && typeof window !== "undefined"
			? `${window.location.origin}/${locale}/join?s=${String(serviceToken)}&w=${String(workforceToken)}&a=${String(artmgmtToken)}`
			: null;

	const missingCategories = (["service", "workforce", "artmgmt"] as const).filter(
		(cat) => !links.some((l) => l.category === cat && l.is_active),
	);

	async function handleCopyUniversalUrl() {
		if (!universalUrl) return;
		await navigator.clipboard.writeText(universalUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const filtered =
		categoryFilter === "all"
			? submissions
			: submissions.filter((s) => s.category === categoryFilter);

	return (
		<>
			<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
				<div className="w-full space-y-10">

					{/* Header */}
					<header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
						<div>
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
								{t("header.platform")}
							</span>
							<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								{t("header.title")}
							</h1>
							<p className="text-on-surface-variant font-medium">
								{t("header.description")}
							</p>
						</div>
						<button
							type="button"
							onClick={() => exportMutation.mutate()}
							disabled={exportMutation.isPending}
							className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 shrink-0"
						>
							<span className="material-symbols-outlined text-sm">download</span>
							{exportMutation.isPending ? t("header.exporting") : t("header.export")}
						</button>
					</header>

					{/* ── Invite Ecosystem banner ──────────────────────────────── */}
					<section className="rounded-2xl overflow-hidden shadow-md">
						<div className="bg-gradient-to-r from-[#FF5A30] to-[#cc4826] p-6 text-white">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-white">share</span>
									</div>
									<div>
										<h2 className="font-(family-name:--font-manrope) text-lg font-extrabold mb-1">
											{t("inviteEcosystem.title")}
										</h2>
										<p className="text-sm text-white/80">
											{t("inviteEcosystem.description")}
										</p>
									</div>
								</div>
								<div className="shrink-0">
									{universalUrl ? (
										<button
											type="button"
											onClick={() => { void handleCopyUniversalUrl(); }}
											className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#FF5A30] rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
										>
											<span className="material-symbols-outlined text-sm">
												{copied ? "check" : "content_copy"}
											</span>
											{copied ? t("inviteEcosystem.copied") : t("inviteEcosystem.copyLink")}
										</button>
									) : (
										<button
											type="button"
											disabled={generateEcosystemMutation.isPending || linksQuery.isLoading}
											onClick={() => generateEcosystemMutation.mutate(missingCategories)}
											className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#FF5A30] rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-sm disabled:opacity-60"
										>
											<span className="material-symbols-outlined text-sm">
												{generateEcosystemMutation.isPending ? "pending" : "link"}
											</span>
											{generateEcosystemMutation.isPending
												? t("inviteEcosystem.generating")
												: t("inviteEcosystem.generateAll")}
										</button>
									)}
								</div>
							</div>
							{universalUrl && (
								<div className="mt-4 bg-black/20 rounded-xl px-4 py-3">
									<p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
										{t("inviteEcosystem.urlLabel")}
									</p>
									<p className="text-xs text-white/90 font-mono break-all leading-relaxed">
										{universalUrl}
									</p>
								</div>
							)}
						</div>
					</section>

					{/* ── Submissions ──────────────────────────────────────────── */}
					<section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10">
						<div className="p-6 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<h2 className="font-(family-name:--font-manrope) text-xl font-bold flex items-center gap-2">
								{t("submissions.title")}
								{submissions.length > 0 && (
									<span className="px-2 py-0.5 text-xs font-bold bg-[#FF5A30] text-white rounded-full">
										{submissions.length}
									</span>
								)}
							</h2>
							<div className="flex gap-2 flex-wrap">
								{(["all", ...CATEGORIES] as const).map((key) => (
									<button
										key={key}
										type="button"
										onClick={() => setCategoryFilter(key)}
										className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
											categoryFilter === key
												? "bg-[#FF5A30] text-white"
												: "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
										}`}
									>
										{key === "all" ? t("submissions.filterAll") : t(`categories.${key}`)}
										<span className="ml-1 opacity-70">
											{key === "all"
												? submissions.length
												: submissions.filter((s) => s.category === key).length}
										</span>
									</button>
								))}
							</div>
						</div>

						{stakeholdersQuery.isLoading ? (
							<Loader />
						) : filtered.length === 0 ? (
							<div className="text-center py-16 px-6">
								<span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">
									group_add
								</span>
								<p className="text-sm font-semibold text-on-surface-variant">
									{t("submissions.none")}
								</p>
							</div>
						) : (
							<div className="divide-y divide-outline-variant/10">
								{filtered.map((submission) => (
									<SubmissionRow
										key={submission.id}
										submission={submission}
										onOpen={() => setSelectedSubmission(submission)}
									/>
								))}
							</div>
						)}
					</section>
				</div>
			</main>

			{selectedSubmission && (
				<SubmissionModal
					submission={selectedSubmission}
					onClose={closeModal}
				/>
			)}
		</>
	);
}
