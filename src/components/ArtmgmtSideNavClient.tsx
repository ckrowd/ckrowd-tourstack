"use client";

import { Link, usePathname } from "@/i18n/routing";

interface NavItem {
	key: string;
	label: string;
	icon: string;
	href: string;
}

interface Props {
	navItems: NavItem[];
	portalLabel: string;
}

export default function ArtmgmtSideNavClient({ navItems, portalLabel }: Props) {
	const pathname = usePathname();

	const activeItem =
		navItems.find((item) => {
			if (item.href === "/artmgmt") return pathname === item.href;
			return pathname.startsWith(item.href);
		})?.key ?? "artists";

	return (
		<aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
			<div className="px-4 mb-4">
				<p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
					{portalLabel}
				</p>
			</div>
			<nav className="flex-1 space-y-1 mt-2">
				{navItems.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						aria-current={activeItem === item.key ? "page" : undefined}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-(family-name:--font-manrope) font-semibold text-sm ${
							activeItem === item.key
								? "bg-orange-50 text-[#FF5A2E]"
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
