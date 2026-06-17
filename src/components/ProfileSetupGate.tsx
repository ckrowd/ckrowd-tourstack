"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getTourstackProfile } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

function isProfileComplete(data: unknown): boolean {
	if (!data || typeof data !== "object") return false;
	const d = data as Record<string, unknown>;
	// Only check the core fields that are guaranteed to be set once the user
	// has gone through the profile setup form at least once. Additional fields
	// (logo, banking, etc.) are still required by the form itself but should
	// not cause repeated dashboard redirects for returning users.
	const coreFields = [
		"company_name", "company_type",
		"contact_person", "contact_email", "phone",
		"country", "city",
	];
	return coreFields.every((k) => !!d[k]);
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
