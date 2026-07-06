"use client";

import { generateEOIScore, getEOIScore } from "@/app/actions";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

type Breakdown = {
	artist_demand: number;
	budget_health: number;
	market_fit: number;
	promoter_track_record: number;
};

type Score = {
	score: number;
	verdict: string;
	breakdown: Breakdown;
	risks: string[];
	recommendations: string[];
	model_used: string;
	generated_at: string;
};

function ScoreGauge({ score }: { score: number }) {
	const color =
		score >= 75 ? "text-emerald-600" : score >= 50 ? "text-yellow-500" : "text-rose-500";
	const ring =
		score >= 75 ? "ring-emerald-500" : score >= 50 ? "ring-yellow-400" : "ring-rose-400";
	return (
		<div
			className={`w-20 h-20 rounded-full ring-4 ${ring} flex flex-col items-center justify-center shrink-0`}
		>
			<span className={`text-2xl font-black font-(family-name:--font-manrope) ${color}`}>
				{score}
			</span>
			<span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
				/ 100
			</span>
		</div>
	);
}

function BreakdownBar({
	label,
	value,
	max = 25,
}: {
	label: string;
	value: number;
	max?: number;
}) {
	const pct = Math.round((value / max) * 100);
	const color =
		pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-yellow-400" : "bg-rose-400";
	return (
		<div>
			<div className="flex justify-between text-xs mb-1">
				<span className="text-on-surface-variant font-medium">{label}</span>
				<span className="font-bold text-on-surface">
					{value}/{max}
				</span>
			</div>
			<div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
				<div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
}

export default function AITourScorePanel({ eoiId }: { eoiId: string }) {
	const t = useTranslations("AITourScore");

	const { data: scoreData, refetch } = useQuery({
		queryKey: ["ai-score", eoiId],
		queryFn: () => getEOIScore(eoiId),
	});

	const score = scoreData?.data as Score | null | undefined;

	const generateMutation = useMutation({
		mutationFn: () => generateEOIScore(eoiId),
		onSuccess: (result) => {
			if (result.success) refetch();
		},
	});

	const breakdown = score?.breakdown as Breakdown | undefined;

	return (
		<div className="space-y-4">
			{score ? (
				<>
					<div className="flex items-center gap-5">
						<ScoreGauge score={score.score} />
						<div>
							<p className="text-sm font-semibold text-on-surface leading-snug">
								{score.verdict}
							</p>
							<p className="text-[10px] text-on-surface-variant mt-1">
								{t("generatedAt")}{" "}
								{new Date(score.generated_at).toLocaleDateString("en", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}{" "}
								· {score.model_used}
							</p>
						</div>
					</div>

					{breakdown && (
						<div className="space-y-2.5">
							<p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
								{t("breakdown.title")}
							</p>
							<BreakdownBar label={t("breakdown.artistDemand")} value={breakdown.artist_demand} />
							<BreakdownBar label={t("breakdown.budgetHealth")} value={breakdown.budget_health} />
							<BreakdownBar label={t("breakdown.marketFit")} value={breakdown.market_fit} />
							<BreakdownBar
								label={t("breakdown.promoterTrackRecord")}
								value={breakdown.promoter_track_record}
							/>
						</div>
					)}

					{Array.isArray(score.risks) && score.risks.length > 0 && (
						<div>
							<p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
								{t("risks.title")}
							</p>
							<ul className="space-y-1">
								{(score.risks as string[]).map((r) => (
									<li key={r} className="flex items-start gap-2 text-xs text-on-surface-variant">
										<span className="material-symbols-outlined text-rose-400 text-sm mt-0.5 shrink-0">
											warning
										</span>
										{r}
									</li>
								))}
							</ul>
						</div>
					)}

					{Array.isArray(score.recommendations) && score.recommendations.length > 0 && (
						<div>
							<p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
								{t("recommendations.title")}
							</p>
							<ul className="space-y-1">
								{(score.recommendations as string[]).map((r) => (
									<li key={r} className="flex items-start gap-2 text-xs text-on-surface-variant">
										<span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5 shrink-0">
											check_circle
										</span>
										{r}
									</li>
								))}
							</ul>
						</div>
					)}

					<button
						type="button"
						onClick={() => generateMutation.mutate()}
						disabled={generateMutation.isPending}
						className="text-xs text-on-surface-variant underline underline-offset-2 hover:text-on-surface disabled:opacity-50"
					>
						{generateMutation.isPending ? t("generating") : t("regenerate")}
					</button>
				</>
			) : (
				<div className="text-center py-4">
					<span
						className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						auto_awesome
					</span>
					<p className="text-sm text-on-surface-variant mb-3">{t("noScore")}</p>
					<button
						type="button"
						onClick={() => generateMutation.mutate()}
						disabled={generateMutation.isPending}
						className="inline-flex items-center gap-2 bg-[#FF5A2E] text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
					>
						<span className="material-symbols-outlined text-sm">auto_awesome</span>
						{generateMutation.isPending ? t("generating") : t("generate")}
					</button>
					{generateMutation.data && !generateMutation.data.success && (
						<p className="text-xs text-rose-600 mt-2">
							{generateMutation.data.error ?? t("error")}
						</p>
					)}
				</div>
			)}
		</div>
	);
}
