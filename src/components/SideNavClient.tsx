"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import TourGuide from "@/components/TourGuide";
import { getTourstackProfile } from "@/app/actions";
import { isProfileComplete } from "@/components/ProfileSetupGate";

export interface NavItem {
	key: string;
	label: string;
	icon: string;
	href: string;
	tourAttr?: string;
}

interface Props {
	navItems: NavItem[];
	startNewTourLabel: string;
}

export default function SideNavClient({ navItems, startNewTourLabel }: Props) {
	const pathname = usePathname();
	const t = useTranslations("SideNav");

	const { data: profileResult } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
		staleTime: 60_000,
	});

	const profileComplete = isProfileComplete(profileResult?.data);

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
				{navItems.map((item) => {
					const isProfileItem = item.key === "profile";
					const locked = !profileComplete && !isProfileItem;
					const isActive = activeItem === item.key;

					if (locked) {
						return (
							<div
								key={item.key}
								title={t("profileRequired")}
								className="flex items-center gap-3 px-4 py-3 rounded-xl mx-2 font-(family-name:--font-manrope) font-semibold text-sm text-slate-300 cursor-not-allowed select-none"
							>
								<span className="material-symbols-outlined text-slate-300">{item.icon}</span>
								<span className="flex-1">{item.label}</span>
								<span className="material-symbols-outlined text-xs text-slate-300">lock</span>
							</div>
						);
					}

					return (
						<Link
							key={item.key}
							href={item.href}
							data-tour={item.tourAttr}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-(family-name:--font-manrope) font-semibold text-sm ${
								isActive
									? "bg-orange-50 text-[#FF5A30]"
									: "text-slate-600 hover:bg-slate-200/50 hover:translate-x-1"
							}`}
						>
							<span className="material-symbols-outlined">{item.icon}</span>
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>

			<div className="px-4 mt-auto space-y-2">
				{profileComplete ? (
					<Link
						href="/eoi"
						data-tour="nav-cta"
						className="block w-full py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 text-center"
					>
						{startNewTourLabel}
					</Link>
				) : (
					<div
						title={t("profileRequired")}
						className="block w-full py-4 bg-slate-200 text-slate-400 rounded-xl font-(family-name:--font-manrope) font-bold text-sm text-center cursor-not-allowed select-none"
					>
						{startNewTourLabel}
					</div>
				)}
				<TourGuide tourId="promoter" />
			</div>
		</aside>
	);
}
