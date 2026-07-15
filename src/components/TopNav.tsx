"use client";

import { useQuery } from "@tanstack/react-query";
import Icon from "@/components/icons";
import Image from "next/image";
import { useFormatter, useLocale, useNow, useTranslations } from "next-intl";
import { useCallback, useSyncExternalStore, useState } from "react";
import { getEOIs, getTourstackProfile } from "@/app/actions";
import { useLogout, useSession } from "@/context/AuthContext";
import { Link, routing, usePathname, useRouter } from "@/i18n/routing";
import ArtmgmtSearch from "@/components/ArtmgmtSearch";
import GlobalSearch from "@/components/GlobalSearch";
import ThemeToggle from "@/components/ThemeToggle";

export default function TopNav() {
	const pathname = usePathname();
	const isArtmgmtPortal =
		pathname.startsWith("/artmgmt") && !pathname.includes("/artmgmt/login");
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
	const tArtmgmtSideNav = useTranslations("ArtmgmtSideNav");
	const format = useFormatter();
	const now = useNow();

	// Notifications are derived from the signed-in promoter's real EOIs.
	const eoisQuery = useQuery({
		queryKey: ["eois"],
		queryFn: () => getEOIs(),
		enabled: Boolean(session?.user) && !isArtmgmtPortal,
	});

	const { data: profileResult } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
		staleTime: 60_000,
		enabled: Boolean(session?.user),
	});

	const profileLogoUrl = (() => {
		if (profileResult?.success && profileResult.data) {
			const d = profileResult.data as Record<string, unknown>;
			return typeof d.logo_url === "string" && d.logo_url ? d.logo_url : null;
		}
		return null;
	})();

	// Track which notifications the user has read via a localStorage timestamp.
	// useSyncExternalStore avoids the server/client hydration mismatch that
	// a lazy-initialiser useState would cause (server has no localStorage).
	const STORAGE_KEY = "ckrowd_notif_read_at";
	const readAt = useSyncExternalStore(
		(cb) => {
			window.addEventListener("storage", cb);
			return () => window.removeEventListener("storage", cb);
		},
		() => Number(localStorage.getItem(STORAGE_KEY) ?? 0),
		() => 0,
	);
	const markAllRead = useCallback(() => {
		const now = Date.now();
		localStorage.setItem(STORAGE_KEY, String(now));
		// Dispatch storage event so useSyncExternalStore re-reads in this tab.
		window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
	}, []);

	const statusMeta: Record<
		string,
		{ icon: string; color: string; label: string }
	> = {
		approved: {
			icon: "check-circle",
			color: "text-emerald-500",
			label: t("notif.statusApproved"),
		},
		rejected: {
			icon: "x",
			color: "text-red-500",
			label: t("notif.statusRejected"),
		},
		needs_revision: {
			icon: "edit",
			color: "text-[#FF5A2E]",
			label: t("notif.statusNeedsRevision"),
		},
		pending_review: {
			icon: "clock",
			color: "text-blue-500",
			label: t("notif.statusPendingReview"),
		},
	};

	const allNotifications = (eoisQuery.data?.data ?? []).map((eoi) => {
		const status = String(eoi.status ?? "pending_review");
		const meta = statusMeta[status] ?? {
			icon: "bell",
			color: "text-slate-400",
			label: status.replace(/_/g, " "),
		};
		const date = eoi.created_at ? new Date(String(eoi.created_at)) : null;
		return {
			id: String(eoi.id),
			icon: meta.icon,
			color: meta.color,
			title: String(eoi.artist?.name ?? t("notif.eoiFallback")),
			body: meta.label,
			date,
			unread: date ? date.getTime() > readAt : false,
			href: (status === "needs_revision" ? "/eoi" : "/tours") as "/eoi" | "/tours",
		};
	});

	const notifications = allNotifications.slice(0, 6);
	const hasUnread = allNotifications.some((n) => n.unread);
	const unreadCount = allNotifications.filter((n) => n.unread).length;

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

	// Profile link target depends on the active portal — each portal has its own
	// profile page under its route prefix (admin opened /profile before this).
	const profileHref = isArtmgmtPortal
		? "/artmgmt/profile"
		: isAdminPortal
			? "/admin/profile"
			: isFinancingAdminPortal
				? "/financing-admin/profile"
				: isInsuranceAdminPortal
					? "/insurance-admin/profile"
					: "/profile";

	const dashboardNavItems = [
		{ label: tSideNav("dashboard"), icon: "overview", href: "/dashboard" },
		{
			label: tSideNav("tours"),
			icon: "tours",
			href: "/tours",
		},
		{
			label: tSideNav("onboarding"),
			icon: "onboarding",
			href: "/onboarding",
		},
		{
			label: tSideNav("stakeholders"),
			icon: "stakeholders",
			href: "/stakeholders",
		},
		{ label: tSideNav("discovery"), icon: "discovery", href: "/discovery" },
		{
			label: tSideNav("financing"),
			icon: "financing",
			href: "/financing",
		},
		{ label: tSideNav("insurance"), icon: "insurance", href: "/insurance" },
		{
			label: tSideNav("tickets"),
			icon: "tours",
			href: "/dashboard/tickets",
		},
		{
			label: tSideNav("aiTools"),
			icon: "ai",
			href: "/tour-intelligence",
		},
	];

	const adminNavItems = [
		{ label: tAdminSideNav("overview"), icon: "overview", href: "/admin" },
		{
			label: tAdminSideNav("artists"),
			icon: "music",
			href: "/admin/artists",
		},
		{
			label: tAdminSideNav("tours"),
			icon: "tours",
			href: "/admin/tours",
		},
		{ label: tAdminSideNav("eoi"), icon: "send", href: "/admin/eoi" },
		{
			label: tAdminSideNav("financing"),
			icon: "wallet",
			href: "/admin/financing",
		},
		{
			label: tAdminSideNav("insurance"),
			icon: "insurance",
			href: "/admin/insurance",
		},
		{
			label: tAdminSideNav("claims"),
			icon: "shield-check",
			href: "/admin/claims",
		},
		{
			label: tAdminSideNav("tickets"),
			icon: "tours",
			href: "/admin/tickets",
		},
		{
			label: tAdminSideNav("payments"),
			icon: "wallet",
			href: "/admin/payments",
		},
		{
			label: tAdminSideNav("payouts"),
			icon: "financing",
			href: "/admin/payouts",
		},
		{
			label: tAdminSideNav("directory"),
			icon: "stakeholders",
			href: "/admin/directory",
		},
		{
			label: tAdminSideNav("submissions"),
			icon: "folder",
			href: "/admin/submissions",
		},
		{
			label: tAdminSideNav("reports"),
			icon: "chart",
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
			icon: "overview",
			href: "/financing-admin",
		},
		{
			label: tFinancingAdminSideNav("applications"),
			icon: "file-text",
			href: "/financing-admin/applications",
		},
		{
			label: tFinancingAdminSideNav("partners"),
			icon: "financing",
			href: "/financing-admin/partners",
		},
		{
			label: tFinancingAdminSideNav("settings"),
			icon: "sliders",
			href: "/financing-admin/settings",
		},
	];

	const insuranceAdminNavItems = [
		{
			label: tInsuranceAdminSideNav("overview"),
			icon: "insurance",
			href: "/insurance-admin",
		},
		{
			label: tInsuranceAdminSideNav("applications"),
			icon: "file-text",
			href: "/insurance-admin/applications",
		},
		{
			label: tInsuranceAdminSideNav("claims"),
			icon: "alert-triangle",
			href: "/insurance-admin/claims",
		},
		{
			label: tInsuranceAdminSideNav("partners"),
			icon: "handshake",
			href: "/insurance-admin/partners",
		},
	];

	const artmgmtNavItems = [
		{ label: tArtmgmtSideNav("artists"), icon: "star", href: "/artmgmt" },
		{ label: tArtmgmtSideNav("submissions"), icon: "send", href: "/artmgmt/submissions" },
		{ label: tArtmgmtSideNav("reports"), icon: "chart", href: "/artmgmt/reports" },
	];

	const mobileNavItems = isAdminPortal
		? adminNavItems
		: isFinancingAdminPortal
			? financingAdminNavItems
			: isInsuranceAdminPortal
				? insuranceAdminNavItems
				: isArtmgmtPortal
					? artmgmtNavItems
					: session?.user
						? dashboardNavItems
						: [];

	function isNavActive(href: string) {
		if (
			href === "/admin" ||
			href === "/financing-admin" ||
			href === "/insurance-admin" ||
			href === "/dashboard" ||
			href === "/artmgmt"
		) {
			return pathname === href;
		}
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	return (
		<>
			<header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
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
								<span className="text-lg font-black tracking-tight text-[#FF5A2E] font-(family-name:--font-manrope)">
									{tCommon("brandName")}
								</span>
								<span className="text-[10px] font-semibold text-on-surface-variant font-(family-name:--font-manrope)">
									{tCommon("brandBy")}
								</span>
							</div>
						</Link>
					</div>

					<div className="flex items-center gap-3">
						{/* Search — artmgmt searches roster; other portals use global search */}
						{session?.user && (isArtmgmtPortal ? <ArtmgmtSearch /> : <GlobalSearch />)}

						{/* Tour Intelligence (New dynamic button) */}
						{session?.user && !isAdminPortal && !isFinancingAdminPortal && !isInsuranceAdminPortal && !isArtmgmtPortal && (
							<div className="relative inline-flex overflow-hidden rounded-xl p-[2.5px] group hidden md:inline-flex shrink-0">
								<span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FF5A2E_0%,#3b82f6_50%,#FF5A2E_100%)]" />
								<Link
									href="/tour-intelligence"
									className="relative flex items-center justify-center gap-2 w-full h-full bg-surface rounded-[9.5px] px-3 py-1.5 transition-colors group-hover:bg-primary/5"
								>
									<Icon name="ai" size={14} className="text-[#FF5A2E]" />
									<span className="font-(family-name:--font-manrope) font-semibold text-xs text-on-surface-variant whitespace-nowrap group-hover:text-primary transition-colors">
										{t("tourIntelligence")}
									</span>
								</Link>
							</div>
						)}

						{/* Locale Switcher — desktop only (accessible via drawer on mobile) */}
						<div className="relative hidden lg:block">
							<button
								type="button"
								onClick={() => setLangOpen((v) => !v)}
								className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-md border border-outline-variant/30 hover:bg-surface-container-low transition-colors uppercase"
								aria-haspopup="listbox"
								aria-expanded={langOpen}
							>
								{locale.toUpperCase()}
								<Icon name="chevron-down" size={14} className="leading-none" />
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
										className="absolute right-0 top-9 z-50 w-20 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden"
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
												className={`flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase hover:bg-surface-container-low transition-colors ${locale === l ? "text-primary" : "text-on-surface-variant"}`}
											>
												{l.toUpperCase()}
												{locale === l && (
													<Icon name="check" size={12} className="leading-none" />
												)}
											</button>
										))}
									</div>
								</>
							)}
						</div>

						{/* Theme toggle */}
						<ThemeToggle />

						{/* Notifications */}
						{session?.user && (
							<div className="relative">
								<button
									type="button"
									aria-label={t("openNotifications")}
									aria-expanded={notifOpen}
									onClick={() => setNotifOpen((v) => !v)}
									className="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95 relative"
								>
									<Icon name="bell" size={20} className="text-on-surface-variant" />
									{hasUnread && (
										<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF5A2E] rounded-full" />
									)}
								</button>
							</div>
						)}

						{/* Guide button */}
						{session?.user && (
							<button
								type="button"
								aria-label="Start page guide"
								onClick={() => window.dispatchEvent(new CustomEvent("ts:start-tour"))}
								className="p-2 hover:bg-surface-container-low rounded-lg transition-all active:scale-95 hidden lg:flex items-center justify-center"
								title="Page guide"
							>
								<Icon name="discovery" size={20} className="text-primary" />
							</button>
						)}

						{/* Avatar / session — visible on all sizes */}
						{session?.user ? (
							<div className="relative hidden lg:block">
								<button
									type="button"
									aria-label={t("openProfileMenu")}
									aria-expanded={profileOpen}
									onClick={() => setProfileOpen((v) => !v)}
									className="h-8 w-8 rounded-full bg-[#FF5A2E] overflow-hidden flex items-center justify-center text-white text-xs font-semibold select-none hover:opacity-90 transition-opacity active:scale-95"
								>
									{profileLogoUrl ? (
										// eslint-disable-next-line @next/next/no-img-element -- may be a base64 data URL; next/image does not support data: URIs
										<img src={profileLogoUrl} alt="" className="w-full h-full object-cover" />
									) : (
										userInitial
									)}
								</button>

								{profileOpen && (
									<>
										<button
											type="button"
											aria-label={t("closeProfileMenu")}
											className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent border-none"
											onClick={() => setProfileOpen(false)}
										/>
										<div className="absolute right-0 top-10 z-50 w-44 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden">
											<Link
												href={profileHref}
												onClick={() => setProfileOpen(false)}
												className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors font-(family-name:--font-manrope)"
											>
												<Icon name="profile" size={16} className="text-on-surface-variant" />
												{tCommon("profile")}
											</Link>
											{!isArtmgmtPortal && (
												<Link
													href="/settings"
													onClick={() => setProfileOpen(false)}
													className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors font-(family-name:--font-manrope)"
												>
													<Icon name="settings" size={16} className="text-on-surface-variant" />
													{tCommon("settings")}
												</Link>
											)}
											<button
												type="button"
												onClick={() => {
													setProfileOpen(false);
													handleLogout();
												}}
												className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors font-(family-name:--font-manrope)"
											>
												<Icon name="logout" size={16} className="text-on-surface-variant" />
												{tCommon("signOut")}
											</button>
										</div>
									</>
								)}
							</div>
						) : sessionPending ? (
							<div
								className="hidden lg:block h-9 w-9 rounded-full bg-surface-container animate-pulse"
								aria-label={t("checkingSession")}
								role="status"
							/>
						) : (
							<Link
								href="/login"
								className="hidden lg:inline-flex px-4 py-2 bg-[#FF5A2E] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
							>
								{tCommon("signIn")}
							</Link>
						)}

						{/* Hamburger — mobile only */}
						<button
							type="button"
							className="lg:hidden p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
							onClick={() => setMobileMenuOpen(true)}
							aria-label="Open navigation menu"
							aria-expanded={mobileMenuOpen}
						>
							<Icon name="menu" size={20} />
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
						className="fixed left-0 top-0 h-full w-72 z-50 bg-surface-container-lowest flex flex-col shadow-2xl lg:hidden"
						role="dialog"
						aria-modal="true"
						aria-label="Navigation menu"
					>
						{/* Drawer header */}
						<div className="flex items-center justify-between px-5 h-16 border-b border-outline-variant/20 shrink-0">
							<Link
								href="/"
								className="flex items-center gap-2.5"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Image
									src="/ckrowd-logo.png"
									alt={tCommon("logoAlt")}
									width={32}
									height={32}
								/>
								<div className="flex flex-col leading-tight">
									<span className="text-base font-black tracking-tight text-[#FF5A2E] font-(family-name:--font-manrope)">
										{tCommon("brandName")}
									</span>
									<span className="text-[10px] font-semibold text-on-surface-variant font-(family-name:--font-manrope)">
										{tCommon("brandBy")}
									</span>
								</div>
							</Link>
							<button
								type="button"
								onClick={() => setMobileMenuOpen(false)}
								className="p-2 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
								aria-label="Close navigation menu"
							>
								<Icon name="x" size={20} />
							</button>
						</div>

						{/* Language switcher */}
						<div className="px-5 py-3 border-b border-outline-variant/20 shrink-0">
							<div className="flex gap-2">
								{(routing.locales as readonly string[]).map((l) => (
									<button
										key={l}
										type="button"
									onClick={() => {
										router.replace(pathname, {
											locale: l as (typeof routing.locales)[number],
										});
										setMobileMenuOpen(false);
									}}
										className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase transition-colors ${
											locale === l
												? "bg-primary text-on-primary"
												: "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
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
											? "bg-primary/10 text-primary"
											: "text-on-surface-variant hover:bg-surface-container-low"
									}`}
								>
									<Icon name={item.icon} size={20} />
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
											className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm transition-all ${pathname === "/" ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
										>
											<Icon name="overview" size={20} />
											<span>{t("home")}</span>
										</Link>
										<Link
											href="/join"
											onClick={() => setMobileMenuOpen(false)}
											className={`flex items-center gap-3 px-5 py-3 mx-2 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm transition-all ${pathname === "/join" ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low"}`}
										>
											<Icon name="user-plus" size={20} />
											<span>{t("join")}</span>
										</Link>
									</>
								)}
						</nav>

						{/* Account section */}
						<div className="border-t border-outline-variant/20 px-3 py-3 space-y-0.5 shrink-0">
							{session?.user ? (
								<>
									{/* Notifications */}
									<button
										type="button"
										onClick={() => {
											setMobileMenuOpen(false);
											setNotifOpen(true);
										}}
										className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
									>
										<Icon name="bell" size={20} className="text-on-surface-variant" />
										<span>{t("notifications")}</span>
										{hasUnread && (
											<span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-[#FF5A2E] text-white text-[10px] flex items-center justify-center font-semibold">
												{unreadCount}
											</span>
										)}
									</button>

									{/* Profile */}
									<Link
										href={profileHref}
										onClick={() => setMobileMenuOpen(false)}
										className="flex items-center gap-3 px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
									>
										<Icon name="profile" size={20} className="text-on-surface-variant" />
										<span>{tCommon("profile")}</span>
									</Link>

									{/* Settings — promoter/admin portals only */}
									{!isArtmgmtPortal && (
										<Link
											href="/settings"
											onClick={() => setMobileMenuOpen(false)}
											className="flex items-center gap-3 px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
										>
											<Icon name="settings" size={20} className="text-on-surface-variant" />
											<span>{tCommon("settings")}</span>
										</Link>
									)}

									{/* Sign out */}
									<button
										type="button"
										onClick={() => {
											setMobileMenuOpen(false);
											handleLogout();
										}}
										className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-(family-name:--font-manrope) font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors"
									>
										<Icon name="logout" size={20} />
										<span>{tCommon("signOut")}</span>
									</button>
								</>
							) : (
								<Link
									href="/login"
									onClick={() => setMobileMenuOpen(false)}
									className="flex items-center justify-center gap-2 w-full py-3 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm font-(family-name:--font-manrope) hover:opacity-90 transition-opacity"
								>
									<Icon name="logout" size={14} />
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
						className="fixed top-16 right-2 md:right-12 z-50 w-[calc(100vw-1rem)] sm:w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
						role="dialog"
						aria-label={t("notifications")}
					>
						<div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
							<div className="flex items-center gap-2">
								<h3 className="font-(family-name:--font-manrope) font-semibold text-sm text-on-surface">
									{t("notifications")}
								</h3>
								{hasUnread && (
									<span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] flex items-center justify-center font-semibold">
										{unreadCount}
									</span>
								)}
							</div>
							<button
								type="button"
								onClick={() => setNotifOpen(false)}
								className="text-on-surface-variant hover:text-on-surface transition-colors"
								aria-label={t("closeNotifications")}
							>
								<Icon name="x" size={14} />
							</button>
						</div>
						{notifications.length === 0 ? (
							<p className="px-5 py-10 text-center text-sm text-on-surface-variant">
								{t("notif.empty")}
							</p>
						) : (
							<>
								<ul className="divide-y divide-outline-variant/10">
									{notifications.map((n) => (
										<li key={n.id}>
											<Link
												href={n.href}
												onClick={() => setNotifOpen(false)}
												className={`flex items-start gap-3 px-5 py-4 transition-colors ${n.unread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-container-low"}`}
											>
												<Icon name={n.icon} size={18} className={`mt-0.5 shrink-0 ${n.color}`} />
												<div className="flex-1 min-w-0">
													<p className={`text-sm text-on-surface truncate ${n.unread ? "font-semibold" : "font-semibold"}`}>
														{n.title}
													</p>
													<p className="text-xs text-on-surface-variant mt-0.5">{n.body}</p>
												</div>
												<div className="flex flex-col items-end gap-1.5 shrink-0">
													{n.date && (
														<span className="text-[10px] text-on-surface-variant/70 font-medium mt-0.5">
															{format.relativeTime(n.date, { now })}
														</span>
													)}
													{n.unread && (
														<span className="w-2 h-2 rounded-full bg-primary" />
													)}
												</div>
											</Link>
										</li>
									))}
								</ul>
								<div className="px-5 py-3 border-t border-outline-variant/20 flex items-center justify-between gap-4">
									<button
										type="button"
										className="text-xs font-semibold text-primary hover:underline"
										onClick={markAllRead}
									>
										{t("markAllAsRead")}
									</button>
									<Link
										href="/notifications"
										className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
										onClick={() => setNotifOpen(false)}
									>
										{t("viewAllNotifications")}
									</Link>
								</div>
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}
