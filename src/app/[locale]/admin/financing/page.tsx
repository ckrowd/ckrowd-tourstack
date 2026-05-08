import { redirect } from "next/navigation";

export default async function AdminFinancingPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	redirect(`/${locale}/financing-admin`);
}
