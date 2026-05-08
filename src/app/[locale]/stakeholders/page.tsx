"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	createOnboardingLink,
	exportStakeholders,
	getOnboardingLinks,
	revokeOnboardingLink,
} from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const CATEGORIES = ["service", "workforce", "artmgmt"] as const;

export default function OnboardingLinksPage() {
	const t = useTranslations("StakeholdersPage");
	const queryClient = useQueryClient();
	const [category, setCategory] =
		useState<(typeof CATEGORIES)[number]>("service");
	const [label, setLabel] = useState("");
	const [expiresAt, setExpiresAt] = useState("");

	const linksQuery = useQuery({
		queryKey: ["onboardingLinks"],
		queryFn: getOnboardingLinks,
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

	const exportMutation = useMutation({
		mutationFn: () => exportStakeholders("csv"),
		onSuccess: (result) => {
			if (!result.success || !result.data) return;
			const blob = new Blob(
				[typeof result.data === "string" ? result.data : JSON.stringify(result.data)],
				{ type: "text/csv" },
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "stakeholders.csv";
			a.click();
			URL.revokeObjectURL(url);
		},
	});

	const links = linksQuery.data?.success ? (linksQuery.data.data ?? []) : [];

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
								{exportMutation.isPending ? "Exporting…" : t("header.export")}
							</button>
						</header>

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
									{links.map((link) => (
										<div
											key={String(link.id)}
											className="rounded-xl bg-surface-container-low p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
										>
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
												</p>
											</div>
											<div className="flex items-center gap-2">
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
									))}
								</div>
							)}
						</section>
					</div>
				</main>
			</div>
		</div>
	);
}
