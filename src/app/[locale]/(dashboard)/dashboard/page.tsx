import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
	getEOIs,
	getFinancingApplications,
	getStakeholders,
	getTourstackDashboard,
	getTourstackProfile,
} from "@/app/actions";
import AreaChart from "@/components/dashboard/AreaChart";
import DonutChart from "@/components/dashboard/DonutChart";
import Sparkline from "@/components/dashboard/Sparkline";
import DashboardGettingStarted from "@/components/DashboardGettingStarted";
import EcosystemReadiness from "@/components/EcosystemReadiness";
import CountUp from "@/components/ui/CountUp";
import Icon from "@/components/icons";
import EmptyState from "@/components/ui/EmptyState";
import SideNav from "@/components/SideNav";
import { computeEcosystemReadiness } from "@/lib/eligibility";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";
import PageTour from "@/components/PageTour";
import StatusBadge, { type StatusTone } from "@/components/ui/StatusBadge";
import StatusStepper from "@/components/ui/StatusStepper";

function eoiStatusToTone(status: string): StatusTone {
	switch (status) {
		case "approved":
		case "confirmed":
			return "approved";
		case "rejected":
			return "rejected";
		case "needs_revision":
			return "contacted";
		default:
			return "pending";
	}
}

function formatTimeAgo(
	date: Date,
	t: Awaited<ReturnType<typeof getTranslations>>,
): string {
	const diff = Date.now() - date.getTime();
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);
	if (hours < 1) return t("time.justNow");
	if (hours < 24) return t("time.hoursAgo", { count: hours });
	if (days === 1) return t("time.yesterday");
	return t("time.daysAgo", { count: days });
}

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("DashboardPage");
	const tDocs = await getTranslations("EOIDocumentsPage");

	const [
		eoisResult,
		dashboardResult,
		profileResult,
		financingResult,
		stakeholdersResult,
	] = await Promise.all([
		getEOIs(),
		getTourstackDashboard(),
		getTourstackProfile(),
		getFinancingApplications(),
		getStakeholders(),
	]);

	const readiness = computeEcosystemReadiness(
		stakeholdersResult.data ?? [],
		financingResult.data ?? [],
	);

	const eois = eoisResult.data ?? [];
	const now = new Date();
	const newEoisThisMonth = eois.filter((e) => {
		if (!e.created_at) return false;
		const d = new Date(String(e.created_at));
		return (
			d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
		);
	}).length;
	const dashData = dashboardResult.data;
	const profile = profileResult.data;
	const companyName = profile?.company_name
		? String(profile.company_name)
		: t("yourOrganization");
	// First-run experience — a promoter with no EOIs has all-zero stats and
	// empty charts, so we lead with an actionable getting-started surface.
	const isFirstTime = eois.length === 0;
	// Mirror the same core fields the SideNav lock + ProfileSetupGate use, so the
	// checklist's "profile" step agrees with the rest of the shell.
	const profileComplete = [
		"company_name", "company_type", "contact_person",
		"contact_email", "phone", "country", "city",
	].every((k) => Boolean((profile as Record<string, unknown> | null)?.[k]));
	const INSURANCE_PRODUCT_IDS = ["Event Cancellation", "Event Insurance Bundle", "Touring Workforce", "Aviation & Equipment", "Audience Ticket Protection"];
	const approvedEoi = eois.find((e) => String(e.status) === "approved");
	// Only EOIs submitted after required_documents was introduced have a real
	// selection to report — older EOIs never captured this structurally, so we
	// fall back to generic copy rather than guessing which docs were selected.
	const approvedEoiDocTypes = approvedEoi?.required_documents ?? [];
	const approvedEoiDocLabels = approvedEoiDocTypes
		.map((dt) => tDocs(`docTypes.${dt}` as Parameters<typeof tDocs>[0]))
		.join(", ");
	const financingApps = financingResult.data ?? [];
	const hasFinancingRequest = eois.some((e) => String(e.funding_type ?? "") === "required");
	const hasInsuranceRequest = eois.some((e) => String(e.notes ?? "").includes("Insurance support requested"));
	const hasFinancingApp = financingApps.some((a) => !INSURANCE_PRODUCT_IDS.includes(String(a.product ?? "")));
	const hasInsuranceApp = financingApps.some((a) => INSURANCE_PRODUCT_IDS.includes(String(a.product ?? "")));
	const latestFinancing = financingApps[0];
	const recentEOIs = dashData?.recentEOIs ?? [];
	const nextMilestone = dashData?.upcomingMilestones?.[0];
	const nextMilestoneTour = nextMilestone?.tour;
	const statusStepDone: Record<string, number> = {
		pending_review: 2,
		needs_revision: 2,
		approved: 3,
		confirmed: 4,
		rejected: 3,
	};
	const progressEOI = recentEOIs[0];
	const progressStepsDone = progressEOI
		? (statusStepDone[String(progressEOI.status ?? "pending_review")] ?? 2)
		: 0;
	const progressArtist = progressEOI?.artist;
	const progressTitle = progressEOI
		? t("eoiProgressTitle", {
				artist: progressArtist?.name ?? "Artist",
				tour: progressArtist?.tour_name ? ` (${progressArtist.tour_name})` : "",
			})
		: t("noEoisYet");
	const progressStatusLabel = progressEOI
		? t(`statuses.${String(progressEOI.status ?? "pending")}`)
		: t("noEois");
	const progressStatusTone: StatusTone = progressEOI
		? eoiStatusToTone(String(progressEOI.status ?? "pending"))
		: "neutral";
	// ── Chart series — derived purely from the already-fetched lists ────────
	// Six-month buckets for the stat-tile sparklines and the status counts
	// for the pipeline donut. No additional requests.
	const monthKeys = Array.from({ length: 6 }, (_, i) => {
		const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
		return `${d.getFullYear()}-${d.getMonth()}`;
	});
	const monthKeyOf = (raw: unknown) => {
		if (!raw) return null;
		const d = new Date(String(raw));
		return Number.isNaN(d.getTime())
			? null
			: `${d.getFullYear()}-${d.getMonth()}`;
	};
	const monthLabels = monthKeys.map((k) => {
		const [yy, mm] = k.split("-").map(Number);
		return new Date(yy, mm, 1).toLocaleDateString(locale, { month: "short" });
	});
	const eoiSeries = monthKeys.map(
		(k) => eois.filter((e) => monthKeyOf(e.created_at) === k).length,
	);
	const approvedSeries = monthKeys.map(
		(k) =>
			eois.filter(
				(e) =>
					["approved", "confirmed"].includes(String(e.status ?? "")) &&
					monthKeyOf(e.created_at) === k,
			).length,
	);
	const financingSeries = monthKeys.map((k) =>
		financingApps
			.filter((a) => monthKeyOf(a.created_at) === k)
			.reduce((s, a) => s + Number(a.amount_requested ?? 0), 0),
	);
	// Aggregate total so the stat-card headline matches the (aggregate) sparkline
	// trend rather than showing only the latest application's amount.
	const totalFinancingRequested = financingApps.reduce(
		(s, a) => s + Number(a.amount_requested ?? 0),
		0,
	);
	const countStatus = (wanted: string[]) =>
		eois.filter((e) => wanted.includes(String(e.status ?? ""))).length;
	const pipelineSegments = [
		{ label: t("statuses.approved"), value: countStatus(["approved", "confirmed"]), color: "var(--chart-approved)" },
		{ label: t("statuses.pending_review"), value: countStatus(["pending_review", "pending", "under_review"]), color: "var(--chart-pending)" },
		{ label: t("statuses.needs_revision"), value: countStatus(["needs_revision"]), color: "var(--chart-contacted)" },
		{ label: t("statuses.rejected"), value: countStatus(["rejected", "declined"]), color: "var(--chart-rejected)" },
	];
	const totalEoiCount =
		typeof dashData?.stats?.totalEOIs === "number"
			? dashData.stats.totalEOIs
			: eois.length;

	const tourSteps = [
		{ label: t("steps.eoiSubmitted"), done: progressStepsDone >= 1 },
		{ label: t("steps.underReview"), done: progressStepsDone >= 2 },
		{ label: t("steps.decision"), done: progressStepsDone >= 3 },
		{ label: t("steps.confirmed"), done: progressStepsDone >= 4 },
	];
	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16">
				<SideNav />

				<main className="flex-1 lg:ml-64 bg-surface p-6 md:px-10 md:pt-5 md:pb-10">
					<PageTour pageId="dashboard" />
					{/* Identity strip header */}
					<div className="tsd-card mb-8 overflow-hidden tsd-rise">
						<div className="p-6 md:p-8 flex items-center gap-5">
							<div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
								{profile?.logo_url ? (
									// eslint-disable-next-line @next/next/no-img-element -- may be a base64 data URL
									<img src={String(profile.logo_url)} alt="" className="w-full h-full object-cover" />
								) : (
									<span className="text-lg font-(family-name:--font-display) text-primary">
										{companyName.slice(0, 2).toUpperCase()}
									</span>
								)}
							</div>
							<div className="min-w-0 flex-1">
								<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary block">
									{t("promoterPortal")}
								</span>
								<h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-on-surface truncate">
									{t("title")}
								</h1>
								<p className="text-sm text-on-surface-variant truncate">
									{t("welcomeBack", { name: companyName })}
								</p>
							</div>
							{/* Touring season — the one identity metric not repeated in the
							    stat cards below, so it earns a spot here as a chip. */}
							<div className="hidden sm:flex flex-col items-end shrink-0 pl-4">
								<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant mb-1.5">
									{t("touringSeason")}
								</span>
								<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-sm font-semibold text-on-surface whitespace-nowrap">
									<Icon name="calendar" size={13} className="text-primary" />
									{t("touringSeasonYears")}
								</span>
							</div>
						</div>
					</div>

					{/* Ecosystem readiness — surfaced right under the header so an
					    incomplete ecosystem reads as the urgent next task. First-run
					    users already see this as a getting-started step. */}
					{!isFirstTime && !readiness.eligible && (
						<div className="mb-8 tsd-rise">
							<EcosystemReadiness readiness={readiness} compact />
						</div>
					)}

					{/* First-run getting-started surface — leads the page for new
					    promoters (no EOIs yet), before the empty stats/charts. */}
					{isFirstTime && (
						<DashboardGettingStarted
							name={companyName}
							profileComplete={profileComplete}
							ecosystemDone={readiness.eligible}
						/>
					)}

					{/* Consolidated "needs your attention" — one card, one row per
					    active prompt, instead of stacked full-width banners. */}
					{((hasFinancingRequest && !hasFinancingApp) ||
						(hasInsuranceRequest && !hasInsuranceApp) ||
						approvedEoi) && (
						<div className="tsd-card mb-8 overflow-hidden tsd-rise">
							<div className="px-5 md:px-6 py-3.5 border-b border-outline-variant/60 flex items-center gap-2">
								<Icon name="bell" size={15} className="text-primary" />
								<h2 className="text-sm font-semibold text-on-surface">
									{t("attentionTitle")}
								</h2>
							</div>
							<div className="divide-y divide-outline-variant/60">
								{hasFinancingRequest && !hasFinancingApp && (
									<div className="flex items-center justify-between gap-4 px-5 md:px-6 py-3.5 hover:bg-surface-container-low transition-colors">
										<div className="flex items-center gap-3 min-w-0">
											<span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
												<Icon name="wallet" size={16} />
											</span>
											<div className="min-w-0">
												<p className="text-sm font-semibold text-on-surface truncate">{t("financePrompt.title")}</p>
												<p className="text-xs text-on-surface-variant truncate">{t("financePrompt.description")}</p>
											</div>
										</div>
										<Link href="/financing" className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all">
											{t("financePrompt.cta")}
											<Icon name="arrow-right" size={13} strokeWidth={2.25} />
										</Link>
									</div>
								)}
								{hasInsuranceRequest && !hasInsuranceApp && (
									<div className="flex items-center justify-between gap-4 px-5 md:px-6 py-3.5 hover:bg-surface-container-low transition-colors">
										<div className="flex items-center gap-3 min-w-0">
											<span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
												<Icon name="insurance" size={16} />
											</span>
											<div className="min-w-0">
												<p className="text-sm font-semibold text-on-surface truncate">{t("insurancePrompt.title")}</p>
												<p className="text-xs text-on-surface-variant truncate">{t("insurancePrompt.description")}</p>
											</div>
										</div>
										<Link href="/insurance" className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all">
											{t("insurancePrompt.cta")}
											<Icon name="arrow-right" size={13} strokeWidth={2.25} />
										</Link>
									</div>
								)}
								{approvedEoi && (
									<div className="flex items-center justify-between gap-4 px-5 md:px-6 py-3.5 hover:bg-surface-container-low transition-colors">
										<div className="flex items-center gap-3 min-w-0">
											<span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
												<Icon name="upload" size={16} />
											</span>
											<div className="min-w-0">
												<p className="text-sm font-semibold text-on-surface truncate">{t("docsPrompt.title")}</p>
												<p className="text-xs text-on-surface-variant truncate">
													{approvedEoiDocTypes.length > 0
														? t("docsPrompt.description", { docs: approvedEoiDocLabels })
														: t("docsPrompt.descriptionGeneric")}
												</p>
											</div>
										</div>
										<Link href={`/eoi/documents?eoiId=${String(approvedEoi.id)}`} className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all">
											{t("docsPrompt.cta")}
											<Icon name="arrow-right" size={13} strokeWidth={2.25} />
										</Link>
									</div>
								)}
							</div>
						</div>
					)}
					{/* Stats Grid */}
					<div data-tour="dashboard-stats" className="tsd-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
						<div className="tsd-card tsd-card-hover p-5 md:p-6 flex flex-col justify-between gap-5">
							<div className="flex items-center justify-between">
								<p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.12em]">
									{t("stats.eoisSubmitted")}
								</p>
								<span className="tsd-chip w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
									<Icon name="tours" size={16} />
								</span>
							</div>
							<div className="flex items-end justify-between gap-2">
								<CountUp
								value={totalEoiCount}
								locale={locale}
								className="text-3xl md:text-4xl font-(family-name:--font-display) text-on-surface leading-none"
							/>
							<span
								className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${newEoisThisMonth > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-surface-container text-on-surface-variant"}`}
							>
								<Icon name="trending-up" size={11} strokeWidth={2.5} />
								{t("stats.newThisMonth", { count: newEoisThisMonth })}
							</span>
						</div>
						<Sparkline data={eoiSeries} className="text-primary" height={30} />
					</div>

						<div className="tsd-card tsd-card-hover p-5 md:p-6 flex flex-col justify-between gap-5">
							<div className="flex items-center justify-between">
								<p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.12em]">
									{t("stats.approved")}
								</p>
								<span className="tsd-chip w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
									<Icon name="check" size={16} strokeWidth={2.25} />
								</span>
							</div>
							<div className="flex items-end justify-between gap-2">
								<CountUp
								value={
									typeof dashData?.stats?.approvedEOIs === "number"
										? dashData.stats.approvedEOIs
										: 0
								}
								locale={locale}
								className="text-3xl md:text-4xl font-(family-name:--font-display) text-on-surface leading-none"
							/>
							<span className="text-emerald-500 font-semibold text-xs">
								{t("stats.confirmed")}
							</span>
						</div>
						<Sparkline data={approvedSeries} height={30} className="[color:var(--chart-approved)]" />
					</div>

						<div className="tsd-card tsd-card-hover p-5 md:p-6 flex flex-col justify-between gap-5">
							<div className="flex items-center justify-between">
								<p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.12em]">
									{t("stats.financingStatus")}
								</p>
								<span className="tsd-chip w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
									<Icon name="wallet" size={16} />
								</span>
							</div>
							<div className="flex items-end justify-between gap-2">
								{latestFinancing ? (
								<CountUp
									value={Math.round(totalFinancingRequested / 1000)}
									locale={locale}
									prefix="$"
									suffix="K"
									className="text-3xl md:text-4xl font-(family-name:--font-display) text-on-surface leading-none"
								/>
							) : (
								<span className="text-3xl md:text-4xl font-(family-name:--font-display) text-on-surface leading-none">
									—
								</span>
							)}
								<span className="text-violet-500 font-semibold text-xs capitalize">
									{latestFinancing
										? t(
												`statuses.${String(latestFinancing.status ?? "pending")}`,
											)
										: t("stats.noApps")}
								</span>
							</div>
						<Sparkline data={financingSeries} height={30} className="text-violet-500" />
					</div>

						<div className="relative overflow-hidden p-5 md:p-6 rounded-2xl flex flex-col justify-between gap-5 bg-primary text-white">
							<div className="absolute -top-6 -right-6 opacity-15 pointer-events-none">
								<Icon name="zap" size={130} strokeWidth={1} />
							</div>
							<div className="flex items-center justify-between z-10">
								<p className="text-[11px] font-semibold text-white/90 uppercase tracking-[0.12em]">
									{t("stats.nextShow")}
								</p>
								<span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
									<Icon name="calendar" size={16} />
								</span>
							</div>
							{nextMilestone ? (
								<>
									<div className="z-10 flex items-end justify-between gap-2">
										<span className="text-3xl md:text-4xl font-(family-name:--font-display) leading-none">
											{new Date(String(nextMilestone.date)).toLocaleDateString(locale, { month: "short", day: "numeric" })}
										</span>
										<span className="text-orange-100 font-semibold text-xs">
											{new Date(String(nextMilestone.date)).getFullYear()}
										</span>
									</div>
									<p className="z-10 text-orange-100 text-sm font-medium truncate">
										{String(nextMilestoneTour?.venue ?? "TBD")} @ {String(nextMilestoneTour?.city ?? "TBD")}
									</p>
								</>
							) : (
								<>
									<span className="z-10 block text-2xl font-(family-name:--font-display) leading-tight">
										{t("stats.noUpcomingShows")}
									</span>
									<p className="z-10 text-orange-100 font-medium text-sm">
										{t("stats.submitEoiPrompt")}
									</p>
								</>
							)}
						</div>
					</div>

{/* Hero analytics row */}
					<div data-reveal className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
						<div className="lg:col-span-2 tsd-card p-5 md:p-6 flex flex-col">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
										{t("analytics.eyebrow")}
									</p>
									<h2 className="text-lg font-(family-name:--font-manrope) font-semibold text-on-surface">
										{t("analytics.title")}
									</h2>
								</div>
								<span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant shrink-0">
									<Icon name="calendar" size={12} />
									{t("analytics.period")}
								</span>
							</div>
							<AreaChart
								series={[
									{
										values: eoiSeries,
										label: t("analytics.submitted"),
										color: "var(--color-primary)",
									},
									{
										values: approvedSeries,
										label: t("analytics.approved"),
										color: "var(--chart-approved)",
										fill: false,
									},
								]}
								labels={monthLabels}
								locale={locale}
								unitLabel={t("analytics.unit")}
								integer
								height={250}
								className="mt-6"
							/>
						</div>
						<div className="lg:col-span-1 tsd-card p-6 flex flex-col">
							{/* EOI pipeline composition */}
							<div className="flex items-center justify-between mb-5">
								<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
									{t("pipelineTitle")}
								</h3>
								<span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
									<Icon name="chart" size={16} />
								</span>
							</div>
							<div className="flex-1 flex items-center gap-6">
								<DonutChart
									segments={pipelineSegments}
									centerValue={String(totalEoiCount)}
									centerLabel={t("stats.eoisSubmitted")}
									size={132}
								/>
								<ul className="flex-1 min-w-0 space-y-2.5">
									{pipelineSegments.map((seg) => (
										<li key={seg.label} className="flex items-center gap-2.5">
											<span
												className="w-2 h-2 rounded-full shrink-0"
												style={{ background: seg.color }}
											/>
											<span className="text-xs font-medium text-on-surface-variant flex-1 truncate">
												{seg.label}
											</span>
											<span className="text-xs font-semibold text-on-surface tabular-nums">
												{seg.value}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					{/* Tour Progress Tracker */}
					<div data-reveal className="tsd-card p-4 md:p-6 mb-8">
						<div className="flex items-center justify-between mb-4 gap-2">
							<div className="min-w-0">
								<span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary block mb-0.5">
									{t("latestSubmission")}
								</span>
								<h2 className="font-(family-name:--font-manrope) font-semibold text-sm md:text-base truncate">
									{progressTitle}
								</h2>
							</div>
							<StatusBadge tone={progressStatusTone} dot className="shrink-0">
								{progressStatusLabel}
							</StatusBadge>
						</div>
						<StatusStepper steps={tourSteps} />
					</div>

					<div data-reveal className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div data-tour="dashboard-eois" className="lg:col-span-2 space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-(family-name:--font-manrope) font-semibold text-on-surface">
									{t("myEoiSubmissions")}
								</h2>
								<Link
									href="/eoi"
									className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
								>
									{t("newEoi")}{" "}
									<Icon name="plus" size={15} strokeWidth={2.25} />
								</Link>
							</div>

							<div className="tsd-card overflow-hidden">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-outline-variant">
											<th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant text-left">
												{t("table.artistTour")}
											</th>
											<th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant text-left hidden md:table-cell">
												{t("table.venue")}
											</th>
											<th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant text-left hidden sm:table-cell">
												{t("table.submitted")}
											</th>
											<th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant text-right">
												{t("table.status")}
											</th>
										</tr>
									</thead>
									<tbody>
										{eois.length === 0 ? (
											<tr>
												<td colSpan={4}>
													<EmptyState
														icon="tours"
														title={t("table.noEois")}
														description={t("table.noEoisDesc")}
														actionLabel={t("table.discoverArtistes")}
														actionHref="/discovery"
														actionIcon="search"
													/>
												</td>
											</tr>
										) : (
											eois.map((req) => {
												const reqArtist = req.artist;
												const status = String(req.status ?? "pending");
												return (
													<tr
														key={String(req.id ?? req.city)}
														className="group border-b border-outline-variant/60 last:border-0 hover:bg-surface-container-low transition-colors"
													>
														<td className="px-5 py-3.5">
															<div className="flex items-center gap-3">
																<div className="h-9 w-9 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-high ring-1 ring-outline-variant flex items-center justify-center">
																	{reqArtist?.image_url ? (
																		<Image
																			src={String(reqArtist.image_url)}
																			alt={String(reqArtist.name ?? "")}
																			fill
																			className="object-cover transition-transform duration-300 group-hover:scale-105"
																		/>
																	) : (
																		<Icon name="music" size={16} className="text-on-surface-variant" strokeWidth={1.5} />
																	)}
																</div>
																<div className="min-w-0">
																	<span className="block font-semibold text-on-surface text-sm truncate">
																		{String(reqArtist?.name ?? "Artist")}
																	</span>
																	<span className="block text-xs text-on-surface-variant truncate">
																		{String(
																			reqArtist?.tour_name ?? req.city ?? "",
																		)}
																	</span>
																</div>
															</div>
														</td>
														<td className="px-5 py-3.5 text-xs text-on-surface-variant font-medium hidden md:table-cell">
															{String(req.venue ?? req.city ?? "—")}
														</td>
														<td className="px-5 py-3.5 text-xs text-on-surface-variant font-medium hidden sm:table-cell whitespace-nowrap">
															{req.created_at
																? new Date(String(req.created_at)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
																: "—"}
														</td>
														<td className="px-5 py-3.5 text-right">
															<StatusBadge tone={eoiStatusToTone(status)} dot>
																{t(`statuses.${status}`)}
															</StatusBadge>
														</td>
													</tr>
												);
											})
										)}
									</tbody>
								</table>
							</div>
						</div>

						{/* Widgets */}
						<div className="space-y-8">
						{/* Financing Widget */}
							<div className="tsd-card p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
										{t("financingStatus")}
									</h3>
									<Icon name="financing" size={20} className="text-primary" />
								</div>
								{!latestFinancing ? (
									<EmptyState
										icon="wallet"
										title={t("noAppsYet")}
										description={t("noAppsDesc")}
										actionLabel={t("exploreFinancing")}
										actionHref="/financing"
										actionIcon="arrow-right"
										className="py-4"
									/>
								) : (
									<div className="space-y-5">
										<div>
											<div className="flex justify-between text-sm mb-2">
												<span className="text-on-surface-variant font-medium">
													{String(latestFinancing.product ?? t("application"))}
												</span>
												<span className="font-semibold text-primary capitalize">
													{t(
														`statuses.${String(latestFinancing.status ?? "pending")}`,
													)}
												</span>
											</div>
											<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
												<div
													className="bg-primary h-full rounded-full"
													style={{
														width:
															String(latestFinancing.status) === "approved"
																? "100%"
																: String(latestFinancing.status) === "declined"
																	? "60%"
																	: "35%",
													}}
												/>
											</div>
											<p className="text-xs text-on-surface-variant mt-1">
												{String(latestFinancing.status) === "approved"
													? t("financingApproved")
													: String(latestFinancing.status) === "declined"
														? t("financingDeclined")
														: t("financingAssessment")}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="p-4 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-semibold text-on-surface-variant mb-1">
													{t("requested")}
												</p>
												<p className="text-base font-(family-name:--font-manrope) font-extrabold text-on-surface whitespace-nowrap">
													{String(latestFinancing.currency ?? "USD")}{" "}
													{Number(
														latestFinancing.amount_requested,
													).toLocaleString(locale)}
												</p>
											</div>
											<div className="p-4 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-semibold text-on-surface-variant mb-1">
													{t("table.status")}
												</p>
												<p className="text-xl font-(family-name:--font-manrope) font-extrabold text-tertiary-container capitalize">
													{t(
														`statuses.${String(latestFinancing.status ?? "pending")}`,
													)}
												</p>
											</div>
										</div>
										<Link
											href="/financing"
											className="block w-full py-3 bg-primary/10 text-primary font-semibold text-sm rounded-lg hover:bg-primary/15 transition-colors text-center"
										>
											{t("viewFinancingDetails")}
										</Link>
									</div>
								)}
							</div>



							{/* Activity Feed */}
							<div className="tsd-card p-6">
								<h3 className="font-(family-name:--font-manrope) font-semibold text-lg mb-6">
									{t("tourActivity")}
								</h3>
								{recentEOIs.length === 0 ? (
									<EmptyState icon="inbox" title={t("noActivity")} className="py-4" />
								) : (
									<div className="space-y-6 relative before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
										{recentEOIs.slice(0, 5).map((eoi) => {
											const eoiStatus = String(eoi.status ?? "pending");
											const eoiArtist = eoi.artist;
											const artistName = String(eoiArtist?.name ?? "Artist");
											const dotBg =
												eoiStatus === "approved"
													? "bg-emerald-100"
													: eoiStatus === "needs_revision"
														? "bg-orange-100"
														: "bg-tertiary-fixed";
											const dotFill =
												eoiStatus === "approved"
													? "bg-emerald-500"
													: eoiStatus === "needs_revision"
														? "bg-primary"
														: "bg-tertiary-container";
											const activityLabel = t(`activityLabels.${eoiStatus}`, {
												artist: artistName,
											});

											const timeAgo = eoi.created_at
												? formatTimeAgo(new Date(String(eoi.created_at)), t)
												: "";
											return (
												<div
													key={String(eoi.id)}
													className="relative flex gap-4 pl-8"
												>
													<div
														className={`absolute left-0 top-1 w-6 h-6 rounded-full ${dotBg} flex items-center justify-center border-4 border-surface-container-lowest`}
													>
														<div
															className={`w-2 h-2 rounded-full ${dotFill}`}
														/>
													</div>
													<div>
														<p className="text-sm font-semibold text-on-surface">
															{activityLabel}
														</p>
														<p className="text-xs text-on-surface-variant">
															{timeAgo}
															{eoi.city ? ` • ${String(eoi.city)}` : ""}
														</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
