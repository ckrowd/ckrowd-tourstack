import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, getTourstackProfile } from "@/app/actions";
import { adminHomePath, isArtmgmtProfile, stripLocalePrefix } from "@/lib/auth";
import ProfileSetupGate from "@/components/ProfileSetupGate";
import ScrollReveal from "@/components/dashboard/ScrollReveal";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const [session, profile] = await Promise.all([getSession(), getTourstackProfile()]);

	if (!session) {
		const pathname = (await headers()).get("x-pathname") ?? `/${locale}/dashboard`;
		const from = stripLocalePrefix(pathname, locale);
		redirect(`/${locale}/login?from=${encodeURIComponent(from)}`);
	}
	const home = adminHomePath(session);
	if (home) {
		redirect(`/${locale}${home}`);
	}

	if (isArtmgmtProfile(profile.data as { role?: string | null } | null)) {
		redirect(`/${locale}/artmgmt`);
	}

	return (
		<div className="ts-dash">
			<ProfileSetupGate />
			<ScrollReveal />
			{children}
		</div>
	);
}
