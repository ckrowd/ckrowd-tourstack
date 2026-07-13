import { setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FinancingAdminSideNav from "@/components/FinancingAdminSideNav";
import TopNav from "@/components/TopNav";
import { getSession } from "@/app/actions";
import { adminHomePath, isFinancingAdmin, stripLocalePrefix } from "@/lib/auth";

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
		const pathname = (await headers()).get("x-pathname") ?? `/${locale}/financing-admin`;
		const from = stripLocalePrefix(pathname, locale);
		redirect(`/${locale}/financing-admin/login?from=${encodeURIComponent(from)}`);
	}
	if (!isFinancingAdmin(session)) {
		const home = adminHomePath(session);
		redirect(`/${locale}${home ?? "/dashboard"}`);
	}

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16">
				<FinancingAdminSideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{children}
				</main>
			</div>
		</div>
	);
}
