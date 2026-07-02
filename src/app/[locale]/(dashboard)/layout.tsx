import { redirect } from "next/navigation";
import { getSession, getTourstackProfile } from "@/app/actions";
import { adminHomePath, isArtmgmtProfile } from "@/lib/auth";
import ProfileSetupGate from "@/components/ProfileSetupGate";

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
		redirect(`/${locale}/login`);
	}
	const home = adminHomePath(session);
	if (home) {
		redirect(`/${locale}${home}`);
	}

	if (isArtmgmtProfile(profile.data as { role?: string | null } | null)) {
		redirect(`/${locale}/artmgmt`);
	}

	return (
		<>
			<ProfileSetupGate />
			{children}
		</>
	);
}
