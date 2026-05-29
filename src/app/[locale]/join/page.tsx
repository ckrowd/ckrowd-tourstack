import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";

type Props = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ s?: string; w?: string; a?: string }>;
};

export default async function JoinPage({ params, searchParams }: Props) {
	const { locale } = await params;
	const { s, w, a } = await searchParams;
	setRequestLocale(locale);

	const t = await getTranslations("JoinPage");

	const roles = [
		{
			key: "service",
			token: s ?? null,
			icon: "business",
			gradient: "from-orange-500 to-rose-500",
			bg: "bg-orange-50",
			border: "border-orange-200",
			iconBg: "bg-orange-100 text-orange-600",
			btnBg: "bg-[#FF5A30] hover:opacity-90 text-white",
		},
		{
			key: "workforce",
			token: w ?? null,
			icon: "engineering",
			gradient: "from-blue-500 to-indigo-500",
			bg: "bg-blue-50",
			border: "border-blue-200",
			iconBg: "bg-blue-100 text-blue-600",
			btnBg: "bg-blue-600 hover:opacity-90 text-white",
		},
		{
			key: "artmgmt",
			token: a ?? null,
			icon: "music_note",
			gradient: "from-purple-500 to-pink-500",
			bg: "bg-purple-50",
			border: "border-purple-200",
			iconBg: "bg-purple-100 text-purple-600",
			btnBg: "bg-purple-600 hover:opacity-90 text-white",
		},
	] as const;

	return (
		<div className="min-h-screen bg-white text-[#191c1e] flex flex-col">
			{/* Header */}
			<header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
				<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
					<Link href={`/${locale}`} className="flex items-center gap-2.5">
						<Image src="/ckrowd-logo.png" alt="TourStack" width={32} height={32} />
						<div className="leading-tight">
							<span className="block text-base font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)">
								TourStack
							</span>
							<span className="block text-[9px] font-semibold text-slate-500 font-(family-name:--font-manrope)">
								by Ckrowd
							</span>
						</div>
					</Link>
					<Link
						href={`/${locale}/login`}
						className="text-sm font-semibold text-slate-600 hover:text-[#FF5A30] transition-colors"
					>
						{t("nav.login")}
					</Link>
				</div>
			</header>

			<main className="flex-1">
				{/* Hero */}
				<section className="bg-gradient-to-br from-[#FF5A30]/5 via-white to-orange-50/30 pt-16 pb-20 px-6">
					<div className="max-w-3xl mx-auto text-center">
						<span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-bold uppercase tracking-widest mb-6">
							<span className="material-symbols-outlined text-xs">bolt</span>
							{t("hero.badge")}
						</span>
						<h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#191c1e] font-(family-name:--font-manrope) leading-tight mb-5">
							{t("hero.title")}
						</h1>
						<p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
							{t("hero.description")}
						</p>
					</div>
				</section>

				{/* What is TourStack */}
				<section className="py-16 px-6 bg-white">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-2xl font-bold font-(family-name:--font-manrope) text-center text-[#191c1e] mb-10">
							{t("about.title")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{(["data", "finance", "network"] as const).map((key) => (
								<div key={key} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
									<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center mx-auto mb-4">
										<span className="material-symbols-outlined text-[#FF5A30]">
											{key === "data" ? "analytics" : key === "finance" ? "account_balance" : "hub"}
										</span>
									</div>
									<h3 className="font-bold text-[#191c1e] mb-2 font-(family-name:--font-manrope)">
										{t(`about.pillars.${key}.title`)}
									</h3>
									<p className="text-sm text-slate-500 leading-relaxed">
										{t(`about.pillars.${key}.description`)}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Role cards */}
				<section className="py-16 px-6 bg-gradient-to-b from-slate-50 to-white">
					<div className="max-w-5xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-black font-(family-name:--font-manrope) text-[#191c1e] mb-3">
								{t("roles.title")}
							</h2>
							<p className="text-slate-500">{t("roles.subtitle")}</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{roles.map((role) => {
								const hasToken = role.token !== null;
								return (
									<div
										key={role.key}
										className={`flex flex-col rounded-2xl border-2 p-6 transition-all ${
											hasToken
												? `${role.bg} ${role.border} hover:shadow-lg hover:-translate-y-0.5`
												: "bg-slate-50 border-slate-200 opacity-60"
										}`}
									>
										<div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${role.iconBg}`}>
											<span className="material-symbols-outlined text-2xl">{role.icon}</span>
										</div>
										<h3 className="text-xl font-extrabold font-(family-name:--font-manrope) text-[#191c1e] mb-2">
											{t(`roles.${role.key}.title`)}
										</h3>
										<p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">
											{t(`roles.${role.key}.description`)}
										</p>
										<ul className="space-y-1.5 mb-6">
											{(
												t.raw(`roles.${role.key}.examples`) as string[]
											).map((ex: string) => (
												<li key={ex} className="flex items-center gap-2 text-xs text-slate-500">
													<span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
													{ex}
												</li>
											))}
										</ul>
										{hasToken ? (
											<Link
												href={`/${locale}/stakeholders/${role.token}`}
												className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-opacity ${role.btnBg}`}
											>
												{t(`roles.${role.key}.cta`)}
											</Link>
										) : (
											<span className="w-full py-3 rounded-xl text-sm font-bold text-center bg-slate-200 text-slate-400 cursor-not-allowed">
												{t("roles.unavailable")}
											</span>
										)}
									</div>
								);
							})}
						</div>

						{!s && !w && !a && (
							<p className="text-center text-sm text-slate-400 mt-8">
								{t("roles.noTokensNotice")}
							</p>
						)}
					</div>
				</section>

				{/* Benefits */}
				<section className="py-16 px-6 bg-[#191c1e] text-white">
					<div className="max-w-5xl mx-auto">
						<h2 className="text-2xl font-bold font-(family-name:--font-manrope) text-center mb-10">
							{t("benefits.title")}
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{(["profile", "finance", "insurance", "opportunities"] as const).map((key) => (
								<div key={key} className="text-center">
									<span className="material-symbols-outlined text-[#FF5A30] text-3xl mb-3 block">
										{key === "profile"
											? "verified_user"
											: key === "finance"
												? "payments"
												: key === "insurance"
													? "security"
													: "public"}
									</span>
									<h3 className="font-bold text-sm mb-1">
										{t(`benefits.items.${key}.title`)}
									</h3>
									<p className="text-xs text-slate-400 leading-relaxed">
										{t(`benefits.items.${key}.description`)}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
}
