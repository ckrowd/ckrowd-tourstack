import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("PrivacyPage");
	const email = t("email");

	const renderContent = (content: string) =>
		content.split(/(\{contactLink\}|\{email\})/g).map((part, i) => {
			if (part === "{contactLink}") {
				return (
					<Link
						key={i}
						href="/contact"
						className="text-[#FF5A30] font-bold hover:underline"
					>
						{t("contactLink")}
					</Link>
				);
			}

			if (part === "{email}") {
				return (
					<a
						key={i}
						href={`mailto:${email}`}
						className="text-[#FF5A30] font-bold hover:underline"
					>
						{email}
					</a>
				);
			}

			return part;
		});

	return (
		<div className="bg-surface text-on-surface min-h-screen flex flex-col">
			<TopNav />

			<main className="flex-1 pt-32 pb-20 px-6">
				<div className="max-w-3xl mx-auto">
					<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("legal")}
					</span>
					<h1 className="text-5xl font-black font-(family-name:--font-manrope) tracking-tight mb-4">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant font-medium mb-12">
						{t("lastUpdated")}
					</p>

					<div className="space-y-12">
						{(t.raw("sections") as { title: string; content: string }[]).map(
							(section, idx) => (
								<section key={idx}>
									<h2 className="text-xl font-bold font-(family-name:--font-manrope) mb-4">
										{section.title}
									</h2>
									<div className="text-on-surface-variant leading-relaxed space-y-4">
										<p>{renderContent(section.content)}</p>
									</div>
								</section>
							),
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
