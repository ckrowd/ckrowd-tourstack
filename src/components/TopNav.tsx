"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { getEOIs } from "@/app/actions";
import { useLogout, useSession } from "@/context/AuthContext";
import { Link, routing, usePathname, useRouter } from "@/i18n/routing";

export default function TopNav() {
	const pathname = usePathname();
	const router = useRouter();
	const locale = useLocale();
	const {
		data: session,
		isError: sessionIsError,
		isFetching: sessionIsFetching,
		isLoading: sessionIsLoading,
	} = useSession();
	const logoutMutation = useLogout();
	const [notifOpen, setNotifOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [langOpen, setLangOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const t = useTranslations("TopNav");
	const tCommon = useTranslations("Common");
	const tSideNav = useTranslations("SideNav");
	const tAdminSideNav = useTranslations("AdminSideNav");
	const tFinancingAdminSideNav = useTranslations("FinancingAdminSideNav");
	const tInsuranceAdminSideNav = useTranslations("InsuranceAdminSideNav");
	const format = useFormatter();

	// Notifications are derived from the signed-in promoter's real EOIs.
	const eoisQuery = useQuery({
		queryKey: ["eois"],
		queryFn: () => getEOIs(),
		enabled: Boolean(session?.user),
	});

	const statusMeta: Record<
		string,
		{ icon: string; color: string; label: string }
	> = {
		approved: {
			icon: "task_alt",
			color: "text-emerald-500",
			label: t("notif.statusApproved"),
		},
		rejected: {
			icon: "cancel",
			color: "text-red-500",
			label: t("notif.statusRejected"),
		},
		needs_revision: {
			icon: "edit_note",
			color: "text-[#FF5A30]",
			label: t("notif.statusNeedsRevision"),
		},
		pending_review: {
			icon: "schedule",
			color: "text-blue-500",
			label: t("notif.statusPendingReview"),
		},
	};

	const notifications = (eoisQuery.data?.data ?? []).slice(0, 6).map((eoi) => {
		const status = String(eoi.status ?? "pending_review");
		const meta = statusMeta[status] ?? {
			icon: "notifications",
			color: "text-slate-400",
			label: status.replace(/_/g, " "),
		};
		return {
			id: String(eoi.id),
			icon: meta.icon,
			color: meta.color,
			title: String(eoi.artist?.name ?? t("notif.eoiFallback")),
			body: meta.label,
			date: eoi.created_at ? new Date(String(eoi.created_at)) : null,
		};
	});

	const userInitial = session?.user?.email
		? session.user.email[0].toUpperCase()
		: "U";
	const sessionPending =
		!session?.user && (sessionIsLoading || sessionIsFetching || sessionIsError);

	function handleLogout() {
		logoutMutation.mutate(undefined, { onSettled: () => router.push("/") });
	}

	// ── Portal detection for mobile nav drawer ────────────────────────────────
	const isAdminPortal =
		pathname.startsWith("/admin") && !pathname.includes("/admin/login");
	const isFinancingAdminPortal =
		pathname.startsWith("/financing-admin") &&
		!pathname.includes("/financing-admin/login");
	const isInsuranceAdminPortal =
		pathname.startsWith("/insurance-admin") &&
		!pathname.includes("/insurance-admin/login");

	const dashboardNavItems = [
		{ label: tSideNav("dashboard"), icon: "dashboard", href: "/dashboard" },
		{
			label: tSideNav("tours"),
			icon: "confirmation_number",
			href: "/tours",
		},
		{
			label: tSideNav("onboarding"),
			icon: "how_to_reg",
			href: "/onboarding",
		},
		{
			label: tSideNav("stakeholders"),
			icon: "groups",
			href: "/stakeholders",
		},
		{ label: tSideNav("discovery"), icon: "explore", href: "/discovery" },
		{
			label: tSideNav("financing"),
			icon: "account_balance",
			href: "/financing",
		},
		{ label: tSideNav("insurance"), icon: "shield", href: "/insurance" },
	];

	const adminNavItems = [
		{ label: tAdminSideNav("overview"), icon: "dashboard", href: "/admin" },
		{
			label: tAdminSideNav("tours"),
			icon: "confirmation_number",
			href: "/admin/tours",
		},
		{ label: tAdminSideNav("eoi"), icon: "send", href: "/admin/eoi" },
		{
			label: tAdminSideNav("directory"),
			icon: "groups",
			href: "/admin/directory",
		},
		{
			label: tAdminSideNav("reports"),
			icon: "bar_chart",
			href: "/admin/reports",
		},
		{
			label: tAdminSideNav("settings"),
			icon: "settings",
			href: "/admin/settings",
		},
	];

	const financingAdminNavItems = [
		{
			label: tFinancingAdminSideNav("overview"),
			icon: "dashboard",
			href: "/financing-admin",
		},
		{
			label: tFinancingAdminSideNav("applications"),
			icon: "request_quote",
			href: "/financing-admin/applications",
		},
		{
			label: tFinancingAdminSideNav("partners"),
			icon: "account_balance",
			href: "/financing-admin/partners",
		},
		{
			label: tFinancingAdminSideNav("settings"),
			icon: "tune",
			href: "/financing-admin/settings",
		},
	];

	const insuranceAdminNavItems = [
		{
			label: tInsuranceAdminSideNav("overview"),
			icon: "shield",
			href: "/insurance-admin",
		},
		{
			label: tInsuranceAdminSideNav("applications"),
			icon: "description",
			href: "/insurance-admin/applications",
		},
		{
			label: tInsuranceAdminSideNav("claims"),
			icon: "assignment_late",
			href: "/insurance-admin/claims",
		},
		{
			label: tInsuranceAdminSideNav("partners"),
			icon: "handshake",
			href: "/insurance-admin/partners",
		},
	];

	const mobileNavItems = isAdminPortal
		? adminNavItems
		: isFinancingAdminPortal
			? financingAdminNavItems
			: isInsuranceAdminPortal
				? insuranceAdminNavItems
				: session?.user
					? dashboardNavItems
					: [];

	function isNavActive(href: string) {
		if (href === "/admin" || href === "/financing-admin" || href === "/insurance-admin" || href === "/dashboard") {
			return pathname === href;
		}
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	return (
		<>
			<header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/10 shadow-sm">
				<div className="flex justify-between items-center h-16 px-4 md:px-6 lg:px-12 w-full mx-auto">
					{/* Brand — full lockup on desktop, logo only on mobile */}
					<div className="flex items-center gap-8">
						<Link href="/" className="flex items-center gap-2.5">
							<Image
								src="/ckrowd-logo.png"
								alt="Ckrowd logo"
								width={36}
								height={36}
							/>
							<div className="hidden lg:flex flex-col leading-tight">
								<span className="text-lg font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)">
									{tCommon("brandName")}
								</span>
								<span className="text-[10px] font-semibold text-black font-(family-name:--font-manrope)">
									{tCommon("brandBy")}
								</span>
							</div>
						</Link>
					</div>

					<div className="flex items-center gap-3">
						{/* Locale Switcher — desktop only (accessible via drawer on mobile) */}
						<div className="relative hidden lg:block">
							<button
								type="button"
								onClick={() => setLangOpen((v) => !v)}
								className="flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors uppercase"
								aria-haspopup="listbox"
								aria-expanded={langOpen}
							>
								{locale.toUpperCase()}
								<span className="material-symbols-outlined text-[14px] leading-none">
									expand_more
								</span>
							</button>
							{langOpen && (
								<>
									<button
										type="button"
										className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
										onClick={() => setLangOpen(false)}
										aria-label="Close language menu"
									/>
									<div
										className="absolute right-0 top-9 z-50 w-20 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden"
										role="listbox"
									>
										{(routing.locales as readonly string[]).map((l) => (
											<button
												key={l}
												type="button"
												role="option"
												aria-selected={locale === l}
												onClick={() => {
													router.replace(pathname, {
														locale: l as "en" | "fr",
													});
													setLangOpen(false);
												}}
												className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold uppercase hover:bg-slate-50 transition-colors ${locale === l ? "text-[#FF5A30]" : "text-slate-600"}`}
											>
												{l.toUpperCase()}
												{locale === l && (
													<span className="material-symbols-outlined text-[12px] leading-none">
														check
													</span>
												)}
											</button>
										))}
									</div>
								</>
							)}
						</div>

						{/* Notifications — desktop only */}
						{session?.user && (
							<div className="relative hidden lg:block">
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
									{notifications.length > 0 && (
										<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A30] rounded-full" />
									)}
								</button>
							</div>
						)}

						{/* Avatar / session — visible on all sizes */}
						{session?.user ? (
							<div className="relative hidden lg:block">
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
						) : sessionPending ? (
							<div
								className="hidden lg:block h-9 w-9 rounded-full bg-slate-100 animate-pulse"
								aria-label={t("checkingSession")}
								role="status"
							/>
						) : (
							<Link
								href="/login"
								className="hidden lg:inline-flex px-4 py-2 bg-[#FF5A30] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
							>
								{tCommon("signIn")}
							</Link>
						)}

						{/* Hamburger — mobile only */}
						<button
							type="button"
							className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
							onClick={() => setMobileMenuOpen(true)}
							aria-label="Open navigation menu"
							aria-expanded={mobileMenuOpen}
						>
							<span className="material-symbols-outlined">menu</span>
						</button>
					</div>
				</div>
			</header>

			{/* ── Mobile nav drawer ───────────────────────────────────────────── */}
			{mobileMenuOpen && (
				<>
					{/* Backdrop */}
					<button
						type="button"
						className="fixed inset-0 z-50 bg-black/40 lg:hidden cursor-default border-none"
						onClick={() => setMobileMenuOpen(false)}
						aria-label="Close navigation menu"
					/>

					{/* Drawer */}
					<div
						className="fixed left-0 top-0 h-full w-72 z-50 bg-white flex flex-col shadow-2xl lg:hidden"
						role="dialog"
						aria-modal="true"
						aria-label="Navigation menu"
					>
						{/* Drawer header */}
						<div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 shrink-0">
							<Link
								href="/"
								className="flex items-center gap-2.5"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Image
									src="/ckrowd-logo.png"
									alt="Ckrowd logo"
									width={32}
									height={32}
								/>
								<div className="flex flex-col leading-tight">
									<span className="text-base font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)">
										{tCommon("brandName")}
									</span>
									<span className="text-[10px] font-semibold text-black/50 font-(family-name:--font-manrope)">
										{tCommon("brandBy")}
									</span>
								</div>
							</Link>
							<button
								type="button"
								onClick={() => setMobileMenuOpen(false)}
								className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
								aria-label="Close navigation menu"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						{/* Language switcher */}
						<div className="px-5 py-3 border-b border-slate-100 shrink-0">
							<div className="flex gap-2">
								{(routing.locales as readonly string[]).map((l) => (
									<button
										key={l}
										type="button"
										onClick={() => {
											router.replace(pathname, { locale: l as "en" | "fr" });
											setMobileMenuOpen(false);
										}}
										className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
											locale === l
												? "bg-[#FF5A30] text-white"
												: "bg-slate-100 text-slate-600 hover:bg-slate-200"
										}`}
									>
										{l.toUpperCase()}
									</button>
								))}
							</div>
						</div>

						{/* Nav items */}
						<nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
							{mobileNavItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setMobileMenuOpen(false)}
									className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm transition-all ${
										isNavActive(item.href)
											? "bg-orange-50 text-[#FF5A30]"
											: "text-slate-600 hover:bg-slate-50"
									}`}
								>
									<span
										className="material-symbols-outlined"
										style={{
											fontVariationSettings: isNavActive(item.href)
												? "'FILL' 1"
												: "'FILL' 0",
										}}
									>
										{item.icon}
									</span>
									<span>{item.label}</span>
								</Link>
							))}

							{/* Public-page nav for unauthenticated users */}
							{!session?.user &&
								!isAdminPortal &&
								!isFinancingAdminPortal &&
								!isInsuranceAdminPortal && (
									<>
										<Link
											href="/"
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm transition-all ${pathname === "/" ? "bg-orange-50 text-[#FF5A30]" : "text-slate-600 hover:bg-slate-50"}`}
										>
											<span className="material-symbols-outlined">home</span>
											<span>Home</span>
										</Link>
										<Link
											href="/join"
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm transition-all ${pathname === "/join" ? "bg-orange-50 text-[#FF5A30]" : "text-slate-600 hover:bg-slate-50"}`}
										>
											<span className="material-symbols-outlined">group_add</span>
											<span>Join</span>
										</Link>
									</>
								)}
						</nav>

						{/* Account section */}
						<div className="border-t border-slate-100 px-3 py-3 space-y-0.5 shrink-0">
							{session?.user ? (
								<>
									{/* Notifications */}
									<button
										type="button"
										onClick={() => {
											setMobileMenuOpen(false);
											setNotifOpen(true);
										}}
										className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
									>
										<span className="material-symbols-outlined text-[#494455]">
											notifications
										</span>
										<span>{t("notifications")}</span>
										{notifications.length > 0 && (
											<span className="ml-auto w-5 h-5 rounded-full bg-[#FF5A30] text-white text-[10px] flex items-center justify-center font-bold">
												{notifications.length}
											</span>
										)}
									</button>

									{/* Profile */}
									<Link
										href="/profile"
										onClick={() => setMobileMenuOpen(false)}
										className="flex items-center gap-3 px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
									>
										<span className="material-symbols-outlined text-[#494455]">
											person
										</span>
										<span>{tCommon("profile")}</span>
										<span className="ml-auto h-7 w-7 rounded-full bg-[#FF5A30] flex items-center justify-center text-white text-xs font-bold">
											{userInitial}
										</span>
									</Link>

									{/* Settings */}
									<Link
										href="/settings"
										onClick={() => setMobileMenuOpen(false)}
										className="flex items-center gap-3 px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
									>
										<span className="material-symbols-outlined text-[#494455]">
											settings
										</span>
										<span>{tCommon("settings")}</span>
									</Link>

									{/* Sign out */}
									<button
										type="button"
										onClick={() => {
											setMobileMenuOpen(false);
											handleLogout();
										}}
										className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors"
									>
										<span className="material-symbols-outlined">logout</span>
										<span>{tCommon("signOut")}</span>
									</button>
								</>
							) : (
								<Link
									href="/login"
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm font-(family-name:--font-manrope) hover:opacity-90 transition-opacity"
								>
									<span className="material-symbols-outlined text-sm">
										login
									</span>
									{tCommon("signIn")}
								</Link>
							)}
						</div>
					</div>
				</>
			)}

			{/* ── Notifications slide-in panel ───────────────────────────────── */}
			{notifOpen && (
				<>
					<button
						type="button"
						aria-label={t("closeNotifications")}
						className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
						onClick={() => setNotifOpen(false)}
					/>
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
						{notifications.length === 0 ? (
							<p className="px-5 py-10 text-center text-sm text-slate-400">
								{t("notif.empty")}
							</p>
						) : (
							<>
								<ul className="divide-y divide-slate-50">
									{notifications.map((n) => (
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
												<p className="text-sm font-semibold text-slate-900 truncate">
													{n.title}
												</p>
												<p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
											</div>
											{n.date && (
												<span className="text-[10px] text-slate-400 font-medium shrink-0 mt-0.5">
													{format.relativeTime(n.date)}
												</span>
											)}
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
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}
