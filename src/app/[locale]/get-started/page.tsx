import { setRequestLocale } from "next-intl/server";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default async function GetStartedPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return <OnboardingWizard />;
}
