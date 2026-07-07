"use client";

import { Link, usePathname } from "@/i18n/routing";
import type { NavItem } from "@/components/SideNavClient";

interface Props {
	navItems: NavItem[];
	reviewQueueLabel: string;
}

export default function FinancingAdminSideNavClient({
	navItems,
	reviewQueueLabel,
}: Props) {
	const pathname = usePathname();

	const activeItem =
		navItems.find((item) => {
			if (item.href === "/financing-admin") return pathname === item.href;
			return pathname.startsWith(item.href);
		})?.key ?? "overview";

	return (
		<aside className="hidden lg:flex flex-col gap-2 py-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto w-64 border-r border-outline-variant/20 bg-surface-container-low shrink-0">
			<nav className="flex-1 space-y-1 mt-2">
				{navItems.map((item) => (
					<Link
						key={item.key}
						href={item.href}
						aria-current={activeItem === item.key ? "page" : undefined}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl mx-2 transition-all duration-200 font-(family-name:--font-manrope) font-semibold text-sm ${
							activeItem === item.key
								? "bg-primary/10 text-primary"
								: "text-on-surface-variant hover:bg-surface-container-high/50 hover:translate-x-1"
						}`}
					>
						<span className="material-symbols-outlined">{item.icon}</span>
						<span>{item.label}</span>
					</Link>
				))}
			</nav>

			<div className="px-4 mt-auto">
				<Link
					href="/financing-admin/applications"
					className="block w-full py-4 bg-primary text-on-primary rounded-xl font-(family-name:--font-manrope) font-semibold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 text-center flex items-center justify-center gap-2"
				>
					<span className="material-symbols-outlined text-sm">rate_review</span>
					{reviewQueueLabel}
				</Link>
			</div>
		</aside>
	);
}
