"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inviteAdminTeamMember, setAdminRole } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

const SCOPES = ["platform", "insurance", "financing"] as const;
type Scope = (typeof SCOPES)[number];

type Member = Record<string, unknown>;

const labelClass =
	"mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant";
const inputClass =
	"w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20";

export default function AdminTeamPanel({ team }: { team: Member[] }) {
	const t = useTranslations("AdminSettingsPage");
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<Scope>("platform");
	const [pendingUserId, setPendingUserId] = useState<string | null>(null);

	const roleMutation = useMutation({
		mutationFn: setAdminRole,
		onSettled: () => setPendingUserId(null),
		onSuccess: (result) => {
			if (result.success) router.refresh();
		},
	});

	const inviteMutation = useMutation({
		mutationFn: inviteAdminTeamMember,
		onSuccess: (result) => {
			if (result.success) {
				setName("");
				setEmail("");
				setInviteRole("platform");
				setOpen(false);
				router.refresh();
			}
		},
	});

	function changeRole(userId: string, role: Scope | null) {
		setPendingUserId(userId);
		roleMutation.mutate({ userId, role });
	}

	const inviteError = inviteMutation.error
		? t("team.inviteError")
		: inviteMutation.data && !inviteMutation.data.success
			? (inviteMutation.data.error ?? t("team.inviteError"))
			: null;

	const roleError = roleMutation.error
		? t("team.updateError")
		: roleMutation.data && !roleMutation.data.success
			? (roleMutation.data.error ?? t("team.updateError"))
			: null;

	return (
		<>
			{team.length === 0 ? (
				<p className="text-sm text-on-surface-variant">{t("team.empty")}</p>
			) : (
				<div className="space-y-3">
					{team.map((member) => {
						const id = String(member.id);
						const memberName = String(member.name ?? "");
						const memberEmail = String(member.email ?? "");
						const role = String(
							member.tourstack_admin_role ?? "platform",
						) as Scope;
						const busy = roleMutation.isPending && pendingUserId === id;
						return (
							<div
								key={id}
								className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-outline-variant/10 rounded-xl"
							>
								<div className="flex items-center gap-3 min-w-0">
									<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-on-surface-variant shrink-0">
										{(memberName || memberEmail || "?")
											.charAt(0)
											.toUpperCase()}
									</div>
									<div className="min-w-0">
										<p className="text-sm font-bold text-on-surface truncate">
											{memberName}
										</p>
										<p className="text-xs text-on-surface-variant truncate">
											{memberEmail}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<select
										aria-label={t("team.scopeLabel")}
										value={role}
										disabled={busy}
										onChange={(event) =>
											changeRole(id, event.target.value as Scope)
										}
										className="rounded-lg border border-outline-variant/20 bg-surface-container-low px-2.5 py-1.5 text-xs font-bold text-on-surface outline-none focus:ring-2 focus:ring-[#FF5A30]/20 disabled:opacity-60"
									>
										{SCOPES.map((scope) => (
											<option key={scope} value={scope}>
												{t(`team.scopes.${scope}`)}
											</option>
										))}
									</select>
									<button
										type="button"
										onClick={() => changeRole(id, null)}
										disabled={busy}
										className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-60"
									>
										{t("team.remove")}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{roleError && (
				<p className="mt-3 text-sm text-rose-700 font-medium">{roleError}</p>
			)}

			{open ? (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						const trimmedName = name.trim();
						const trimmedEmail = email.trim();
						if (!trimmedName || !trimmedEmail) return;
						inviteMutation.mutate({
							name: trimmedName,
							email: trimmedEmail,
							role: inviteRole,
						});
					}}
					className="mt-4 space-y-3 border-2 border-dashed border-outline-variant/40 rounded-xl p-4"
				>
					<div>
						<label htmlFor="invite-name" className={labelClass}>
							{t("team.nameLabel")}
						</label>
						<input
							id="invite-name"
							type="text"
							required
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder={t("team.namePlaceholder")}
							className={inputClass}
						/>
					</div>
					<div>
						<label htmlFor="invite-email" className={labelClass}>
							{t("team.emailLabel")}
						</label>
						<input
							id="invite-email"
							type="email"
							required
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder={t("team.emailPlaceholder")}
							className={inputClass}
						/>
					</div>
					<div>
						<label htmlFor="invite-role" className={labelClass}>
							{t("team.scopeLabel")}
						</label>
						<select
							id="invite-role"
							value={inviteRole}
							onChange={(event) =>
								setInviteRole(event.target.value as Scope)
							}
							className={inputClass}
						>
							{SCOPES.map((scope) => (
								<option key={scope} value={scope}>
									{t(`team.scopes.${scope}`)}
								</option>
							))}
						</select>
					</div>
					<div className="flex gap-2">
						<button
							type="submit"
							disabled={inviteMutation.isPending}
							className="flex-1 py-2.5 bg-[#FF5A30] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
						>
							{inviteMutation.isPending
								? t("team.inviting")
								: t("team.sendInvite")}
						</button>
						<button
							type="button"
							onClick={() => setOpen(false)}
							disabled={inviteMutation.isPending}
							className="px-4 py-2.5 border border-outline-variant/30 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-60"
						>
							{t("team.cancel")}
						</button>
					</div>
					{inviteMutation.data?.success && (
						<p className="text-sm text-emerald-700 font-medium">
							{t("team.inviteSuccess")}
						</p>
					)}
					{inviteError && (
						<p className="text-sm text-rose-700 font-medium">{inviteError}</p>
					)}
				</form>
			) : (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2 mt-4"
				>
					<span className="material-symbols-outlined text-sm">person_add</span>
					{t("team.invite")}
				</button>
			)}
		</>
	);
}
