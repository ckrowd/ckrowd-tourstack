"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getTourstackProfile } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

function isProfileComplete(data: unknown): boolean {
	if (!data || typeof data !== "object") return false;
	const d = data as Record<string, unknown>;
	const requiredStrings = [
		"company_name", "company_type", "registration_number", "tax_id",
		"incorporation_date", "incorporation_country",
		"primary_address", "country", "city", "phone", "bio",
		"contact_person", "job_title", "contact_email",
		"company_size", "markets_regions", "genres_specialties",
		"bank_name", "bank_account_holder", "currency_preference",
		"logo_url",
	];
	if (requiredStrings.some((k) => !d[k])) return false;
	if (d.years_in_business == null) return false;
	if (d.average_events_year == null) return false;
	return true;
}

export { isProfileComplete };

export default function ProfileSetupGate() {
	const { data: result, isLoading } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
		staleTime: 60_000,
	});
	const pathname = usePathname();
	const router = useRouter();

	const complete = isProfileComplete(result?.data);
	const onProfilePage = pathname.endsWith("/profile") || pathname.includes("/profile?");

	useEffect(() => {
		if (isLoading) return;
		if (complete) return;
		if (onProfilePage) return;
		router.replace("/profile?setup=1");
	}, [complete, onProfilePage, isLoading, router]);

	return null;
}
