import type {} from "next";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
	getMessages,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import QueryProvider from "@/components/QueryProvider";
import { routing } from "@/i18n/routing";

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
	weight: ["400", "600", "700", "800"],
});

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "Metadata" });

	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "https://tourstack.ckrowd.com";

	return {
		title: {
			template: "%s | Tourstack by Ckrowd",
			default: t("title"),
		},
		description: t("description"),
		applicationName: "Tourstack",
		keywords: [
			"live music",
			"touring",
			"concerts",
			"africa",
			"promoters",
			"artists",
			"financing",
			"insurance",
		],
		authors: [{ name: "Ckrowd", url: "https://ckrowd.africa" }],
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: `/${locale}`,
			languages: {
				en: "/en",
				fr: "/fr",
			},
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			url: `/${locale}`,
			siteName: "Tourstack by Ckrowd",
			images: [
				{
					url: "/og-image.jpg", // Placeholder for actual OG image
					width: 1200,
					height: 630,
					alt: "Tourstack by Ckrowd",
				},
			],
			locale: locale,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
			creator: "@ckrowdafrica",
			images: ["/og-image.jpg"],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as "en" | "fr")) {
		notFound();
	}

	// Enable static rendering
	setRequestLocale(locale);

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages();

	return (
		<html lang={locale} className={`${manrope.variable} ${inter.variable}`}>
			<head>
				{/* eslint-disable-next-line @next/next/no-page-custom-font */}
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
				/>
			</head>
			<body className="min-h-full antialiased" suppressHydrationWarning>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<QueryProvider>{children}</QueryProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
