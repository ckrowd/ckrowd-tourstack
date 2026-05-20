import { setRequestLocale } from "next-intl/server";
import { getAdminInvite } from "@/app/actions";
import AcceptInviteClient from "@/components/AcceptInviteClient";

type Props = {
	params: Promise<{ locale: string; token: string }>;
};

export default async function AcceptInvitePage({ params }: Props) {
	const { locale, token } = await params;
	setRequestLocale(locale);

	// Public preview — no auth required. The token is the secret.
	const result = await getAdminInvite(token);
	const data = result.data;

	const invite = data
		? {
				status: data.status,
				email: data.email,
				name: data.name,
				role: data.role,
				expiresAt:
					data.expiresAt instanceof Date
						? data.expiresAt.toISOString()
						: String(data.expiresAt),
				invitedBy: data.invitedBy
					? {
							name: data.invitedBy.name ?? null,
							email: data.invitedBy.email ?? null,
						}
					: null,
				userExists: data.userExists,
			}
		: null;

	return <AcceptInviteClient token={token} invite={invite} />;
}
