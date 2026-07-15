"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import TourGuide from "@/components/TourGuide";
import Icon from "@/components/icons";
import { getTourstackProfile } from "@/app/actions";
import { isProfileComplete } from "@/components/ProfileSetupGate";

export interface NavItem {
	key: string;
	label: string;
	icon: string;
	href: string;
	tourAttr?: string;
	group?: string;
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

	// Preserve nav order while clustering consecutive items under their group
	// label. Ungrouped items (overview) render before the first section.
	const sections: { group?: string; items: NavItem[] }[] = [];
	for (const item of navItems) {
		const last = sections[sections.length - 1];
		if (last && last.group === item.group) {
			last.items.push(item);
		} else {
			sections.push({ group: item.group, items: [item] });
		}
	}

	function renderItem(item: NavItem) {
		const isProfileItem = item.key === "profile";
		const locked = !profileComplete && !isProfileItem;
		const isActive = activeItem === item.key;

		if (locked) {
			return (
				<div
					key={item.key}
					title={t("profileRequired")}
					className="relative flex items-center gap-3 px-3 py-2 rounded-lg mx-3 text-sm font-medium text-on-surface-variant/40 cursor-not-allowed select-none"
				>
					<Icon name={item.icon} size={18} className="shrink-0" />
					<span className="flex-1 truncate">{item.label}</span>
					<Icon name="lock" size={13} className="shrink-0" />
				</div>
			);
		}

		return (
			<Link
				key={item.key}
				href={item.href}
				data-tour={item.tourAttr}
				className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg mx-3 text-sm transition-colors duration-200 ${
					isActive
						? "bg-primary/10 text-primary font-semibold"
						: "font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
				}`}
			>
				{isActive && (
					<span className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-full bg-primary" />
				)}
				<Icon
					name={item.icon}
					size={18}
					strokeWidth={isActive ? 2 : 1.75}
					className="shrink-0 transition-transform duration-200 group-hover:scale-105"
				/>
				<span className="truncate">{item.label}</span>
			</Link>
		);
	}

	return (
		<aside className="hidden lg:flex flex-col fixed top-16 left-0 bottom-0 w-64 border-r border-outline-variant bg-surface z-40 overflow-y-auto no-scrollbar">
			<nav className="flex-1 py-5 space-y-1">
				{sections.map((section, i) => (
					<div key={section.group ?? `ungrouped-${i}`}>
						{section.group ? (
							<p className="px-6 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60 select-none">
								{section.group}
							</p>
						) : null}
						<div className="space-y-0.5">{section.items.map(renderItem)}</div>
					</div>
				))}
			</nav>

			<div className="px-4 pb-5 pt-3 mt-auto space-y-2 border-t border-outline-variant">
				{profileComplete ? (
					<Link
						href="/eoi"
						data-tour="nav-cta"
						className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm transition-[transform,box-shadow] duration-200 [transition-timing-function:var(--ease-out)] hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-95"
					>
						{startNewTourLabel}
						<Icon name="arrow-right" size={15} strokeWidth={2.25} />
					</Link>
				) : (
					<div
						title={t("profileRequired")}
						className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container text-on-surface-variant/50 rounded-xl font-semibold text-sm cursor-not-allowed select-none"
					>
						{startNewTourLabel}
						<Icon name="lock" size={13} />
					</div>
				)}
				<TourGuide tourId="promoter" />
			</div>
		</aside>
	);
}
