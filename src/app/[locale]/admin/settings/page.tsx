import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminSettings, getAdminTeam } from "@/app/actions";
import AdminDangerZone from "@/components/AdminDangerZone";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import AdminTeamInvite from "@/components/AdminTeamInvite";

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
	const team = teamResult.data ?? [];

	return (
		<>
			<div className="mb-10">
				<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
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
						<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-4 pb-4 border-b border-outline-variant/20">
							{t("team.title")}
						</h3>
						{!teamResult.success ? (
							<p className="text-sm text-on-surface-variant">
								{t("team.loadError")}
							</p>
						) : (
							<>
								{team.length === 0 ? (
									<p className="text-sm text-on-surface-variant">
										{t("team.empty")}
									</p>
								) : (
									<div className="space-y-3">
										{team.map((member) => {
											const name = String(member.name ?? "");
											const email = String(member.email ?? "");
											return (
												<div
													key={String(member.id)}
													className="flex items-center justify-between p-3 border border-outline-variant/10 rounded-xl"
												>
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-on-surface-variant">
															{(name || email || "?").charAt(0).toUpperCase()}
														</div>
														<div>
															<p className="text-sm font-bold text-on-surface">
																{name}
															</p>
															<p className="text-xs text-on-surface-variant">
																{email}
															</p>
														</div>
													</div>
													<span className="text-xs font-bold text-[#FF5A30] bg-orange-50 px-3 py-1 rounded-full">
														{t("team.role")}
													</span>
												</div>
											);
										})}
									</div>
								)}
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
