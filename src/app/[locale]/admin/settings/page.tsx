import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminSettings, getAdminTeam } from "@/app/actions";

export const dynamic = "force-dynamic";
import AdminDangerZone from "@/components/AdminDangerZone";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import AdminTeamInvite from "@/components/AdminTeamInvite";
import AdminTeamList from "@/components/AdminTeamList";

export default async function AdminSettingsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminSettingsPage");

	const [settingsResult, teamResult] = await Promise.all([
		getAdminSettings(),
		getAdminTeam(),
	]);
	const settings = settingsResult.data;
	const team = teamResult.data ?? { active: [], invites: [] };
	const active = "active" in team ? team.active : [];
	const invites = "invites" in team ? team.invites : [];

	return (
		<>
			<div className="mb-10">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("badge")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">
					{t("description")}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-6">
					{settings ? (
						<AdminSettingsForm
							initial={{
								strict_budget_match: settings.strict_budget_match,
								auto_approve_high_match: settings.auto_approve_high_match,
							}}
						/>
					) : (
						<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
							<p className="text-sm text-on-surface-variant">
								{t("loadError")}
							</p>
						</div>
					)}

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-lg mb-4 pb-4 border-b border-outline-variant/20">
							{t("team.title")}
						</h3>
						{!teamResult.success ? (
							<p className="text-sm text-on-surface-variant">
								{t("team.loadError")}
							</p>
						) : (
							<>
								<AdminTeamList active={active} invites={invites} />
								<AdminTeamInvite />
							</>
						)}
					</div>
				</div>

				<div className="space-y-6">
					<AdminDangerZone />
				</div>
			</div>
		</>
	);
}
