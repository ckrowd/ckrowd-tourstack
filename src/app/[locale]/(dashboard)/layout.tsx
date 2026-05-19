import { redirect } from "next/navigation";
import { getSession } from "@/app/actions";
import { isAdminSession } from "@/lib/auth";

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
	if (isAdminSession(session)) {
		redirect(`/${locale}/admin`);
	}

	return <>{children}</>;
}
