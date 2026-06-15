"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { inviteAdminTeamMember } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

export default function AdminTeamInvite() {
	const t = useTranslations("AdminSettingsPage");
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"platform" | "insurance" | "financing">(
		"platform",
	);

	const inviteMutation = useMutation({
		mutationFn: inviteAdminTeamMember,
		onSuccess: (result) => {
			if (result.success) {
				setName("");
				setEmail("");
				setOpen(false);
				router.refresh();
			}
		},
	});

	const errorMessage = inviteMutation.error
		? inviteMutation.error instanceof Error
			? inviteMutation.error.message
			: t("team.inviteError")
		: inviteMutation.data && !inviteMutation.data.success
			? (inviteMutation.data.error ?? t("team.inviteError"))
			: null;

	if (!open) {
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2 mt-4"
			>
				<span className="material-symbols-outlined text-sm">person_add</span>
				{t("team.invite")}
			</button>
		);
	}

	const labelClass =
		"mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant";
	const inputClass =
		"w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-2.5 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20";

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const trimmedName = name.trim();
				const trimmedEmail = email.trim();
				if (!trimmedName || !trimmedEmail) return;
				inviteMutation.mutate({
					name: trimmedName,
					email: trimmedEmail,
					role,
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
					{t("team.roleLabel")}
				</label>
				<select
					id="invite-role"
					value={role}
					onChange={(event) =>
						setRole(event.target.value as typeof role)
					}
					className={inputClass}
				>
					<option value="platform">{t("team.rolePlatform")}</option>
					<option value="insurance">{t("team.roleInsurance")}</option>
					<option value="financing">{t("team.roleFinancing")}</option>
				</select>
			</div>
			<div className="flex gap-2">
				<button
					type="submit"
					disabled={inviteMutation.isPending}
					className="flex-1 py-2.5 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
				>
					{inviteMutation.isPending ? t("team.inviting") : t("team.sendInvite")}
				</button>
				<button
					type="button"
					onClick={() => setOpen(false)}
					disabled={inviteMutation.isPending}
					className="px-4 py-2.5 border border-outline-variant/30 rounded-xl font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-60"
				>
					{t("team.cancel")}
				</button>
			</div>
			{inviteMutation.data?.success && (
				<p className="text-sm text-emerald-700 font-medium">
					{t("team.inviteSuccess")}
				</p>
			)}
			{errorMessage && (
				<p className="text-sm text-rose-700 font-medium">{errorMessage}</p>
			)}
		</form>
	);
}
