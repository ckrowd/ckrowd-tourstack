import { redirect } from "next/navigation";
import { getSession } from "@/app/actions";
import { adminHomePath } from "@/lib/auth";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";

export const dynamic = "force-dynamic";

export default async function TicketsDashboardLayout({
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

	return (
		<div className="ts-dash bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<main className="flex-1 lg:ml-64 bg-surface min-h-screen">
					{children}
				</main>
			</div>
		</div>
	);
}
