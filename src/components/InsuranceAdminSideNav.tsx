"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export default function InsuranceAdminSideNav() {
	const pathname = usePathname();
	const t = useTranslations("InsuranceAdminSideNav");

	const navItems = [
		{
			key: "overview",
			label: t("overview"),
			icon: "shield",
			href: "/insurance-admin",
		},
		{
			key: "applications",
			label: t("applications"),
			icon: "description",
			href: "/insurance-admin/applications",
		},
		{
			key: "claims",
			label: t("claims"),
			icon: "assignment_late",
			href: "/insurance-admin/claims",
		},
		{
			key: "partners",
			label: t("partners"),
			icon: "handshake",
			href: "/insurance-admin/partners",
		},
	];

	const activeItem =
		navItems.find((item) => {
			if (item.href === "/insurance-admin") return pathname === "/insurance-admin";
			return pathname.startsWith(item.href);
		})?.key ?? "overview";

	return (
		<aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
			<div className="px-4 mb-4">
				<span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30]">
					Insurance Admin
				</span>
			</div>
			<nav className="flex-1 space-y-1 mt-2">
				{navItems.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-(family-name:--font-manrope) font-semibold text-sm ${
							activeItem === item.key
								? "bg-orange-50 text-[#FF5A30]"
								: "text-slate-600 hover:bg-slate-200/50 hover:translate-x-1"
						}`}
					>
						<span className="material-symbols-outlined">{item.icon}</span>
						<span>{item.label}</span>
					</Link>
				))}
			</nav>
		</aside>
	);
}
