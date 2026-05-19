import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/app/actions";
import InsuranceAdminSideNav from "@/components/InsuranceAdminSideNav";
import TopNav from "@/components/TopNav";

export default async function InsuranceAdminLayout({
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
		redirect(`/${locale}/insurance-admin/login`);
	}

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16 h-screen">
				<InsuranceAdminSideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{children}
				</main>
			</div>
		</div>
	);
}
