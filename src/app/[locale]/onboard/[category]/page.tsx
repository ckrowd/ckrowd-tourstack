import { redirect } from "next/navigation";

// The per-category onboarding pages have been absorbed into the single
// onboarding flow at /get-started (role is chosen there), so users never enter
// overlapping information twice. Any old /onboard/<category> link now lands on
// the unified onboarding.
export default async function SelfServeOnboardingPage({
	params,
}: {
	params: Promise<{ locale: string; category: string }>;
}) {
	const { locale } = await params;
	redirect(`/${locale}/get-started`);
}
