import type { } from "next";
import { Manrope, Inter } from "next/font/google";
import "../globals.css";
import QueryProvider from "@/components/QueryProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description')
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
	children,
	params
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
