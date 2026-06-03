"use client";

import { useTranslations } from "next-intl";
import TourGuide from "@/components/TourGuide";
import { Link, usePathname } from "@/i18n/routing";

export default function AdminSideNav() {
	const pathname = usePathname();
	const t = useTranslations("AdminSideNav");

	interface NavItem {
		key: string;
		label: string;
		icon: string;
		href: string;
		tourAttr?: string;
	}

	const navItems: NavItem[] = [
		{
			key: "overview",
			label: t("overview"),
			icon: "dashboard",
			href: "/admin",
			tourAttr: "admin-nav-overview",
		},
		{
			key: "artists",
			label: t("artists"),
			icon: "album",
			href: "/admin/artists",
			tourAttr: "admin-nav-artists",
		},
		{
			key: "tours",
			label: t("tours"),
			icon: "confirmation_number",
			href: "/admin/tours",
			tourAttr: "admin-nav-tours",
		},
		{
			key: "eoi",
			label: t("eoi"),
			icon: "send",
			href: "/admin/eoi",
			tourAttr: "admin-nav-eoi",
		},
		{
			key: "directory",
			label: t("directory"),
			icon: "groups",
			href: "/admin/directory",
			tourAttr: "admin-nav-directory",
		},
		{
			key: "reports",
			label: t("reports"),
			icon: "bar_chart",
			href: "/admin/reports",
			tourAttr: "admin-nav-reports",
		},
		{
			key: "settings",
			label: t("settings"),
			icon: "settings",
			href: "/admin/settings",
			tourAttr: "admin-nav-settings",
		},
	];

	const activeItem =
		navItems.find((item) => {
			if (item.href === "/admin") return pathname === "/admin";
			return pathname.startsWith(item.href);
		})?.key || "overview";

	return (
		<aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
			<nav className="flex-1 space-y-1 mt-2">
				{navItems.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						data-tour={item.tourAttr}
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

			<div className="px-4 mt-auto space-y-2">
				<Link
					href="/admin/tours/create"
					data-tour="admin-nav-cta"
					className="block w-full py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
				>
					<span className="material-symbols-outlined text-sm">add</span>
					{t("newTour")}
				</Link>
				<TourGuide tourId="admin" />
			</div>
		</aside>
	);
}
