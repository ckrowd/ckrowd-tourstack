import { redirect } from "next/navigation";
import { getSession } from "@/app/actions";
import { adminHomePath } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const session = await getSession();

	if (!session) {
		redirect(`/${locale}/login`);
	}
	const home = adminHomePath(session);
	if (home) {
		redirect(`/${locale}${home}`);
	}

	return <>{children}</>;
}
