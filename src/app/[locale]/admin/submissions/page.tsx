"use client";

import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { Fragment, useState } from "react";
import { getAdminSubmissions } from "@/app/actions";

type Category = "financing" | "insurance" | "eoi";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
	financing: { bg: "bg-blue-100", text: "text-blue-700", icon: "account_balance" },
	insurance: { bg: "bg-purple-100", text: "text-purple-700", icon: "shield" },
	eoi: { bg: "bg-orange-100", text: "text-[#FF5A30]", icon: "send" },
};

export default function AdminSubmissionsPage() {
	const t = useTranslations("AdminSubmissionsPage");
	const format = useFormatter();
	const [activeCategory, setActiveCategory] = useState<"all" | Category>("all");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	type Submission = {
		id: unknown;
		category: unknown;
		title: unknown;
		submitted_at: unknown;
		form_data: Record<string, unknown> | null | undefined;
		profile?: {
			company_name?: string;
			contact_person?: string;
			user?: { email?: string };
		};
	};

	const { data: submissions = [] as Submission[], isLoading } = useQuery({
		queryKey: ["admin-submissions", activeCategory],
		queryFn: () =>
			getAdminSubmissions(activeCategory === "all" ? undefined : activeCategory),
		select: (r) => (r.data ?? []) as Submission[],
	});

	const TABS: { key: "all" | Category; label: string }[] = [
		{ key: "all", label: t("all") },
		{ key: "financing", label: t("financing") },
		{ key: "insurance", label: t("insurance") },
		{ key: "eoi", label: t("eoi") },
	];

	function downloadFormData(submission: (typeof submissions)[number]) {
		const formData =
			(submission.form_data as Record<string, unknown> | null | undefined) ?? {};
		const rows = Object.entries(formData).map(([k, v]) => [
			k,
			typeof v === "object" ? JSON.stringify(v) : String(v ?? ""),
		]);
		const header = ["field", "value"];
		const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `submission-${String(submission.id)}.csv`;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			URL.revokeObjectURL(url);
			document.body.removeChild(a);
		}, 100);
	}

	return (
		<div>
			{/* Header */}
			<div className="mb-8">
				<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-bold uppercase tracking-wider mb-3">
					{t("badge")}
				</span>
				<h1 className="font-(family-name:--font-manrope) text-3xl font-black text-on-surface">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
			</div>

			{/* Category tabs */}
			<div className="flex gap-2 mb-6 flex-wrap">
				{TABS.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveCategory(tab.key)}
						className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
							activeCategory === tab.key
								? "bg-[#FF5A30] text-white shadow-md shadow-[#FF5A30]/20"
								: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Submissions list */}
			{isLoading ? (
				<div className="flex items-center justify-center py-24">
					<span className="material-symbols-outlined animate-spin text-3xl text-[#FF5A30]">
						progress_activity
					</span>
				</div>
			) : submissions.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 text-on-surface-variant text-center">
					<span className="material-symbols-outlined text-5xl mb-4 text-slate-300">
						folder_open
					</span>
					<p className="font-bold text-lg">{t("empty")}</p>
					<p className="text-sm mt-1">{t("emptyHint")}</p>
				</div>
			) : (
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-slate-50 border-b border-slate-100">
							<tr>
								<th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
									{t("category")}
								</th>
								<th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
									{t("submissionTitle")}
								</th>
								<th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
									{t("submittedBy")}
								</th>
								<th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
									{t("submittedAt")}
								</th>
								<th className="px-5 py-3" />
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-50">
							{submissions.map((sub) => {
								const subId = String(sub.id);
								const cat = String(sub.category) as Category;
								const colors = CATEGORY_COLORS[cat] ?? {
									bg: "bg-slate-100",
									text: "text-slate-600",
									icon: "description",
								};
								const profile = sub.profile as
									| {
											company_name?: string;
											contact_person?: string;
											user?: { email?: string };
									  }
									| undefined;
								const isExpanded = expandedId === subId;

								return (
									<Fragment key={subId}>
										<tr
											className="hover:bg-slate-50 transition-colors"
										>
											<td className="px-5 py-4">
												<span
													className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}
												>
													<span className="material-symbols-outlined text-xs">{colors.icon}</span>
													{cat.toUpperCase()}
												</span>
											</td>
											<td className="px-5 py-4 text-slate-800 font-medium">{String(sub.title)}</td>
											<td className="px-5 py-4 text-slate-600">
												<p className="font-medium">
													{profile?.company_name
														? String(profile.company_name)
														: profile?.contact_person
															? String(profile.contact_person)
															: "—"}
												</p>
												{profile?.user?.email && (
													<p className="text-xs text-slate-400">{String(profile.user.email)}</p>
												)}
											</td>
											<td className="px-5 py-4 text-slate-500 whitespace-nowrap">
												{sub.submitted_at
													? format.relativeTime(new Date(String(sub.submitted_at)))
													: "—"}
											</td>
											<td className="px-5 py-4">
												<div className="flex items-center gap-2 justify-end">
													<button
														type="button"
														onClick={() => setExpandedId(isExpanded ? null : subId)}
														className="text-xs text-[#FF5A30] font-semibold hover:underline"
													>
														{t("viewData")}
													</button>
													{sub.form_data && (
														<button
															type="button"
															onClick={() => downloadFormData(sub)}
															className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
														>
															<span className="material-symbols-outlined text-xs">
																download
															</span>
															CSV
														</button>
													)}
												</div>
											</td>
										</tr>
										{isExpanded && sub.form_data && (
											<tr className="bg-slate-50">
												<td colSpan={5} className="px-5 py-4">
													<div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-xs">
														{Object.entries(
															sub.form_data as Record<string, unknown>,
														).map(([k, v]) => (
															<div key={k} className="flex flex-col gap-0.5">
																<span className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">
																	{k}
																</span>
																<span className="text-slate-700 font-medium break-all">
																	{typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
																</span>
															</div>
														))}
													</div>
												</td>
											</tr>
										)}
									</Fragment>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
