import { setRequestLocale } from "next-intl/server";
import AdminArtistsClient from "@/components/AdminArtistsClient";

export default async function AdminArtistsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return <AdminArtistsClient />;
}
