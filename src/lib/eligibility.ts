// Financing-application products that count as insurance cover (mirrors the
// backend insurance suite). Used to detect whether a promoter has insurance.
export const INSURANCE_PRODUCTS = [
	"Event Insurance Bundle",
	"Event Cancellation",
	"Credit Guarantee",
	"Promoter Business",
	"Touring Workforce",
	"Aviation & Equipment",
	"Audience Ticket Protection",
] as const;

export type ReadinessKey = "service" | "workforce" | "artmgmt" | "insurance";

export type EcosystemReadiness = {
	counts: Record<"service" | "workforce" | "artmgmt", number>;
	total: number;
	hasInsurance: boolean;
	checklist: { key: ReadinessKey; done: boolean; count: number }[];
	completedCount: number;
	completionPct: number;
	eligible: boolean;
};

/**
 * Computes a promoter's ecosystem-onboarding readiness and financing
 * eligibility from data the dashboard already loads — the stakeholders they've
 * onboarded (by category) and their financing applications (to detect
 * insurance). Eligibility for financing is the platform's stated condition:
 * the core ecosystem (service providers + workforce) is onboarded and
 * insurance is in place.
 */
export function computeEcosystemReadiness(
	stakeholders: { category: string }[],
	financingApplications: { product: string }[],
): EcosystemReadiness {
	const counts = { service: 0, workforce: 0, artmgmt: 0 };
	for (const s of stakeholders) {
		if (s.category === "service") counts.service += 1;
		else if (s.category === "workforce") counts.workforce += 1;
		else if (s.category === "artmgmt") counts.artmgmt += 1;
	}
	const total = counts.service + counts.workforce + counts.artmgmt;
	const hasInsurance = financingApplications.some((a) =>
		(INSURANCE_PRODUCTS as readonly string[]).includes(a.product),
	);

	const checklist: EcosystemReadiness["checklist"] = [
		{ key: "service", done: counts.service > 0, count: counts.service },
		{ key: "workforce", done: counts.workforce > 0, count: counts.workforce },
		{ key: "artmgmt", done: counts.artmgmt > 0, count: counts.artmgmt },
		{ key: "insurance", done: hasInsurance, count: hasInsurance ? 1 : 0 },
	];
	const completedCount = checklist.filter((c) => c.done).length;
	const completionPct = Math.round((completedCount / checklist.length) * 100);
	const eligible = counts.service > 0 && counts.workforce > 0 && hasInsurance;

	return {
		counts,
		total,
		hasInsurance,
		checklist,
		completedCount,
		completionPct,
		eligible,
	};
}
