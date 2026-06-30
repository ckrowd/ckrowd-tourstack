import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function ContactPage() {
	const t = useTranslations("ContactPage");
	const tCommon = useTranslations("Common");

	const contactItems = [
		{
			icon: "mail",
			title: t("items.general"),
			description: t("details.general"),
			value: "hello@ckrowd.africa",
			href: "mailto:hello@ckrowd.africa",
		},
		{
			icon: "groups",
			title: t("items.workforce"),
			description: t("details.workforce"),
			value: "workforce@ckrowd.africa",
			href: "mailto:workforce@ckrowd.africa",
		},
		{
			icon: "account_balance",
			title: t("items.financing"),
			description: t("details.financing"),
			value: "finance@ckrowd.africa",
			href: "mailto:finance@ckrowd.africa",
		},
		{
			icon: "gavel",
			title: t("items.legal"),
			description: t("details.legal"),
			value: "legal@ckrowd.africa",
			href: "mailto:legal@ckrowd.africa",
		},
	];

	return (
		<div className="relative min-h-[100dvh] bg-[#0a0a0a] text-white font-(family-name:--font-geist) flex flex-col overflow-hidden">
			{/* Ambient glow */}
			<div className="pointer-events-none absolute -top-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-orange/15 blur-[140px]" />
			<div className="pointer-events-none absolute top-1/3 -left-40 h-[28rem] w-[28rem] rounded-full bg-orange/[0.06] blur-[140px]" />

			{/* Slim dark header */}
			<header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
				<Link
					href="/"
					className="flex items-center gap-2.5"
					aria-label={tCommon("brandLockupLabel")}
				>
					<Image src="/ckrowd-logo.png" alt={tCommon("logoAlt")} width={32} height={32} />
					<span className="flex flex-col leading-tight">
						<span className="text-base font-bold tracking-tight text-orange">
							{tCommon("brandName")}
						</span>
						<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
							{tCommon("brandBy")}
						</span>
					</span>
				</Link>
				<Link
					href="/"
					className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/55 hover:text-white transition-colors"
				>
					<span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-0.5">
						arrow_back
					</span>
					{tCommon("brandName")}
				</Link>
			</header>

			<main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 pt-12 pb-24">
				<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange mb-5">
					{t("getInTouch")}
				</p>
				<h1 className="font-(family-name:--font-display) text-4xl md:text-5xl lg:text-6xl leading-[1.02] tracking-tight max-w-3xl">
					{t("title")}
				</h1>
				<p className="text-white/60 text-base md:text-lg mt-6 mb-14 max-w-2xl leading-relaxed">
					{t("description")}
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
					{contactItems.map((item) => (
						<a
							key={item.title}
							href={item.href}
							className="group relative flex items-start gap-4 p-6 md:p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-orange/40 hover:bg-white/[0.05] transition-all duration-300"
						>
							<div className="w-12 h-12 rounded-xl bg-orange/12 flex items-center justify-center shrink-0 group-hover:bg-orange/20 transition-colors">
								<span
									className="material-symbols-outlined text-orange"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									{item.icon}
								</span>
							</div>
							<div className="min-w-0">
								<p className="font-semibold text-white mb-1.5">{item.title}</p>
								<p className="text-white/55 text-sm leading-relaxed mb-3.5">
									{item.description}
								</p>
								<p className="inline-flex items-center gap-1.5 text-orange font-semibold text-sm">
									{item.value}
									<span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5">
										arrow_forward
									</span>
								</p>
							</div>
						</a>
					))}
				</div>

				<div className="mt-5 rounded-2xl bg-white/[0.03] border border-white/10 p-8 md:p-10 text-center">
					<span
						className="material-symbols-outlined text-orange text-3xl mb-3 block"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						location_on
					</span>
					<h2 className="font-(family-name:--font-display) text-xl text-white mb-1.5">
						{t("location.title")}
					</h2>
					<p className="text-white/55 text-sm">{t("location.subtitle")}</p>
					<p className="text-white/45 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
						{t("location.detail")}
					</p>
				</div>
			</main>

			<footer className="relative z-10 border-t border-white/8 px-6 md:px-12 py-7">
				<div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs text-white/40">
					<span>
						{tCommon("brandName")} {tCommon("brandBy")}
					</span>
				</div>
			</footer>
		</div>
	);
}
