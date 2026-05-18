import { redirect } from "next/navigation";
import { getSession } from "@/app/actions";
import { isAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Already-authenticated users should never see the regular login form.
export default async function LoginLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const session = await getSession();

	if (session?.user) {
		redirect(isAdminSession(session) ? `/${locale}/admin` : `/${locale}/profile`);
	}

	return <>{children}</>;
}
