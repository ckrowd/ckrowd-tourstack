import { redirect } from "next/navigation";
import { getSession } from "@/app/actions";
import { adminHomePath } from "@/lib/auth";

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
		const home = adminHomePath(session);
		redirect(`/${locale}${home ?? "/profile"}`);
	}

	return <>{children}</>;
}
