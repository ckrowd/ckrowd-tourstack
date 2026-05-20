"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resendAdminInvite, revokeAdminInvite } from "@/app/actions";

type AdminScope = "platform" | "insurance" | "financing";

type ActiveMember = {
	id: string;
	name: string | null;
	email: string | null;
	tourstack_admin_role: AdminScope | null;
};

type PendingInvite = {
	id: string;
	name: string;
	email: string;
	role: AdminScope;
	expires_at: string | Date;
};

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

	if (active.length === 0 && invites.length === 0) {
		return <p className="text-sm text-on-surface-variant">{t("empty")}</p>;
	}

	const scopeLabel = (s: AdminScope) =>
		s === "platform"
			? t("rolePlatform")
			: s === "insurance"
				? t("roleInsurance")
				: t("roleFinancing");

	return (
		<div className="space-y-3">
			{active.map((member) => {
				const name = member.name ?? "";
				const email = member.email ?? "";
				return (
					<div
						key={member.id}
						className="flex items-center justify-between p-3 border border-outline-variant/10 rounded-xl"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-sm text-on-surface-variant">
								{(name || email || "?").charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-sm font-bold text-on-surface">{name}</p>
								<p className="text-xs text-on-surface-variant">{email}</p>
							</div>
						</div>
						<span className="text-xs font-bold text-[#FF5A30] bg-orange-50 px-3 py-1 rounded-full">
							{member.tourstack_admin_role
								? scopeLabel(member.tourstack_admin_role)
								: t("role")}
						</span>
					</div>
				);
			})}

			{invites.map((invite) => {
				const expires = new Date(invite.expires_at).toLocaleDateString();
				const busy = busyInviteId === invite.id;
				return (
					<div
						key={invite.id}
						className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-amber-200 bg-amber-50/40 rounded-xl"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-sm text-amber-700">
								{(invite.name || invite.email).charAt(0).toUpperCase()}
							</div>
							<div>
								<p className="text-sm font-bold text-on-surface">
									{invite.name}
								</p>
								<p className="text-xs text-on-surface-variant">
									{invite.email}
								</p>
								<p className="text-[10px] text-on-surface-variant/80 mt-0.5">
									{t("inviteExpires", { date: expires })}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 flex-wrap">
							<span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
								{t("invitedBadge")}
							</span>
							<span className="text-xs font-bold text-[#FF5A30] bg-orange-50 px-3 py-1 rounded-full">
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
