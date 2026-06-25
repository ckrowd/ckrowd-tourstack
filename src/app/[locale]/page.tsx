import { Archivo_Black, Geist, Geist_Mono } from "next/font/google";
import { setRequestLocale } from "next-intl/server";
import TourstackLanding from "@/components/landing/TourstackLanding";
import "./tourstack-landing.css";

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist",
	weight: ["400", "500", "600", "700"],
	display: "swap",
});

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	weight: ["500", "600"],
	display: "swap",
});

const archivoBlack = Archivo_Black({
	subsets: ["latin"],
	variable: "--font-display",
	weight: "400",
	display: "swap",
});

export default async function LandingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<TourstackLanding
			fontClass={`${geist.variable} ${geistMono.variable} ${archivoBlack.variable}`}
		/>
	);
}
