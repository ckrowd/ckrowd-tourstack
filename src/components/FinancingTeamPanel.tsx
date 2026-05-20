"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	getFinancingTeam,
	inviteFinancingTeamMember,
	resendFinancingInvite,
	revokeFinancingInvite,
} from "@/app/actions";

type ActiveMember = {
	id: string;
	name: string | null;
	email: string | null;
};

type PendingInvite = {
	id: string;
	name: string;
	email: string;
	expires_at: string | Date;
};

export default function FinancingTeamPanel() {
	const t = useTranslations("FinancingAdminSettingsPage.team");
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");

	const query = useQuery({
		queryKey: ["financingTeam"],
		queryFn: () => getFinancingTeam(),
	});

	const inviteMutation = useMutation({
		mutationFn: inviteFinancingTeamMember,
		onSuccess: (result) => {
			if (result.success) {
				setName("");
				setEmail("");
				setOpen(false);
				void queryClient.invalidateQueries({ queryKey: ["financingTeam"] });
			}
		},
	});

	const resendMutation = useMutation({
		mutationFn: (id: string) => resendFinancingInvite(id),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["financingTeam"] });
			}
		},
	});

	const revokeMutation = useMutation({
		mutationFn: (id: string) => revokeFinancingInvite(id),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["financingTeam"] });
			}
		},
	});

	const team =
		query.data?.success && query.data.data
			? (query.data.data as { active: ActiveMember[]; invites: PendingInvite[] })
			: { active: [], invites: [] };

	const inviteError =
		inviteMutation.error
			? inviteMutation.error instanceof Error
				? inviteMutation.error.message
				: t("inviteError")
			: inviteMutation.data && !inviteMutation.data.success
				? (inviteMutation.data.error ?? t("inviteError"))
				: null;

	return (
		<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
			<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
				{t("title")}
			</h3>

			{query.isLoading ? (
				<p className="text-sm text-on-surface-variant py-4">{t("loading")}</p>
			) : !query.data?.success ? (
				<p className="text-sm text-red-600 py-4">{t("loadError")}</p>
			) : team.active.length === 0 && team.invites.length === 0 ? (
				<p className="text-sm text-on-surface-variant py-4">{t("empty")}</p>
			) : (
				<div className="space-y-3">
					{team.active.map((m) => {
						const name = m.name ?? "";
						const email = m.email ?? "";
						return (
							<div
								key={m.id}
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
									{t("activeBadge")}
								</span>
							</div>
						);
					})}

					{team.invites.map((invite) => {
						const expires = new Date(invite.expires_at).toLocaleDateString();
						const busyResend =
							resendMutation.isPending &&
							resendMutation.variables === invite.id;
						const busyRevoke =
							revokeMutation.isPending &&
							revokeMutation.variables === invite.id;
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
									<button
										type="button"
										onClick={() => resendMutation.mutate(invite.id)}
										disabled={busyResend || busyRevoke}
										className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-low disabled:opacity-60"
									>
										{busyResend ? t("resending") : t("resend")}
									</button>
									<button
										type="button"
										onClick={() => revokeMutation.mutate(invite.id)}
										disabled={busyResend || busyRevoke}
										className="text-xs font-semibold px-3 py-1.5 rounded-lg text-red-700 border border-red-200 hover:bg-red-50 disabled:opacity-60"
									>
										{busyRevoke ? t("revoking") : t("revoke")}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{!open ? (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="mt-4 w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2"
				>
					<span className="material-symbols-outlined text-sm">person_add</span>
					{t("invite")}
				</button>
			) : (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						const trimmedName = name.trim();
						const trimmedEmail = email.trim();
						if (!trimmedName || !trimmedEmail) return;
						inviteMutation.mutate({
							name: trimmedName,
							email: trimmedEmail,
						});
					}}
					className="mt-4 space-y-3 border-2 border-dashed border-outline-variant/40 rounded-xl p-4"
				>
					<div>
						<label
							htmlFor="finance-invite-name"
							className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant"
						>
							{t("nameLabel")}
						</label>
						<input
							id="finance-invite-name"
							type="text"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={t("namePlaceholder")}
							className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
						/>
					</div>
					<div>
						<label
							htmlFor="finance-invite-email"
							className="mb-1.5 block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant"
						>
							{t("emailLabel")}
						</label>
						<input
							id="finance-invite-email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={t("emailPlaceholder")}
							className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
						/>
					</div>
					<div className="flex gap-2">
						<button
							type="submit"
							disabled={inviteMutation.isPending}
							className="flex-1 py-2.5 bg-[#FF5A30] text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60"
						>
							{inviteMutation.isPending ? t("inviting") : t("sendInvite")}
						</button>
						<button
							type="button"
							onClick={() => setOpen(false)}
							disabled={inviteMutation.isPending}
							className="px-4 py-2.5 border border-outline-variant/30 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-60"
						>
							{t("cancel")}
						</button>
					</div>
					{inviteMutation.data?.success && (
						<p className="text-sm text-emerald-700 font-medium">
							{t("inviteSuccess")}
						</p>
					)}
					{inviteError && (
						<p className="text-sm text-rose-700 font-medium">{inviteError}</p>
					)}
				</form>
			)}
		</div>
	);
}
