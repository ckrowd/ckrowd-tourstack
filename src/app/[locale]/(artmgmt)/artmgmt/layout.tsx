import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import ArtmgmtPasswordGate from "@/components/ArtmgmtPasswordGate";
import ArtmgmtSideNav from "@/components/ArtmgmtSideNav";
import TopNav from "@/components/TopNav";
import { getArtmgmtProfile, getSession, getTourstackProfile } from "@/app/actions";
import { isArtmgmtProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ArtmgmtLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await getSession();
	if (!session) {
		redirect(`/${locale}/artmgmt/login`);
	}

	const profile = await getTourstackProfile();
	if (!isArtmgmtProfile(profile.data as { role?: string | null } | null)) {
		redirect(`/${locale}/artmgmt/login`);
	}

	const artmgmtProfile = await getArtmgmtProfile();
	const forcePasswordChange =
		(artmgmtProfile.data as { force_password_change?: boolean } | null)
			?.force_password_change === true;

	return (
		<ArtmgmtPasswordGate forcePasswordChange={forcePasswordChange}>
			<div className="bg-surface text-on-surface">
				<TopNav />
				<div className="flex pt-16 h-screen">
					<ArtmgmtSideNav />
					<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
						{children}
					</main>
				</div>
			</div>
		</ArtmgmtPasswordGate>
	);
}
