import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSession } from "@/app/actions";
import AdminSideNav from "@/components/AdminSideNav";
import TopNav from "@/components/TopNav";
import { adminHomePath, isPlatformAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
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
		redirect(`/${locale}/admin/login`);
	}
	if (!isPlatformAdmin(session)) {
		const home = adminHomePath(session);
		redirect(`/${locale}${home ?? "/dashboard"}`);
	}

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />

			<div className="flex pt-16 h-screen">
				<AdminSideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{children}
				</main>
			</div>
		</div>
	);
}
