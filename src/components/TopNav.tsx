"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useLogout, useSession } from "@/context/AuthContext";
import { Link, usePathname, useRouter, routing } from "@/i18n/routing";

export default function TopNav() {
	const pathname = usePathname();
	const router = useRouter();
	const locale = useLocale();
	const { data: session } = useSession();
	const logoutMutation = useLogout();
	const [notifOpen, setNotifOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [langOpen, setLangOpen] = useState(false);
	const t = useTranslations("TopNav");
	const tCommon = useTranslations("Common");

	// Since the raw data from JSON might not have all fields (icon, color), I'll map them.
	const staticNotifs = [
		{ id: "n1", icon: "task_alt", color: "text-emerald-500" },
		{ id: "n2", icon: "edit_note", color: "text-[#FF5A30]" },
		{ id: "n3", icon: "send", color: "text-blue-500" },
	];
	const translatedNotifications = (
		t.raw("notificationsList") as {
			title: string;
			body: string;
			time: string;
		}[]
	).map((n, i) => ({
		...n,
		...staticNotifs[i],
		id: staticNotifs[i].id,
	}));

	const SIDEBAR_ROUTES = [
		"/dashboard",
		"/tours",
		"/eoi",
		"/onboarding",
		"/stakeholders",
		"/profile",
		"/settings",
		"/workforce",
		"/crew",
	];
	const activeLink = SIDEBAR_ROUTES.some(
		(r) => pathname === r || pathname.startsWith(`${r}/`),
	)
		? "platform"
		: pathname.startsWith("/discovery")
			? "discovery"
			: pathname.startsWith("/financing")
				? "financing"
				: pathname.startsWith("/insurance")
					? "insurance"
					: null;

	const linkClass = (key: string) =>
		`transition-colors font-(family-name:--font-manrope) font-semibold ${
			activeLink === key
				? "text-[#FF5A30] font-bold border-b-2 border-[#FF5A30] pb-1"
				: "text-slate-500 hover:text-[#FF5A30]"
		}`;

	const userInitial = session?.user?.email
		? session.user.email[0].toUpperCase()
		: "U";

	function handleLogout() {
		logoutMutation.mutate(undefined, { onSettled: () => router.push("/") });
	}

	return (
		<>
			<header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/10 shadow-sm">
				<div className="flex justify-between items-center h-16 px-6 md:px-12 w-full mx-auto">
					<div className="flex items-center gap-8">
						<Link href="/" className="flex items-center gap-2.5">
							<Image
								src="/ckrowd-logo.png"
								alt="Ckrowd logo"
								width={36}
								height={36}
							/>
							<div className="flex flex-col leading-tight">
								<span className="text-lg font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)">
									{tCommon("brandName")}
								</span>
								<span className="text-[10px] font-semibold text-black font-(family-name:--font-manrope)">
									{tCommon("brandBy")}
								</span>
							</div>
						</Link>
						<nav className="hidden md:flex items-center gap-6">
							<Link href="/dashboard" className={linkClass("platform")}>
								{t("dashboard")}
							</Link>
							<Link href="/discovery" className={linkClass("discovery")}>
								{t("discovery")}
							</Link>
							<Link href="/financing" className={linkClass("financing")}>
								{t("financing")}
							</Link>
							<Link href="/insurance" className={linkClass("insurance")}>
								{t("insurance")}
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-4">
						{/* Locale Switcher Dropdown */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setLangOpen((v) => !v)}
								className="flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors uppercase"
								aria-haspopup="listbox"
								aria-expanded={langOpen}
							>
								{locale.toUpperCase()}
								<span className="material-symbols-outlined text-[14px] leading-none">expand_more</span>
							</button>
							{langOpen && (
								<>
									<button
										type="button"
										className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
										onClick={() => setLangOpen(false)}
										aria-label="Close language menu"
									/>
									<div className="absolute right-0 top-9 z-50 w-20 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden" role="listbox">
										{(routing.locales as readonly string[]).map((l) => (
											<button
												key={l}
												type="button"
												role="option"
												aria-selected={locale === l}
												onClick={() => { router.replace(pathname, { locale: l as "en" | "fr" }); setLangOpen(false); }}
												className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold uppercase hover:bg-slate-50 transition-colors ${locale === l ? "text-[#FF5A30]" : "text-slate-600"}`}
											>
												{l.toUpperCase()}
												{locale === l && <span className="material-symbols-outlined text-[12px] leading-none">check</span>}
											</button>
										))}
									</div>
								</>
							)}
						</div>

						{/* Notifications — authenticated users only */}
						{session?.user && (
							<div className="relative">
								<button
									type="button"
									aria-label={t("openNotifications")}
									aria-expanded={notifOpen}
									onClick={() => setNotifOpen((v) => !v)}
									className="p-2 hover:bg-slate-50/50 rounded-lg transition-all active:scale-95 relative"
								>
									<span className="material-symbols-outlined text-[#494455]">
										notifications
									</span>
									<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A30] rounded-full" />
								</button>
							</div>
						)}

						{/* Avatar / dropdown */}
						{session?.user ? (
							<div className="relative ml-2">
								<button
									type="button"
									aria-label={t("openProfileMenu")}
									aria-expanded={profileOpen}
									onClick={() => setProfileOpen((v) => !v)}
									className="h-8 w-8 rounded-full bg-[#FF5A30] flex items-center justify-center text-white text-xs font-bold select-none hover:opacity-90 transition-opacity active:scale-95"
								>
									{userInitial}
								</button>

								{profileOpen && (
									<>
										<button
											type="button"
											aria-label={t("closeProfileMenu")}
											className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
											onClick={() => setProfileOpen(false)}
										/>
										<div className="absolute right-0 top-10 z-50 w-44 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
											<Link
												href="/profile"
												onClick={() => setProfileOpen(false)}
												className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors font-(family-name:--font-manrope)"
											>
												<span className="material-symbols-outlined text-base text-[#494455]">
													person
												</span>
												{tCommon("profile")}
											</Link>
											<Link
												href="/settings"
												onClick={() => setProfileOpen(false)}
												className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors font-(family-name:--font-manrope)"
											>
												<span className="material-symbols-outlined text-base text-[#494455]">
													settings
												</span>
												{tCommon("settings")}
											</Link>
											<button
												type="button"
												onClick={() => {
													setProfileOpen(false);
													handleLogout();
												}}
												className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors font-(family-name:--font-manrope)"
											>
												<span className="material-symbols-outlined text-base text-[#494455]">
													logout
												</span>
												{tCommon("signOut")}
											</button>
										</div>
									</>
								)}
							</div>
						) : (
							<Link
								href="/login"
								className="ml-2 px-4 py-2 bg-[#FF5A30] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
							>
								{tCommon("signIn")}
							</Link>
						)}
					</div>
				</div>
			</header>

			{/* Notifications slide-in panel */}
			{notifOpen && (
				<>
					{/* Backdrop */}
					<button
						type="button"
						aria-label={t("closeNotifications")}
						className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
						onClick={() => setNotifOpen(false)}
					/>
					{/* Panel */}
					<div
						className="fixed top-16 right-4 md:right-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
						role="dialog"
						aria-label={t("notifications")}
					>
						<div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
							<h3 className="font-(family-name:--font-manrope) font-bold text-sm text-slate-900">
								{t("notifications")}
							</h3>
							<button
								type="button"
								onClick={() => setNotifOpen(false)}
								className="text-slate-400 hover:text-slate-600 transition-colors"
								aria-label={t("closeNotifications")}
							>
								<span className="material-symbols-outlined text-sm">close</span>
							</button>
						</div>
						<ul className="divide-y divide-slate-50">
							{translatedNotifications.map((n) => (
								<li
									key={n.id}
									className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
								>
									<span
										className={`material-symbols-outlined text-lg mt-0.5 shrink-0 ${n.color}`}
									>
										{n.icon}
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-slate-900">
											{n.title}
										</p>
										<p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
									</div>
									<span className="text-[10px] text-slate-400 font-medium shrink-0 mt-0.5">
										{n.time}
									</span>
								</li>
							))}
						</ul>
						<div className="px-5 py-3 border-t border-slate-100">
							<button
								type="button"
								className="text-xs font-semibold text-[#FF5A30] hover:underline"
								onClick={() => setNotifOpen(false)}
							>
								{t("markAllAsRead")}
							</button>
						</div>
					</div>
				</>
			)}
		</>
	);
}
