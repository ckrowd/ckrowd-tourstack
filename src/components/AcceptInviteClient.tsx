"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { acceptAdminInvite, signOut } from "@/app/actions";
import AuthShell from "@/components/auth/AuthShell";
import { authPrimaryBtn, authTitle } from "@/components/auth/authFields";
import Loader from "@/components/Loader";
import { useSession } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/routing";

type AdminScope = "platform" | "insurance" | "financing";

const SCOPE_HOME: Record<AdminScope, string> = {
	platform: "/admin",
	insurance: "/insurance-admin",
	financing: "/financing-admin",
};

type Invite = {
	status: "active" | "accepted" | "revoked" | "expired" | "not_found";
	email: string;
	name: string;
	role: AdminScope;
	invitedBy: { name: string | null; email: string | null } | null;
	userExists: boolean;
};

// Full-width link styled as the primary CTA (authPrimaryBtn is built for
// <button>, so links add the block/centering).
const primaryLinkCls = `${authPrimaryBtn} block text-center`;

export default function AcceptInviteClient({
	token,
	invite,
}: {
	token: string;
	invite: Invite | null;
}) {
	const t = useTranslations("AcceptInvitePage");
	const router = useRouter();
	const { data: session, isLoading } = useSession();
	const [signingOut, setSigningOut] = useState(false);

	const acceptMutation = useMutation({
		mutationFn: () => acceptAdminInvite(token),
		onSuccess: (result) => {
			if (!result.success) return;
			const home = invite ? SCOPE_HOME[invite.role] : "/dashboard";
			window.location.replace(home);
		},
	});

	// If user is signed in and the wrong account, offer to sign them out so
	// they can sign back in as the invitee.
	useEffect(() => {
		// no auto-action; just keep effect spot for future enhancements
	}, [session, invite]);

	const scopeLabel = (s: AdminScope) =>
		s === "platform"
			? t("rolePlatform")
			: s === "insurance"
				? t("roleInsurance")
				: t("roleFinancing");

	// === States ===

	if (!invite || invite.status === "not_found") {
		return (
			<AuthShell>
				<h1 className={authTitle}>{t("notFoundTitle")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("notFoundDesc")}</p>
			</AuthShell>
		);
	}

	if (invite.status === "revoked") {
		return (
			<AuthShell>
				<h1 className={authTitle}>{t("revokedTitle")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("revokedDesc")}</p>
			</AuthShell>
		);
	}

	if (invite.status === "expired") {
		return (
			<AuthShell>
				<h1 className={authTitle}>{t("expiredTitle")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("expiredDesc")}</p>
			</AuthShell>
		);
	}

	if (invite.status === "accepted") {
		return (
			<AuthShell>
				<h1 className={authTitle}>{t("acceptedTitle")}</h1>
				<p className="mt-2 mb-6 text-sm text-[var(--muted)]">{t("acceptedDesc")}</p>
				<Link href="/login" className={primaryLinkCls}>
					{t("goToSignIn")}
				</Link>
			</AuthShell>
		);
	}

	if (isLoading && !session) {
		return (
			<AuthShell>
				<div className="flex justify-center">
					<Loader size={36} />
				</div>
			</AuthShell>
		);
	}

	const inviterLabel =
		invite.invitedBy?.name ?? invite.invitedBy?.email ?? t("anonymousInviter");

	// Not signed in — send them to login or register depending on whether the
	// invited email already has an account.
	if (!session?.user) {
		const next = encodeURIComponent(`/accept-invite/${token}`);
		const signInHref = `/login?from=${next}`;
		const registerHref = `/register?from=${next}`;
		return (
			<AuthShell>
				<h1 className={authTitle}>{t("invitedTitle")}</h1>
				<p className="mt-2 mb-6 text-sm text-[var(--muted)]">
					{t("invitedDesc", {
						inviter: inviterLabel,
						scope: scopeLabel(invite.role),
					})}
				</p>
				<dl className="mb-6 text-sm bg-[var(--surface)] border border-[var(--hair)] rounded-xl p-4 space-y-2">
					<Row label={t("inviteeName")} value={invite.name} />
					<Row label={t("inviteeEmail")} value={invite.email} />
					<Row label={t("scope")} value={scopeLabel(invite.role)} />
				</dl>
				<div className="flex flex-col gap-3">
					{invite.userExists ? (
						<Link href={signInHref} className={primaryLinkCls}>
							{t("signInToAccept")}
						</Link>
					) : (
						<Link href={registerHref} className={primaryLinkCls}>
							{t("createAccountToAccept")}
						</Link>
					)}
					<p className="text-xs text-[var(--muted)] text-center">
						{t("useExactEmail", { email: invite.email })}
					</p>
				</div>
			</AuthShell>
		);
	}

	// Signed in as wrong account
	if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
		return (
			<AuthShell>
				<h1 className={authTitle}>{t("wrongAccountTitle")}</h1>
				<p className="mt-2 mb-6 text-sm text-[var(--muted)]">
					{t("wrongAccountDesc", { invitee: invite.email })}
				</p>
				<button
					type="button"
					disabled={signingOut}
					onClick={async () => {
						setSigningOut(true);
						await signOut();
						router.refresh();
					}}
					className="w-full py-3.5 rounded-xl border border-[var(--hair)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)] transition-colors disabled:opacity-60"
				>
					{signingOut ? t("signingOut") : t("signOutToSwitch")}
				</button>
			</AuthShell>
		);
	}

	// Signed in as the right user — show accept button
	const resultError =
		acceptMutation.data && !acceptMutation.data.success
			? acceptMutation.data.error || t("acceptError")
			: acceptMutation.error
				? t("acceptError")
				: null;

	return (
		<AuthShell>
			<h1 className={authTitle}>{t("readyTitle")}</h1>
			<p className="mt-2 mb-6 text-sm text-[var(--muted)]">
				{t("readyDesc", {
					inviter: inviterLabel,
					scope: scopeLabel(invite.role),
				})}
			</p>
			<dl className="mb-6 text-sm bg-[var(--surface)] border border-[var(--hair)] rounded-xl p-4 space-y-2">
				<Row label={t("inviteeEmail")} value={invite.email} />
				<Row label={t("scope")} value={scopeLabel(invite.role)} />
			</dl>
			{resultError && (
				<p className="text-sm text-red-400 font-semibold mb-3" role="alert">
					{resultError}
				</p>
			)}
			<button
				type="button"
				disabled={acceptMutation.isPending}
				onClick={() => acceptMutation.mutate()}
				className={authPrimaryBtn}
			>
				{acceptMutation.isPending ? t("accepting") : t("acceptInvitation")}
			</button>
		</AuthShell>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-3">
			<dt className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
				{label}
			</dt>
			<dd className="text-sm font-semibold text-[var(--text)] text-right">
				{value}
			</dd>
		</div>
	);
}
