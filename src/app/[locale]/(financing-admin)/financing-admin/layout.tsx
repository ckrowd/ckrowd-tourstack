import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import FinancingAdminSideNav from "@/components/FinancingAdminSideNav";
import TopNav from "@/components/TopNav";
import { getSession } from "@/app/actions";
import { isAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function FinancingAdminLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await getSession();
	if (!session) {
		redirect(`/${locale}/financing-admin/login`);
	}
	if (!isAdminSession(session)) {
		redirect(`/${locale}/dashboard`);
	}

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16 h-screen">
				<FinancingAdminSideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{children}
				</main>
			</div>
		</div>
	);
}
