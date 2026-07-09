import { redirect } from "next/navigation";

// The standalone /apply form was an orphaned surface from the pre-redesign
// funnel (nothing linked to it). Applications now flow through the unified
// onboarding at /get-started, so any stale /apply link lands there.
export default async function ApplyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	redirect(`/${locale}/get-started`);
}
