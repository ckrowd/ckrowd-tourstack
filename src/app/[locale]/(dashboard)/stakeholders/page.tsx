"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
	createOnboardingLink,
	exportStakeholders,
	getOnboardingLinks,
	getStakeholders,
	revokeOnboardingLink,
	type StakeholderSubmission,
} from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const CATEGORIES = ["service", "workforce", "artmgmt"] as const;

// Turns a camelCase / snake_case key or option value into a readable label.
function humanizeLabel(value: string): string {
	return value
		.replace(/_/g, " ")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
	if (value == null || value === "") return "—";
	if (Array.isArray(value)) {
		return value.length
			? value.map((v) => humanizeLabel(String(v))).join(", ")
			: "—";
	}
	if (typeof value === "boolean") return value ? "Yes" : "No";
	if (typeof value === "object") return JSON.stringify(value);
	return humanizeLabel(String(value));
}

// One compact, clickable row in the submissions list.
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
			className="w-full flex items-center justify-between gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-left hover:border-[#FF5A30]/40 hover:bg-surface-container transition-colors"
		>
			<div className="min-w-0">
				<p className="text-sm font-bold text-on-surface truncate">
					{submission.name}
				</p>
				<p className="text-xs text-on-surface-variant truncate">
					{submission.email}
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

// Full submission detail shown as a modal dialog.
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
										{formatValue(value)}
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
								<span className="material-symbols-outlined text-sm">
									download
								</span>
								{t("submissions.download")}
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function OnboardingLinksPage() {
	const t = useTranslations("StakeholdersPage");
	const locale = useLocale();
	const queryClient = useQueryClient();
	const [category, setCategory] =
		useState<(typeof CATEGORIES)[number]>("service");
	const [label, setLabel] = useState("");
	const [expiresAt, setExpiresAt] = useState("");
	const [expandedToken, setExpandedToken] = useState<string | null>(null);
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

	const createMutation = useMutation({
		mutationFn: createOnboardingLink,
		onSuccess: () => {
			setLabel("");
			setExpiresAt("");
			void queryClient.invalidateQueries({ queryKey: ["onboardingLinks"] });
		},
	});

	const revokeMutation = useMutation({
		mutationFn: revokeOnboardingLink,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["onboardingLinks"] });
		},
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
	const submissionsLoaded = !stakeholdersQuery.isLoading;

	// ── Invite Ecosystem ──────────────────────────────────────────────────────
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

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					<div className="w-full space-y-8">
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
								<span className="material-symbols-outlined text-sm">
									download
								</span>
								{exportMutation.isPending
									? t("header.exporting")
									: t("header.export")}
							</button>
						</header>

						{/* ── Invite Ecosystem ──────────────────────────────────────── */}
						<section className="rounded-2xl overflow-hidden shadow-lg">
							<div className="bg-gradient-to-r from-[#FF5A30] to-[#cc4826] p-6 text-white">
								<div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
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

						<section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
							<h2 className="font-(family-name:--font-manrope) text-xl font-bold mb-4">
								{t("createLink.title")}
							</h2>
							<form
								onSubmit={(event) => {
									event.preventDefault();
									createMutation.mutate({
										category,
										label: label || undefined,
										expiresAt: expiresAt
											? new Date(expiresAt).toISOString()
											: undefined,
									});
								}}
								className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
							>
								<div>
									<label
										htmlFor="onboarding-category"
										className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
									>
										{t("createLink.category")}
									</label>
									<div className="relative">
										<select
											id="onboarding-category"
											value={category}
											onChange={(event) =>
												setCategory(
													event.target.value as (typeof CATEGORIES)[number],
												)
											}
											className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none"
										>
											{CATEGORIES.map((value) => (
												<option key={value} value={value}>
													{t(`categories.${value}`)}
												</option>
											))}
										</select>
										<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
											expand_more
										</span>
									</div>
								</div>

								<div className="md:col-span-2">
									<label
										htmlFor="onboarding-label"
										className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
									>
										{t("createLink.label.title")}
									</label>
									<input
										id="onboarding-label"
										type="text"
										value={label}
										onChange={(event) => setLabel(event.target.value)}
										placeholder={t("createLink.label.placeholder")}
										className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>

								<div>
									<label
										htmlFor="onboarding-expiry"
										className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
									>
										{t("createLink.expires")}
									</label>
									<input
										id="onboarding-expiry"
										type="datetime-local"
										value={expiresAt}
										onChange={(event) => setExpiresAt(event.target.value)}
										className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>

								<div className="md:col-span-4 flex justify-end">
									<button
										type="submit"
										disabled={createMutation.isPending}
										className="bg-[#FF5A30] text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60"
									>
										{createMutation.isPending
											? t("createLink.creating")
											: t("createLink.submit")}
									</button>
								</div>
							</form>
						</section>

						<section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
							<h2 className="font-(family-name:--font-manrope) text-xl font-bold mb-4">
								{t("existingLinks.title")}
							</h2>
							{linksQuery.isLoading ? (
								<p className="text-sm text-on-surface-variant">
									{t("existingLinks.loading")}
								</p>
							) : !linksQuery.data?.success ? (
								<p className="text-sm text-rose-700">
									{linksQuery.data?.error ?? t("existingLinks.error")}
								</p>
							) : links.length === 0 ? (
								<p className="text-sm text-on-surface-variant">
									{t("existingLinks.noLinks")}
								</p>
							) : (
								<div className="space-y-3">
									{links.map((link) => {
										const token = String(link.token);
										const linkSubs = submissions.filter(
											(s) => s.link?.token === token,
										);
										const expanded = expandedToken === token;
										return (
											<div
												key={String(link.id)}
												className="rounded-xl bg-surface-container-low overflow-hidden"
											>
												<div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
													<div className="min-w-0">
														<p className="text-sm font-bold text-on-surface">
															{link.label ?? t("existingLinks.untitled")}
														</p>
														<p className="text-xs text-on-surface-variant mt-1 break-all">
															{typeof window !== "undefined"
																? `${window.location.origin}/stakeholders/${link.token}`
																: `/stakeholders/${link.token}`}
														</p>
														<p className="text-xs text-on-surface-variant mt-1">
															{t(
																`categories.${link.category as (typeof CATEGORIES)[number]}`,
															)}{" "}
															·{" "}
															{link.is_active
																? t("status.active")
																: t("status.inactive")}
															{submissionsLoaded ? (
																<>
																	{" · "}
																	<span className="font-semibold text-on-surface">
																		{linkSubs.length > 0
																			? t("submissions.received", {
																					count: linkSubs.length,
																				})
																			: t("submissions.none")}
																	</span>
																</>
															) : null}
														</p>
													</div>
													<div className="flex items-center gap-2 shrink-0">
														{linkSubs.length > 0 && (
															<button
																type="button"
																onClick={() =>
																	setExpandedToken(expanded ? null : token)
																}
																className="px-3 py-2 rounded-lg text-xs font-bold border border-[#FF5A30]/30 text-[#FF5A30] hover:bg-[#FF5A30]/5"
															>
																{expanded
																	? t("submissions.hide")
																	: t("submissions.view")}
															</button>
														)}
														<button
															type="button"
															onClick={async () => {
																const shareUrl = `${window.location.origin}/stakeholders/${link.token}`;
																await navigator.clipboard.writeText(shareUrl);
															}}
															className="px-3 py-2 rounded-lg text-xs font-bold border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
														>
															{t("actions.copy")}
														</button>
														{link.is_active && (
															<button
																type="button"
																onClick={() =>
																	revokeMutation.mutate(String(link.token))
																}
																disabled={revokeMutation.isPending}
																className="px-3 py-2 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
															>
																{t("actions.revoke")}
															</button>
														)}
													</div>
												</div>
												{expanded && (
													<div className="border-t border-outline-variant/10 bg-surface-container-lowest p-4 space-y-2">
														{linkSubs.map((submission) => (
															<SubmissionRow
																key={submission.id}
																submission={submission}
																onOpen={() =>
																	setSelectedSubmission(submission)
																}
															/>
														))}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
							{!stakeholdersQuery.isLoading &&
								stakeholdersQuery.data &&
								!stakeholdersQuery.data.success && (
									<p className="text-xs text-rose-700 mt-3">
										{t("submissions.error")}
									</p>
								)}
						</section>
					</div>
				</main>
			</div>

			{selectedSubmission && (
				<SubmissionModal
					submission={selectedSubmission}
					onClose={closeModal}
				/>
			)}
		</div>
	);
}
