import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEOIs } from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import AIToolsClient from "@/components/AIToolsClient";

export default async function AIToolsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AIToolsPage");

	const eoisResult = await getEOIs();
	const eois = (eoisResult.data ?? []) as { id: unknown; status: unknown; artist: unknown; city: unknown }[];

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16">
				<SideNav />
				<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
					<div className="mb-8">
						<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
							{t("title")}
						</h1>
						<p className="text-on-surface-variant font-medium">{t("description")}</p>
					</div>
					<AIToolsClient eois={eois} />
				</main>
			</div>
		</div>
	);
}
