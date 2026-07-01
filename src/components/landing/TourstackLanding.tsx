/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";

// Proper nouns — not translated.
const CITIES = [
	"Lagos",
	"Accra",
	"Nairobi",
	"Johannesburg",
	"Kigali",
	"Kampala",
	"Abidjan",
	"Dakar",
	"Cape Town",
	"Dar es Salaam",
];

// Icons / images / layout are data, not copy — they stay in the component and
// are zipped by index with the translated text pulled from the message catalog.
const FEATURE_ICONS: ReactNode[] = [
	<>
		<path d="m9 12 2 2 4-4" />
		<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
	</>,
	<path key="b" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" />,
	<path key="c" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
	<>
		<circle cx="12" cy="12" r="10" />
		<path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
	</>,
	<path
		key="e"
		d="M10 17h4V5H2v12h3m9 0h6v-5l-3-4h-3M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"
	/>,
	<path key="f" d="M3 3v18h18M7 15l3-4 3 3 5-7" />,
];

const GAP_ICONS: ReactNode[] = [
	<path
		key="a"
		d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
	/>,
	<>
		<rect x="2" y="6" width="20" height="13" rx="2" />
		<path d="M2 10h20" />
	</>,
	<path key="c" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
];

const CAP_META = [
	{ img: "/finance-dark.jpg", flip: false, route: "/financing" },
	{ img: "/ctx-venue.jpg", flip: true, route: "/insurance" },
	{ img: "/crowd-blue.jpg", flip: false, route: "/eoi" },
];

const EXPLORE_META = [
	{ n: "01", img: "/landing-promoter.jpg", route: "/register" },
	{ n: "02", img: "/landing-artist.jpg", route: "/onboard/artmgmt" },
	{ n: "03", img: "/concert-laser.jpg", route: "/financing-admin/login" },
	{ n: "04", img: "/insurers-meeting.jpg", route: "/insurance-admin/login" },
	{ n: "05", img: "/festival-pyro.jpg", route: "/join" },
	{ n: "06", img: "/production-drums.jpg", route: "/onboard/service" },
];

const NAV_LINKS = [
	{ href: "#how", key: "platform" },
	{ href: "#ecosystem", key: "ecosystem" },
	{ href: "#explore", key: "explore" },
	{ href: "#faq", key: "faq" },
] as const;

type CountStat = { prefix: string; count: number; suffix: string; label: string };
type TextPair = { title: string; body: string };
type FaqItem = { q: string; a: string; privacyNote?: boolean };

const ArrowUpRight = ({ size = 13 }: { size?: number }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
		<path d="M7 17 17 7M9 7h8v8" />
	</svg>
);

const ChevronRight = ({ size = 15 }: { size?: number }) => (
	<svg className="btn-ico" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
		<path d="m9 18 6-6-6-6" />
	</svg>
);

const pad2 = (i: number) => String(i + 1).padStart(2, "0");

export default function TourstackLanding({ fontClass }: { fontClass: string }) {
	const t = useTranslations("TourstackLanding");
	const { locale } = useParams<{ locale: string }>();
	const [theme, setTheme] = useState<"dark" | "light">("dark");
	const [menuOpen, setMenuOpen] = useState(false);
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const lenisRef = useRef<{ stop: () => void; start: () => void } | null>(null);

	const statsItems = t.raw("stats.items") as CountStat[];
	const roles = t.raw("roles") as string[];
	const gapItems = t.raw("gap.items") as { text: string }[];
	const features = t.raw("how.features") as TextPair[];
	const caps = t.raw("capabilities") as {
		eyebrow: string;
		title: string;
		body: string;
		link: string;
		alt: string;
	}[];
	const exploreCards = t.raw("explore.cards") as { title: string; sub: string }[];
	const principles = t.raw("principles.items") as TextPair[];
	const steps = t.raw("workflow.steps") as TextPair[];
	const whyStats = t.raw("whyAfrica.stats") as CountStat[];
	const faqs = t.raw("faq.items") as FaqItem[];

	// ---- theme: hydrate from storage / system, persist ----
	useEffect(() => {
		let saved: string | null = null;
		try {
			saved = localStorage.getItem("ts-theme");
		} catch {}
		const initial =
			saved === "light" || saved === "dark"
				? (saved as "light" | "dark")
				: matchMedia("(prefers-color-scheme: light)").matches
					? "light"
					: "dark";
		setTheme(initial);
	}, []);

	const toggleTheme = () => {
		setTheme((cur) => {
			const next = cur === "dark" ? "light" : "dark";
			try {
				localStorage.setItem("ts-theme", next);
			} catch {}
			return next;
		});
	};

	const toggleMenu = (open: boolean) => {
		setMenuOpen(open);
		document.body.style.overflow = open ? "hidden" : "";
		if (lenisRef.current) {
			if (open) lenisRef.current.stop();
			else lenisRef.current.start();
		}
	};

	// ---- motion engine: Lenis smooth scroll + GSAP/ScrollTrigger ----
	useEffect(() => {
		const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const nav = document.getElementById("nav");
		const root = document.querySelector<HTMLElement>(".tslp");
		if (!root) return;

		const cleanups: Array<() => void> = [];
		let cancelled = false;

		const revealAll = () =>
			root.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));

		// count-up
		const countIO = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (!e.isIntersecting) return;
					const el = e.target as HTMLElement;
					const target = +(el.dataset.count || "0");
					const pre = el.dataset.prefix || "";
					const suf = el.dataset.suffix || "";
					el.textContent = pre + "0" + suf;
					const t0 = performance.now();
					const tick = (now: number) => {
						const p = Math.min((now - t0) / 1800, 1);
						const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
						el.textContent = pre + v.toLocaleString("en-US") + suf;
						if (p < 1) requestAnimationFrame(tick);
					};
					requestAnimationFrame(tick);
					countIO.unobserve(el);
				});
			},
			{ threshold: 0.2 },
		);
		root.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));
		cleanups.push(() => countIO.disconnect());

		// seamless marquees: clone the group until the track always fills the viewport
		root.querySelectorAll<HTMLElement>(".marquee, .marquee-rev").forEach((m) => {
			const g = m.firstElementChild as HTMLElement | null;
			if (!g) return;
			const gw = g.getBoundingClientRect().width || 1;
			const copies = 2 * Math.max(1, Math.ceil(innerWidth / gw) + 1);
			const frag = document.createDocumentFragment();
			for (let i = 1; i < copies; i++) {
				const c = g.cloneNode(true) as HTMLElement;
				c.setAttribute("aria-hidden", "true");
				c.dataset.clone = "1";
				frag.appendChild(c);
			}
			m.appendChild(frag);
		});
		cleanups.push(() =>
			root.querySelectorAll('[data-clone="1"]').forEach((c) => c.remove()),
		);

		const onScrollNav = () =>
			nav?.classList.toggle("nav-solid", window.scrollY > 40);

		if (reduce) {
			revealAll();
			addEventListener("scroll", onScrollNav, { passive: true });
			cleanups.push(() => removeEventListener("scroll", onScrollNav));
			return () => cleanups.forEach((fn) => fn());
		}

		(async () => {
			const [{ gsap }, stMod, lenisMod] = await Promise.all([
				import("gsap"),
				import("gsap/ScrollTrigger"),
				import("lenis"),
			]);
			if (cancelled) return;
			const ScrollTrigger = stMod.ScrollTrigger;
			const Lenis = lenisMod.default;
			gsap.registerPlugin(ScrollTrigger);

			const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
			lenisRef.current = lenis;
			lenis.on("scroll", ScrollTrigger.update);
			const ticker = (time: number) => lenis.raf(time * 1000);
			gsap.ticker.add(ticker);
			gsap.ticker.lagSmoothing(0);

			const anchorHandlers: Array<[HTMLAnchorElement, (e: Event) => void]> = [];
			root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
				const handler = (e: Event) => {
					const id = a.getAttribute("href") || "";
					if (id.length < 2) return;
					const target = document.querySelector(id);
					if (target) {
						e.preventDefault();
						lenis.scrollTo(target as HTMLElement, { offset: -80 });
					}
				};
				a.addEventListener("click", handler);
				anchorHandlers.push([a, handler]);
			});

			const navTrigger = ScrollTrigger.create({
				start: 0,
				end: "max",
				onUpdate: (self) => nav?.classList.toggle("nav-solid", self.scroll() > 40),
			});

			const fromVars = (el: Element) =>
				el.classList.contains("reveal-l")
					? { opacity: 0, x: -56 }
					: el.classList.contains("reveal-r")
						? { opacity: 0, x: 56 }
						: { opacity: 0, y: 26, filter: "blur(6px)" };

			root.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
				gsap.fromTo(
					group.querySelectorAll(".reveal"),
					{ opacity: 0, y: 26, filter: "blur(6px)" },
					{
						opacity: 1,
						y: 0,
						filter: "blur(0px)",
						duration: 0.8,
						ease: "power3.out",
						stagger: 0.08,
						scrollTrigger: { trigger: group, start: "top 82%" },
					},
				);
			});
			root.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
				if (el.closest("[data-stagger]")) return;
				gsap.fromTo(el, fromVars(el), {
					opacity: 1,
					x: 0,
					y: 0,
					filter: "blur(0px)",
					duration: 0.85,
					ease: "power3.out",
					scrollTrigger: { trigger: el, start: "top 85%" },
				});
			});

			root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((img) => {
				const amt = +(img.dataset.parallax || "20") * 0.35;
				gsap.fromTo(
					img,
					{ yPercent: -amt },
					{
						yPercent: amt,
						ease: "none",
						scrollTrigger: {
							trigger: img.parentElement as HTMLElement,
							start: "top bottom",
							end: "bottom top",
							scrub: true,
						},
					},
				);
			});

			const sticky = root.querySelector<HTMLElement>(".hpin-sticky");
			const track = root.querySelector<HTMLElement>(".htrack");
			if (sticky && track && innerWidth > 768) {
				const dist = () => Math.max(track.scrollWidth - innerWidth + 48, 0);
				gsap.to(track, {
					x: () => -dist(),
					ease: "none",
					scrollTrigger: {
						trigger: ".hpin",
						start: "top top",
						end: () => "+=" + dist(),
						scrub: 1,
						pin: sticky,
						anticipatePin: 1,
						invalidateOnRefresh: true,
					},
				});
			}

			ScrollTrigger.refresh();

			cleanups.push(() => {
				gsap.ticker.remove(ticker);
				navTrigger.kill();
				ScrollTrigger.getAll().forEach((trig) => trig.kill());
				anchorHandlers.forEach(([a, h]) => a.removeEventListener("click", h));
				lenis.destroy();
				lenisRef.current = null;
			});
		})();

		return () => {
			cancelled = true;
			cleanups.forEach((fn) => fn());
		};
	}, []);

	return (
		<div className={`tslp antialiased ${fontClass} ${theme === "light" ? "light" : ""}`}>
			<div className="grain" />

			{/* ============ NAV ============ */}
			<header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4">
				<nav
					id="nav"
					className={`mt-5 w-full max-w-6xl rounded-full hair pl-4 pr-2.5 sm:pl-6 h-16 flex items-center justify-between${menuOpen ? " menu-open" : ""}`}
				>
					<a href="#top" className="flex items-center gap-2.5 shrink-0">
						<img src="/ckrowd-logo.png" alt="TourStack" className="h-8 w-8 object-contain" />
						<span className="flex flex-col leading-none">
							<span className="font-semibold text-[18px] tracking-tight">TourStack</span>
							<span className="text-[10.5px] tracking-[.14em] uppercase text-muted mt-0.5">{t("nav.byCkrowd")}</span>
						</span>
					</a>
					<div className="hidden md:flex items-center gap-8 text-[13.5px] text-muted">
						{NAV_LINKS.map((l) => (
							<a key={l.href} href={l.href} className="hover:text-ink transition-colors">
								{t(`nav.${l.key}`)}
							</a>
						))}
					</div>
					<div className="flex items-center gap-1.5">
						<button
							id="theme"
							onClick={toggleTheme}
							className="press h-9 w-9 grid place-items-center rounded-full hair text-muted hover:text-ink"
							aria-label="Toggle theme"
						>
							{theme === "dark" ? (
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
									<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
								</svg>
							) : (
								<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
									<circle cx="12" cy="12" r="4.2" />
									<path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
								</svg>
							)}
						</button>
						<Link href={`/${locale}/login`} className="hidden lg:inline-flex text-[13.5px] text-muted hover:text-ink transition-colors px-3 py-2">
							{t("nav.login")}
						</Link>
						<Link
							href={`/${locale}/register`}
							className="group press hidden md:inline-flex items-center gap-2 bg-orange text-white font-medium text-[13.5px] pl-4 pr-2 py-2 rounded-full"
						>
							{t("nav.join")}
							<span className="btn-ico h-7 w-7 rounded-full bg-black/15 grid place-items-center">
								<ArrowUpRight />
							</span>
						</Link>
						<button
							id="burger"
							onClick={() => toggleMenu(!menuOpen)}
							className={`md:hidden relative h-9 w-9 rounded-full hair${menuOpen ? " x" : ""}`}
							aria-label="Menu"
						>
							<svg className="ico-menu absolute inset-0 m-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
								<path d="M4 9h16M4 15h16" />
							</svg>
							<svg className="ico-close absolute inset-0 m-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
								<path d="M6 6 18 18M18 6 6 18" />
							</svg>
						</button>
					</div>
				</nav>
			</header>

			<div
				id="overlay"
				className={`fixed inset-0 z-40 backdrop-blur-2xl md:hidden flex flex-col items-center justify-center gap-1${menuOpen ? " show" : " invisible opacity-0"}`}
				style={{ background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}
			>
				{NAV_LINKS.map((l, i) => (
					<a
						key={l.href}
						href={l.href}
						onClick={() => toggleMenu(false)}
						className="display text-5xl font-semibold py-2"
						style={{ transitionDelay: `${0.05 * (i + 1)}s` }}
					>
						{l.key === "platform" ? t("nav.platformShort") : t(`nav.${l.key}`)}
					</a>
				))}
				<Link
					href={`/${locale}/register`}
					onClick={() => toggleMenu(false)}
					className="mt-6 bg-orange text-white font-medium px-7 py-3 rounded-full"
					style={{ transitionDelay: "0.25s" }}
				>
					{t("nav.join")}
				</Link>
			</div>

			<main id="top">
				{/* ============ HERO ============ */}
				<section className="relative min-h-[100dvh] flex items-center justify-center text-center overflow-hidden">
					<video
						className="absolute inset-0 h-full w-full object-cover"
						autoPlay
						muted
						loop
						playsInline
						style={{ background: "#0a0a0a" }}
					>
						<source src="/hero-main.mp4" type="video/mp4" />
					</video>
					<div
						className="absolute inset-0"
						style={{ background: "radial-gradient(120% 90% at 50% 30%, rgba(0,0,0,.25), rgba(0,0,0,.78))" }}
					/>
					<div className="relative z-10 w-full max-w-4xl mx-auto px-5 pt-24">
						<h1
							className="reveal display uppercase text-[clamp(2.15rem,9vw,3.95rem)] font-semibold text-white"
							style={{ letterSpacing: "-0.01em", lineHeight: 1.04 }}
						>
							{t("hero.title1")}
							<br />
							{t("hero.title2")}
							<br />
							<span className="text-orange">{t("hero.title3")}</span>
						</h1>
						<p className="reveal mt-7 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
							{t("hero.subtitle")}
						</p>
						<div className="reveal mt-9 flex flex-col sm:flex-row gap-3 justify-center">
							<Link href={`/${locale}/register`} className="group press inline-flex items-center justify-center gap-2 bg-orange text-white font-medium pl-6 pr-2 py-3.5 rounded-full">
								{t("hero.ctaPrimary")}
								<span className="btn-ico h-8 w-8 rounded-full bg-black/15 grid place-items-center">
									<ArrowUpRight size={15} />
								</span>
							</Link>
							<Link
								href={`/${locale}/register`}
								className="press inline-flex items-center justify-center gap-2 text-white font-medium px-6 py-3.5 rounded-full backdrop-blur-sm hover:bg-white/15 transition-colors"
								style={{ border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.06)" }}
							>
								{t("hero.ctaSecondary")}
							</Link>
						</div>
					</div>
					<div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[10px] tracking-[.3em] uppercase text-white/55">
						{t("hero.scroll")} <span className="h-8 w-[1px] bg-gradient-to-b from-white/60 to-transparent" />
					</div>
				</section>

				{/* ============ TRUST ROW ============ */}
				<section className="hair-b">
					<div className="max-w-[1760px] mx-auto px-6 sm:px-10 py-12 flex flex-col lg:flex-row items-center justify-between gap-8 reveal">
						<p className="eyebrow text-muted shrink-0">{t("trust.eyebrow")}</p>
						<div className="flex items-center gap-10 sm:gap-14 flex-wrap justify-center">
							<img src="/access-bank.png" alt="Access Bank" className="h-9 sm:h-10 w-auto object-contain opacity-90" />
							<span className="hidden sm:block h-8 w-px" style={{ background: "var(--hair)" }} />
							<img src="/sanlam-allianz.png" alt="SanlamAllianz" className="h-8 sm:h-9 w-auto object-contain opacity-90" />
						</div>
					</div>
				</section>

				{/* ============ STAT ROW ============ */}
				<section className="py-20 sm:py-28 hair-b overflow-hidden">
					<div className="max-w-[1760px] mx-auto px-6 sm:px-10">
						<div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-5 mb-14">
							<h2 className="display text-[clamp(1.9rem,4.5vw,3.2rem)] font-semibold max-w-md">{t("stats.title")}</h2>
							<p className="text-muted max-w-xs md:text-right">{t("stats.desc")}</p>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-10" data-stagger>
							{statsItems.map((s) => (
								<div className="reveal" key={s.label}>
									<div className="mono text-[clamp(1.7rem,2.4vw,3rem)] font-semibold text-orange leading-none tabular-nums whitespace-nowrap flex items-baseline">
										{s.prefix && <span className="text-[0.58em] mr-0.5">{s.prefix}</span>}
										<span data-count={s.count} data-suffix={s.suffix}>
											{s.count}{s.suffix}
										</span>
									</div>
									<div className="mt-4 pt-4 border-t text-[13px] text-muted" style={{ borderColor: "var(--border)" }}>
										{s.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ============ DUAL MARQUEE ============ */}
				<section className="py-14 hair-b overflow-hidden space-y-7">
					<div className="fade-x overflow-hidden">
						<div className="marquee items-center">
							<span className="flex items-center shrink-0">
								{CITIES.map((c) => (
									<span key={c} className="flex items-center">
										<span className="display text-2xl sm:text-4xl font-semibold px-7">{c}</span>
										<span className="h-1.5 w-1.5 rounded-full bg-orange" />
									</span>
								))}
							</span>
						</div>
					</div>
					<div className="fade-x overflow-hidden">
						<div className="marquee-rev items-center text-muted">
							<span className="flex items-center shrink-0">
								{roles.map((r) => (
									<span key={r} className="flex items-center">
										<span className="text-lg sm:text-2xl px-7">{r}</span>
										<span className="text-orange/50">/</span>
									</span>
								))}
							</span>
						</div>
					</div>
				</section>

				{/* ============ THE GAP ============ */}
				<section className="py-24 sm:py-32 hair-b">
					<div className="max-w-6xl mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-14 items-center">
						<div className="reveal reveal-l imgcard px-wrap order-2 lg:order-1 h-[28rem]">
							<img src="/landing-market.jpg" alt={t("gap.card2")} className="px-img" data-parallax="24" />
							<div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.6), transparent 60%)" }} />
							<div className="absolute bottom-0 p-7 text-white">
								<div className="mono text-sm text-white/70">{t("gap.card1")}</div>
								<div className="display text-2xl font-semibold mt-1">{t("gap.card2")}</div>
							</div>
						</div>
						<div className="reveal reveal-r order-1 lg:order-2">
							<span className="eyebrow text-orange">{t("gap.eyebrow")}</span>
							<h2 className="display text-[clamp(1.9rem,4vw,3.1rem)] font-semibold mt-4">
								<span className="block whitespace-nowrap">{t("gap.title1")}</span>
								<span className="block whitespace-nowrap">{t("gap.title2")}</span>
							</h2>
							<p className="mt-6 text-lg text-muted max-w-xl">{t("gap.desc")}</p>
							<ul className="mt-8 space-y-5" data-stagger>
								{gapItems.map((item, i) => (
									<li className="reveal flex items-center gap-4" key={item.text}>
										<span className="shrink-0 h-9 w-9 rounded-full bg-orange/10 grid place-items-center text-orange">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
												{GAP_ICONS[i]}
											</svg>
										</span>
										<p className="text-ink/80">{item.text}</p>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				{/* ============ HOW IT WORKS ============ */}
				<section id="how" className="py-24 sm:py-32 hair-b">
					<div className="max-w-[1760px] mx-auto px-6 sm:px-10">
						<div className="reveal max-w-2xl">
							<span className="eyebrow text-orange">{t("how.eyebrow")}</span>
							<h2 className="display text-[clamp(2.1rem,5vw,3.8rem)] font-semibold mt-4">
								{t("how.title1")}
								<br />
								{t("how.title2")}
								<br />
								{t("how.title3")}
							</h2>
							<p className="mt-5 text-lg text-muted">{t("how.desc")}</p>
						</div>
						<div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
							{features.map((f, i) => (
								<article className="reveal card p-7" key={f.title}>
									<span className="h-11 w-11 rounded-xl bg-orange/10 grid place-items-center text-orange">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
											{FEATURE_ICONS[i]}
										</svg>
									</span>
									<h3 className="display text-xl font-semibold mt-5">{f.title}</h3>
									<p className="mt-2 text-muted text-[15px] leading-relaxed">{f.body}</p>
								</article>
							))}
						</div>
					</div>
				</section>

				{/* ============ CAPABILITIES ============ */}
				<section id="capabilities" className="py-24 sm:py-32 hair-b">
					<div className="max-w-6xl mx-auto px-6 sm:px-10 space-y-24 sm:space-y-32">
						{caps.map((c, i) => {
							const meta = CAP_META[i];
							const text = (
								<div className={`reveal ${meta.flip ? "reveal-r order-1 lg:order-2" : "reveal-l"}`}>
									<span className="eyebrow text-orange">{c.eyebrow}</span>
									<h3 className="display text-[clamp(1.8rem,4vw,3rem)] font-semibold mt-4">{c.title}</h3>
									<p className="mt-5 text-lg text-muted max-w-xl">{c.body}</p>
									<Link href={`/${locale}${meta.route}`} className="group inline-flex items-center gap-2 mt-6 font-medium text-ink hover:text-orange transition-colors">
										{c.link} <ChevronRight />
									</Link>
								</div>
							);
							const media = (
								<div className={`reveal ${meta.flip ? "reveal-l order-2 lg:order-1" : "reveal-r"} imgcard px-wrap h-[26rem]`}>
									<img src={meta.img} className="px-img" data-parallax="20" alt={c.alt} />
								</div>
							);
							return (
								<div className="grid lg:grid-cols-2 gap-12 items-center" key={c.title}>
									{meta.flip ? (
										<>
											{media}
											{text}
										</>
									) : (
										<>
											{text}
											{media}
										</>
									)}
								</div>
							);
						})}
					</div>
				</section>

				{/* ============ EXPLORE (horizontal pinned) ============ */}
				<section id="explore" className="hpin relative hair-b">
					<div className="hpin-sticky">
						<div className="max-w-[1760px] mx-auto w-full px-6 sm:px-10 mb-8 sm:mb-10 flex items-end justify-between gap-6">
							<div className="reveal">
								<span className="eyebrow text-orange">{t("explore.eyebrow")}</span>
								<h2 className="display text-[clamp(2rem,5vw,3.6rem)] font-semibold mt-3">
									{t("explore.title1")}
									<br />
									{t("explore.title2")}
								</h2>
							</div>
							<div className="hidden md:flex items-center gap-2 text-muted text-[12px] uppercase tracking-[.2em] reveal">
								{t("explore.dragToScroll")}
								<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</div>
						</div>
						<div className="htrack px-6 sm:px-10">
							{exploreCards.map((card, i) => (
								<Link href={`/${locale}${EXPLORE_META[i].route}`} key={EXPLORE_META[i].n} className="hcard imgcard group h-[56vh] sm:h-[60vh]">
									<img src={EXPLORE_META[i].img} className="absolute inset-0 h-full w-full object-cover" alt="" />
									<div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.8), transparent 60%)" }} />
									<div className="absolute top-5 left-5 mono text-white/60 text-sm">{EXPLORE_META[i].n}</div>
									<div className="absolute bottom-0 p-6 text-white">
										<div className="display text-2xl font-semibold">{card.title}</div>
										<div className="text-white/75 mt-1 flex items-center gap-1.5">
											{card.sub} <ChevronRight size={14} />
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</section>

				{/* ============ PRINCIPLES ============ */}
				<section id="ecosystem" className="py-24 sm:py-32 hair-b">
					<div className="max-w-[1760px] mx-auto px-6 sm:px-10">
						<div className="reveal max-w-2xl mb-14">
							<span className="eyebrow text-orange">{t("principles.eyebrow")}</span>
							<h2 className="display text-[clamp(2.1rem,5vw,3.8rem)] font-semibold mt-4">{t("principles.title")}</h2>
						</div>
						<div className="grid md:grid-cols-3 gap-8" data-stagger>
							{principles.map((p, i) => (
								<div className="reveal" key={p.title}>
									<div className="mono text-orange text-sm">{pad2(i)}</div>
									<h4 className="display text-2xl font-semibold mt-3">{p.title}</h4>
									<p className="mt-3 text-muted leading-relaxed">{p.body}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ============ WORKFLOW ============ */}
				<section id="workflow" className="py-24 sm:py-32 hair-b">
					<div className="max-w-[1760px] mx-auto px-6 sm:px-10 grid lg:grid-cols-[0.82fr_1.18fr] gap-14 lg:gap-24">
						<div className="reveal lg:sticky lg:top-28 lg:self-start">
							<span className="eyebrow text-orange">{t("workflow.eyebrow")}</span>
							<h2 className="display text-[clamp(2.1rem,5vw,3.8rem)] font-semibold mt-4">
								{t("workflow.title1")}
								<br />
								{t("workflow.title2")}
							</h2>
							<p className="mt-6 text-muted text-lg max-w-sm">{t("workflow.desc")}</p>
						</div>
						<ol className="relative" data-stagger>
							<div className="absolute left-[26px] top-6 bottom-6 w-px" style={{ background: "var(--border)" }} />
							{steps.map((step, i) => (
								<li className="reveal relative flex gap-6 sm:gap-8 pb-14 last:pb-0" key={step.title}>
									<div
										className="shrink-0 relative z-10 h-[52px] w-[52px] rounded-full bg-orange text-white grid place-items-center mono text-[17px] font-semibold"
										style={{ boxShadow: "0 0 0 7px var(--bg)" }}
									>
										{pad2(i)}
									</div>
									<div className="pt-1">
										<div className="eyebrow text-muted mb-2">{t("workflow.stepLabel", { n: pad2(i) })}</div>
										<h3 className="display text-xl sm:text-2xl font-semibold">{step.title}</h3>
										<p className="mt-3 text-muted leading-relaxed max-w-xl">{step.body}</p>
									</div>
								</li>
							))}
						</ol>
					</div>
				</section>

				{/* ============ WHY AFRICA ============ */}
				<section className="relative py-28 sm:py-36 hair-b overflow-hidden">
					<img src="/landing-hero.jpg" className="px-img" data-parallax="34" alt="" />
					<div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.55) 60%, rgba(0,0,0,.3))" }} />
					<div className="relative z-10 max-w-[1760px] mx-auto px-6 sm:px-10">
						<div className="max-w-2xl reveal text-white">
							<h2 className="display text-[clamp(2.3rem,6vw,4.6rem)] font-semibold">
								{t("whyAfrica.title1")}
								<br />
								<span className="text-orange">{t("whyAfrica.title2")}</span>
							</h2>
							<p className="mt-6 text-lg text-white/80">{t("whyAfrica.desc")}</p>
							<div className="mt-10 flex flex-wrap gap-12" data-stagger>
								{whyStats.map((s) => (
									<div className="reveal" key={s.label}>
										<div className="mono text-4xl sm:text-5xl font-semibold text-orange">
											<span data-count={s.count} data-prefix={s.prefix} data-suffix={s.suffix}>
												{s.prefix}{s.count}{s.suffix}
											</span>
										</div>
										<div className="mt-2 eyebrow text-white/60">{s.label}</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* ============ CTA BAND ============ */}
				<section id="join" className="py-24 sm:py-32">
					<div className="max-w-[1760px] mx-auto px-6 sm:px-10">
						<div className="reveal relative overflow-hidden rounded-[32px] bg-orange text-white px-7 sm:px-16 py-16 sm:py-24 text-center">
							<div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
							<div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-black/15 blur-3xl" />
							<div className="relative max-w-3xl mx-auto">
								<h2 className="display text-[clamp(2.1rem,5.5vw,4.2rem)] font-semibold">{t("cta.title")}</h2>
								<p className="mt-5 text-lg text-white/85">{t("cta.subtitle")}</p>
								<div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
									<Link href={`/${locale}/join`} className="group press inline-flex items-center justify-center gap-2 bg-black text-white font-medium pl-6 pr-2 py-3.5 rounded-full">
										{t("cta.primary")}
										<span className="btn-ico h-8 w-8 rounded-full bg-white/15 grid place-items-center">
											<ArrowUpRight size={15} />
										</span>
									</Link>
									<Link href={`/${locale}/contact`} className="press inline-flex items-center justify-center gap-2 border-2 border-white/85 text-white font-medium px-6 py-3.5 rounded-full hover:bg-white hover:text-orange transition-colors">
										{t("cta.secondary")}
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ============ FAQ ============ */}
				<section id="faq" className="pb-24 sm:pb-32">
					<div className="max-w-3xl mx-auto px-6 sm:px-10">
						<div className="reveal text-center mb-12">
							<span className="eyebrow text-orange">{t("faq.eyebrow")}</span>
							<h2 className="display text-[clamp(2rem,4.5vw,3.2rem)] font-semibold mt-4">{t("faq.title")}</h2>
						</div>
						<div className="space-y-3" data-stagger>
							{faqs.map((item, i) => (
								<div className={`faq reveal card${openFaq === i ? " open" : ""}`} key={item.q}>
									<button
										className="w-full text-left p-6 flex justify-between items-center gap-4"
										onClick={() => setOpenFaq((cur) => (cur === i ? null : i))}
									>
										<span className="display text-lg font-semibold">{item.q}</span>
										<span className="chev shrink-0 text-orange">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
												<path d="M12 5v14M5 12h14" />
											</svg>
										</span>
									</button>
									<div className="faq-body">
										<div>
											<p className="px-6 pb-6 text-muted leading-relaxed">
												{item.a}
												{item.privacyNote && (
													<> {t.rich("faq.dataPrivacyNote", {
														privacy: (chunks) => <Link href={`/${locale}/privacy`} className="text-orange hover:underline">{chunks}</Link>,
														terms: (chunks) => <Link href={`/${locale}/terms`} className="text-orange hover:underline">{chunks}</Link>,
													})}</>
												)}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>

			{/* ============ FOOTER ============ */}
			<footer className="hair-b border-t pt-20 pb-10 overflow-hidden" style={{ borderColor: "var(--border)" }}>
				<div className="max-w-[1760px] mx-auto px-6 sm:px-10">
					<div className="grid md:grid-cols-5 gap-10 pb-16">
						<div className="md:col-span-2">
							<div className="flex items-center gap-2.5">
								<img src="/ckrowd-logo.png" alt="" className="h-8 w-8 object-contain" />
								<span className="flex flex-col leading-none">
									<span className="font-semibold text-[18px]">TourStack</span>
									<span className="text-[10.5px] tracking-[.14em] uppercase text-muted mt-0.5">{t("nav.byCkrowd")}</span>
								</span>
							</div>
							<p className="mt-4 text-muted max-w-xs text-[15px]">{t("footer.tagline")}</p>
						</div>
						<div>
							<div className="eyebrow text-muted mb-4">{t("footer.platform")}</div>
							<div className="flex flex-col gap-3 text-muted text-[15px]">
								<Link href={`/${locale}/register`} className="hover:text-orange transition-colors">{t("footer.links.verification")}</Link>
								<Link href={`/${locale}/financing`} className="hover:text-orange transition-colors">{t("footer.links.financing")}</Link>
								<Link href={`/${locale}/insurance`} className="hover:text-orange transition-colors">{t("footer.links.insurance")}</Link>
								<Link href={`/${locale}/eoi`} className="hover:text-orange transition-colors">{t("footer.links.payments")}</Link>
							</div>
						</div>
						<div>
							<div className="eyebrow text-muted mb-4">{t("footer.company")}</div>
							<div className="flex flex-col gap-3 text-muted text-[15px]">
								<a href="#ecosystem" className="hover:text-orange transition-colors">{t("footer.links.ecosystem")}</a>
								<a href="#workflow" className="hover:text-orange transition-colors">{t("footer.links.howItWorks")}</a>
								<a href="#how" className="hover:text-orange transition-colors">{t("footer.links.platform")}</a>
								<Link href={`/${locale}/contact`} className="hover:text-orange transition-colors">{t("footer.links.contact")}</Link>
							</div>
						</div>
						<div>
							<div className="eyebrow text-muted mb-4">{t("footer.legal")}</div>
							<div className="flex flex-col gap-3 text-muted text-[15px]">
								<Link href={`/${locale}/privacy`} className="hover:text-orange transition-colors">{t("footer.links.privacy")}</Link>
								<Link href={`/${locale}/terms`} className="hover:text-orange transition-colors">{t("footer.links.terms")}</Link>
							</div>
						</div>
					</div>
					<div className="display text-[clamp(3rem,15vw,12rem)] font-semibold leading-none select-none -mb-3" style={{ color: "var(--hair)" }}>
						TourStack
					</div>
					<div className="border-t pt-6 flex flex-col sm:flex-row justify-between gap-3 text-[13px] text-muted" style={{ borderColor: "var(--border)" }}>
						<span>{t("footer.copyright")}</span>
						<span>{t("footer.builtFor")}</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
