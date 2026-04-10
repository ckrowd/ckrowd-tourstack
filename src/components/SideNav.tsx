"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
	{ key: "overview", label: "Overview", icon: "dashboard", href: "/dashboard" },
	{ key: "tours", label: "Tours", icon: "confirmation_number", href: "/tours" },
	{ key: "requests", label: "Requests", icon: "send", href: "/eoi" },
	{
		key: "onboarding",
		label: "Onboarding",
		icon: "how_to_reg",
		href: "/onboarding",
	},
	{
		key: "workforce",
		label: "Workforce",
		icon: "engineering",
		href: "/workforce",
	},
	{ key: "settings", label: "Settings", icon: "settings", href: "/settings" },
];

export default function SideNav() {
	const pathname = usePathname();
	const router = useRouter();
	const { logout } = useAuth();

	const activeItem = navItems.find(
		(item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
	)?.key;

	async function handleLogout() {
		await logout();
		router.push("/");
	}

	return (
		<aside className="hidden lg:flex flex-col gap-2 py-6 h-full w-64 border-r border-slate-200 bg-slate-50 shrink-0">
			<div className="px-6 mb-8 flex items-center gap-3">
				<div className="h-10 w-10 bg-[#FF5A30] rounded-xl flex items-center justify-center text-white">
					<span className="material-symbols-outlined">confirmation_number</span>
				</div>
				<div>
					<h3 className="font-(family-name:--font-manrope) font-bold text-sm text-[#191c1e]">
						Tour Manager
					</h3>
					<p className="text-[10px] uppercase tracking-wider text-[#494455] font-semibold">
						Tour Stack Pro
					</p>
				</div>
			</div>

			<nav className="flex-1 space-y-1">
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

			<div className="px-4 mt-auto space-y-3">
				<Link
					href="/eoi"
					className="block w-full py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 text-center"
				>
					Start New Tour
				</Link>
				<button
					type="button"
					onClick={handleLogout}
					className="block w-full py-3 text-slate-500 hover:text-[#FF5A30] font-(family-name:--font-manrope) font-semibold text-sm transition-colors text-center"
				>
					Sign out
				</button>
			</div>
		</aside>
	);
}
