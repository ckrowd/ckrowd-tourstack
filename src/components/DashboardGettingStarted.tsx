import { getTranslations } from "next-intl/server";
import Icon from "@/components/icons";
import PageHero from "@/components/PageHero";
import { Link } from "@/i18n/routing";

/* First-run dashboard surface. When a promoter has no EOIs yet, the stat
   tiles and charts are all zeros — useless. This replaces them at the top of
   the page with an actionable getting-started checklist and an EOI flow
   explainer, so a brand-new user always has an obvious next step. */

interface Props {
	name: string;
	profileComplete: boolean;
	ecosystemDone: boolean;
}

export default async function DashboardGettingStarted({
	name,
	profileComplete,
	ecosystemDone,
}: Props) {
	const t = await getTranslations("DashboardPage.gettingStarted");

	const steps = [
		{
			key: "profile",
			title: t("stepProfileTitle"),
			desc: t("stepProfileDesc"),
			done: profileComplete,
			href: "/profile",
			cta: t("completeProfileCta"),
		},
		{
			key: "ecosystem",
			title: t("stepEcosystemTitle"),
			desc: t("stepEcosystemDesc"),
			done: ecosystemDone,
			href: "/onboarding",
			cta: t("buildCta"),
		},
		{
			key: "discover",
			title: t("stepDiscoverTitle"),
			desc: t("stepDiscoverDesc"),
			done: false,
			href: "/discovery",
			cta: t("browseCta"),
		},
		{
			key: "eoi",
			title: t("stepEoiTitle"),
			desc: t("stepEoiDesc"),
			done: false,
			href: "/discovery",
			cta: t("browseCta"),
		},
	];
	const doneCount = steps.filter((s) => s.done).length;
	const activeIndex = steps.findIndex((s) => !s.done);

	const flow = [
		{ icon: "discovery", title: t("flowS1"), desc: t("flowS1Desc") },
		{ icon: "send", title: t("flowS2"), desc: t("flowS2Desc") },
		{ icon: "clock", title: t("flowS3"), desc: t("flowS3Desc") },
		{ icon: "check-circle", title: t("flowS4"), desc: t("flowS4Desc") },
	];

	return (
		<div className="mb-10">
			{/* Welcome hero — shared premium header language */}
			<PageHero
				image="/crowd-blue.jpg"
				eyebrow={t("eyebrow")}
				title={t("title", { name })}
				description={t("subtitle")}
			>
				<Link
					href="/discovery"
					className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
				>
					<Icon name="discovery" size={16} />
					{t("browseCta")}
				</Link>
			</PageHero>

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
				{/* Checklist */}
				<div className="lg:col-span-3 tsd-card p-6 md:p-7">
					<div className="flex items-center justify-between mb-6">
						<h2 className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
							{t("eyebrow")}
						</h2>
						<span className="text-xs font-semibold text-on-surface-variant tabular-nums">
							{t("progress", { done: doneCount, total: steps.length })}
						</span>
					</div>
					<ol className="space-y-1">
						{steps.map((s, i) => {
							const active = i === activeIndex;
							return (
								<li key={s.key}>
									<div
										className={`flex items-center gap-4 rounded-xl p-3 transition-colors ${active ? "bg-primary/5" : ""}`}
									>
										<span
											className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
												s.done
													? "bg-emerald-500/15 text-emerald-500"
													: active
														? "bg-primary text-white"
														: "bg-surface-container-high text-on-surface-variant"
											}`}
										>
											{s.done ? <Icon name="check" size={15} strokeWidth={2.5} /> : i + 1}
										</span>
										<div className="min-w-0 flex-1">
											<p className={`text-sm font-semibold leading-tight ${s.done ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
												{s.title}
											</p>
											<p className="text-xs text-on-surface-variant mt-0.5 truncate">{s.desc}</p>
										</div>
										{!s.done && active && (
											<Link
												href={s.href}
												className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all"
											>
												{s.cta}
												<Icon name="arrow-right" size={13} strokeWidth={2.25} />
											</Link>
										)}
									</div>
								</li>
							);
						})}
					</ol>
				</div>

				{/* EOI flow explainer */}
				<div className="lg:col-span-2 tsd-card p-6 md:p-7">
					<h3 className="font-(family-name:--font-manrope) font-semibold text-base text-on-surface mb-6">
						{t("flowTitle")}
					</h3>
					<ol className="relative space-y-5 before:absolute before:left-[18px] before:top-3 before:bottom-3 before:w-px before:bg-outline-variant">
						{flow.map((f, i) => (
							<li key={f.title} className="relative flex items-start gap-4">
								<span className="shrink-0 w-9 h-9 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary z-10">
									<Icon name={f.icon} size={16} />
								</span>
								<div className="pt-1">
									<p className="text-sm font-semibold text-on-surface leading-tight">
										<span className="text-on-surface-variant/60 font-(family-name:--font-display) mr-1.5">
											{i + 1}
										</span>
										{f.title}
									</p>
									<p className="text-xs text-on-surface-variant mt-0.5">{f.desc}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</div>
		</div>
	);
}
