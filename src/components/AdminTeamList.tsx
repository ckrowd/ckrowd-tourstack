"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	resendAdminInvite,
	revokeAdminInvite,
	setAdminRoles,
} from "@/app/actions";

type AdminScope = "platform" | "insurance" | "financing";

// Order a multi-role admin's scopes are displayed in (matches lib/auth.ts).
const SCOPE_PRECEDENCE: AdminScope[] = ["platform", "financing", "insurance"];

type ActiveMember = {
	id: string;
	name: string | null;
	email: string | null;
	tourstack_admin_role: AdminScope | null;
	tourstack_admin_roles?: AdminScope[] | null;
};

type PendingInvite = {
	id: string;
	name: string;
	email: string;
	role: AdminScope;
};

/** Effective scopes for a member: the roles array plus the legacy column. */
function memberScopes(member: ActiveMember): AdminScope[] {
	const set = new Set<AdminScope>(member.tourstack_admin_roles ?? []);
	if (member.tourstack_admin_role) set.add(member.tourstack_admin_role);
	return SCOPE_PRECEDENCE.filter((s) => set.has(s));
}

export default function AdminTeamList({
	active,
	invites,
}: {
	active: ActiveMember[];
	invites: PendingInvite[];
}) {
	const t = useTranslations("AdminSettingsPage.team");
	const router = useRouter();
	const [busyInviteId, setBusyInviteId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [draftScopes, setDraftScopes] = useState<AdminScope[]>([]);

	const resendMutation = useMutation({
		mutationFn: (id: string) => resendAdminInvite(id),
		onMutate: (id) => setBusyInviteId(id),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("inviteError"));
				return;
			}
			setError(null);
			router.refresh();
		},
		onError: () => setError(t("inviteError")),
		onSettled: () => setBusyInviteId(null),
	});

	const revokeMutation = useMutation({
		mutationFn: (id: string) => revokeAdminInvite(id),
		onMutate: (id) => setBusyInviteId(id),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("inviteError"));
				return;
			}
			setError(null);
			router.refresh();
		},
		onError: () => setError(t("inviteError")),
		onSettled: () => setBusyInviteId(null),
	});

	const rolesMutation = useMutation({
		mutationFn: (vars: { userId: string; roles: AdminScope[] }) =>
			setAdminRoles(vars),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("rolesUpdateError"));
				return;
			}
			setError(null);
			setEditingId(null);
			router.refresh();
		},
		onError: () => setError(t("rolesUpdateError")),
	});

	if (active.length === 0 && invites.length === 0) {
		return <p className="text-sm text-on-surface-variant">{t("empty")}</p>;
	}

	const scopeLabel = (s: AdminScope) =>
		s === "platform"
			? t("rolePlatform")
			: s === "insurance"
				? t("roleInsurance")
				: t("roleFinancing");

	const startEditing = (member: ActiveMember) => {
		setError(null);
		setEditingId(member.id);
		setDraftScopes(memberScopes(member));
	};

	const toggleDraftScope = (scope: AdminScope) => {
		setDraftScopes((prev) =>
			prev.includes(scope)
				? prev.filter((s) => s !== scope)
				: SCOPE_PRECEDENCE.filter((s) => s === scope || prev.includes(s)),
		);
	};

	return (
		<div className="space-y-3">
			{active.map((member) => {
				const name = member.name ?? "";
				const email = member.email ?? "";
				const scopes = memberScopes(member);
				const isEditing = editingId === member.id;
				const saving = rolesMutation.isPending && isEditing;
				return (
					<div
						key={member.id}
						className="p-3 border border-outline-variant/10 rounded-xl"
					>
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-semibold text-sm text-on-surface-variant">
									{(name || email || "?").charAt(0).toUpperCase()}
								</div>
								<div>
									<p className="text-sm font-semibold text-on-surface">{name}</p>
									<p className="text-xs text-on-surface-variant">{email}</p>
								</div>
							</div>
							<div className="flex items-center gap-2 flex-wrap justify-end">
								{scopes.length > 0 ? (
									scopes.map((s) => (
										<span
											key={s}
											className="text-xs font-semibold text-[#FF5A30] bg-orange-50 px-3 py-1 rounded-full"
										>
											{scopeLabel(s)}
										</span>
									))
								) : (
									<span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
										{t("noRoles")}
									</span>
								)}
								{!isEditing && (
									<button
										type="button"
										onClick={() => startEditing(member)}
										className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low"
									>
										{t("editRoles")}
									</button>
								)}
							</div>
						</div>

						{isEditing && (
							<div className="mt-3 pt-3 border-t border-outline-variant/20">
								<p className="text-xs text-on-surface-variant mb-3">
									{t("editRolesHint")}
								</p>
								<div className="flex flex-wrap gap-2 mb-3">
									{SCOPE_PRECEDENCE.map((scope) => {
										const checked = draftScopes.includes(scope);
										return (
											<label
												key={scope}
												className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border cursor-pointer ${
													checked
														? "border-[#FF5A30] bg-orange-50 text-[#FF5A30]"
														: "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"
												}`}
											>
												<input
													type="checkbox"
													className="accent-[#FF5A30]"
													checked={checked}
													onChange={() => toggleDraftScope(scope)}
												/>
												{scopeLabel(scope)}
											</label>
										);
									})}
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() =>
											rolesMutation.mutate({
												userId: member.id,
												roles: draftScopes,
											})
										}
										disabled={saving}
										className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FF5A30] text-white hover:bg-[#e64f29] disabled:opacity-60"
									>
										{saving ? t("savingRoles") : t("saveRoles")}
									</button>
									<button
										type="button"
										onClick={() => {
											setEditingId(null);
											setError(null);
										}}
										disabled={saving}
										className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low disabled:opacity-60"
									>
										{t("cancelEdit")}
									</button>
								</div>
							</div>
						)}
					</div>
				);
			})}

			{invites.map((invite) => {
				const busy = busyInviteId === invite.id;
				return (
					<div
						key={invite.id}
						className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-amber-200 bg-amber-50/40 rounded-xl"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-semibold text-sm text-amber-700">
								{(invite.name || invite.email).charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-sm font-semibold text-on-surface">
									{invite.name}
								</p>
								<p className="text-xs text-on-surface-variant">
									{invite.email}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
								{t("invitedBadge")}
							</span>
							<span className="text-xs font-semibold text-[#FF5A30] bg-orange-50 px-3 py-1 rounded-full">
								{scopeLabel(invite.role)}
							</span>
							<button
								type="button"
								onClick={() => resendMutation.mutate(invite.id)}
								disabled={busy}
								className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low disabled:opacity-60"
							>
								{busy && resendMutation.isPending ? t("resending") : t("resend")}
							</button>
							<button
								type="button"
								onClick={() => revokeMutation.mutate(invite.id)}
								disabled={busy}
								className="text-xs font-semibold px-3 py-1.5 rounded-lg text-red-700 border border-red-200 hover:bg-red-50 disabled:opacity-60"
							>
								{busy && revokeMutation.isPending ? t("revoking") : t("revoke")}
							</button>
						</div>
					</div>
				);
			})}

			{error && (
				<p className="text-sm text-red-600 font-semibold mt-2">{error}</p>
			)}
		</div>
	);
}
