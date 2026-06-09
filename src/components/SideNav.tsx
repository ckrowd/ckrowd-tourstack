"use client";

import { useTranslations } from "next-intl";
import TourGuide from "@/components/TourGuide";
import { Link, usePathname } from "@/i18n/routing";

export default function SideNav() {
	const t = useTranslations("SideNav");
	const pathname = usePathname();

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
			label: t("dashboard"),
			icon: "dashboard",
			href: "/dashboard",
			tourAttr: "nav-dashboard",
		},
		{
			key: "tours",
			label: t("tours"),
			icon: "confirmation_number",
			href: "/tours",
			tourAttr: "nav-tours",
		},
		{
			key: "onboarding",
			label: t("onboarding"),
			icon: "how_to_reg",
			href: "/onboarding",
			tourAttr: "nav-onboarding",
		},
		{
			key: "stakeholders",
			label: t("stakeholders"),
			icon: "groups",
			href: "/stakeholders",
			tourAttr: "nav-stakeholders",
		},
		{
			key: "discovery",
			label: t("discovery"),
			icon: "explore",
			href: "/discovery",
			tourAttr: "nav-discovery",
		},
		{
			key: "financing",
			label: t("financing"),
			icon: "account_balance",
			href: "/financing",
			tourAttr: "nav-financing",
		},
		{
			key: "insurance",
			label: t("insurance"),
			icon: "shield",
			href: "/insurance",
			tourAttr: "nav-insurance",
		},
		{
			key: "artmgmt",
			label: t("artmgmt"),
			icon: "star",
			href: "/artist-management",
		},
		{
			key: "profile",
			label: t("profile"),
			icon: "person",
			href: "/profile",
			tourAttr: "nav-profile",
		},
		{
			key: "settings",
			label: t("settings"),
			icon: "settings",
			href: "/settings",
			tourAttr: "nav-settings",
		},
	];

	const activeItem =
		pathname === "/eoi" || pathname.startsWith("/eoi/")
			? "tours"
			: navItems.find(
					(item) =>
						pathname === item.href || pathname.startsWith(`${item.href}/`),
				)?.key;

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
					href="/eoi"
					data-tour="nav-cta"
					className="block w-full py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 text-center"
				>
					{t("startNewTour")}
				</Link>
				<TourGuide tourId="promoter" />
			</div>
		</aside>
	);
}
