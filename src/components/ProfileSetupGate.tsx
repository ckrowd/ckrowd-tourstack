"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getTourstackProfile } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

function isProfileComplete(data: unknown): boolean {
	if (!data || typeof data !== "object") return false;
	const d = data as Record<string, unknown>;
	return !!(d.company_name && d.contact_person && d.phone && d.country && d.city);
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
