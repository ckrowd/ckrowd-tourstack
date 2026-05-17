import { redirect } from "next/navigation";
import { getSession } from "@/app/actions";

export const dynamic = "force-dynamic";

// Already-authenticated users should never see the login form — send them
// straight to their profile.
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
		redirect(`/${locale}/profile`);
	}

	return <>{children}</>;
}
