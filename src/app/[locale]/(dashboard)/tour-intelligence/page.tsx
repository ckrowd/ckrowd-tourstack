import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEOIs } from "@/app/actions";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import AIToolsClient from "@/components/AIToolsClient";
import PageHero from "@/components/PageHero";
import PageTour from "@/components/PageTour";

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
				<main className="flex-1 lg:ml-64 bg-surface p-6 md:px-10 md:pt-5 md:pb-10">
					<PageTour pageId="tour-intelligence" />
					<PageHero
						image="/landing-artist.jpg"
						title={t("title")}
						description={t("description")}
					/>
					<AIToolsClient eois={eois} />
				</main>
			</div>
		</div>
	);
}
