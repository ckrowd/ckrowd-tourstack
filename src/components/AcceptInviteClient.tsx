"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { acceptAdminInvite, signOut } from "@/app/actions";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { useSession } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/routing";

type AdminScope = "platform" | "insurance" | "financing";

const SCOPE_HOME: Record<AdminScope, string> = {
	platform: "/admin",
	insurance: "/insurance-admin",
	financing: "/financing-admin",
};

type Invite = {
	status: "active" | "accepted" | "revoked" | "not_found";
	email: string;
	name: string;
	role: AdminScope;
	invitedBy: { name: string | null; email: string | null } | null;
	userExists: boolean;
};

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
			<Shell>
				<h1 className="text-xl font-bold text-on-surface mb-2">
					{t("notFoundTitle")}
				</h1>
				<p className="text-sm text-on-surface-variant">{t("notFoundDesc")}</p>
			</Shell>
		);
	}

	if (invite.status === "revoked") {
		return (
			<Shell>
				<h1 className="text-xl font-bold text-on-surface mb-2">
					{t("revokedTitle")}
				</h1>
				<p className="text-sm text-on-surface-variant">{t("revokedDesc")}</p>
			</Shell>
		);
	}

	if (invite.status === "accepted") {
		return (
			<Shell>
				<h1 className="text-xl font-bold text-on-surface mb-2">
					{t("acceptedTitle")}
				</h1>
				<p className="text-sm text-on-surface-variant">{t("acceptedDesc")}</p>
				<div className="mt-5 flex justify-end">
					<Link
						href="/login"
						className="px-4 py-2 rounded-lg text-sm font-bold bg-[#FF5A30] text-white hover:opacity-90"
					>
						{t("goToSignIn")}
					</Link>
				</div>
			</Shell>
		);
	}

	if (isLoading && !session) {
		return (
			<Shell>
				<p className="text-sm text-on-surface-variant">{t("loadingSession")}</p>
			</Shell>
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
			<Shell>
				<h1 className="text-xl font-bold text-on-surface mb-1">
					{t("invitedTitle")}
				</h1>
				<p className="text-sm text-on-surface-variant mb-4">
					{t("invitedDesc", {
						inviter: inviterLabel,
						scope: scopeLabel(invite.role),
					})}
				</p>
				<dl className="mb-5 text-sm bg-surface-container-low rounded-xl p-4 space-y-2">
					<Row label={t("inviteeName")} value={invite.name} />
					<Row label={t("inviteeEmail")} value={invite.email} />
					<Row label={t("scope")} value={scopeLabel(invite.role)} />
				</dl>
				<div className="flex flex-col gap-2">
					{invite.userExists ? (
						<Link
							href={signInHref}
							className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-[#FF5A30] text-white hover:opacity-90"
						>
							{t("signInToAccept")}
						</Link>
					) : (
						<Link
							href={registerHref}
							className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-bold bg-[#FF5A30] text-white hover:opacity-90"
						>
							{t("createAccountToAccept")}
						</Link>
					)}
					<p className="text-xs text-on-surface-variant text-center">
						{t("useExactEmail", { email: invite.email })}
					</p>
				</div>
			</Shell>
		);
	}

	// Signed in as wrong account
	if (session.user.email?.toLowerCase() !== invite.email.toLowerCase()) {
		return (
			<Shell>
				<h1 className="text-xl font-bold text-on-surface mb-1">
					{t("wrongAccountTitle")}
				</h1>
				<p className="text-sm text-on-surface-variant mb-4">
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
					className="w-full px-4 py-2.5 rounded-lg text-sm font-bold border border-outline-variant/30 hover:bg-surface-container-low"
				>
					{signingOut ? t("signingOut") : t("signOutToSwitch")}
				</button>
			</Shell>
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
		<Shell>
			<h1 className="text-xl font-bold text-on-surface mb-1">
				{t("readyTitle")}
			</h1>
			<p className="text-sm text-on-surface-variant mb-4">
				{t("readyDesc", {
					inviter: inviterLabel,
					scope: scopeLabel(invite.role),
				})}
			</p>
			<dl className="mb-5 text-sm bg-surface-container-low rounded-xl p-4 space-y-2">
				<Row label={t("inviteeEmail")} value={invite.email} />
				<Row label={t("scope")} value={scopeLabel(invite.role)} />
			</dl>
			{resultError && (
				<p className="text-sm text-red-600 font-semibold mb-3">{resultError}</p>
			)}
			<button
				type="button"
				disabled={acceptMutation.isPending}
				onClick={() => acceptMutation.mutate()}
				className="w-full px-4 py-2.5 rounded-lg text-sm font-bold bg-[#FF5A30] text-white hover:opacity-90 disabled:opacity-60"
			>
				{acceptMutation.isPending ? t("accepting") : t("acceptInvitation")}
			</button>
		</Shell>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="flex items-center justify-center">
						<AuthBrandLockup />
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					{children}
				</div>
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-3">
			<dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
				{label}
			</dt>
			<dd className="text-sm font-semibold text-on-surface text-right">
				{value}
			</dd>
		</div>
	);
}
