import Footer from "@/components/Footer";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import FinancingQuickApply from "@/components/FinancingQuickApply";
import { getFinancingApplications } from "@/app/actions";

const products = [
	{
		icon: "account_balance",
		name: "Tour Stop Advance",
		tag: "Most Popular",
		tagColor: "bg-[#FF5A30]/10 text-[#FF5A30]",
		description:
			"Get up to 40% of the agreed artiste fee covered before the event date. Repaid automatically from gate receipts.",
		amount: "Up to $30,000",
		term: "30–90 days",
		rate: "3–5% flat fee",
		eligibility: "Approved EOI required",
	},
	{
		icon: "groups",
		name: "Venue Build-Out Credit",
		tag: "Infrastructure",
		tagColor: "bg-tertiary-fixed text-on-tertiary-fixed",
		description:
			"Finance staging, sound, lighting, and production upgrades needed to host a qualifying tour stop.",
		amount: "Up to $75,000",
		term: "6–18 months",
		rate: "From 8% p.a.",
		eligibility: "Owned or leased venue",
	},
	{
		icon: "shield",
		name: "Event Insurance Bundle",
		tag: "Risk Cover",
		tagColor: "bg-surface-container-high text-on-surface-variant",
		description:
			"Comprehensive cover for cancellation, adverse weather, public liability, and artiste no-show.",
		amount: "Flexible",
		term: "Per event",
		rate: "From 1.2% of event budget",
		eligibility: "Open to all promoters",
	},
	{
		icon: "trending_up",
		name: "Marketing & Ticketing Float",
		tag: "Growth",
		tagColor: "bg-[#FF5A30]/10 text-[#FF5A30]",
		description:
			"Unlock working capital to run pre-event marketing and cover ticketing platform fees before revenue lands.",
		amount: "Up to $15,000",
		term: "60 days",
		rate: "2.5% flat fee",
		eligibility: "Active TourStack account",
	},
];

const steps = [
	{
		step: "01",
		title: "Submit EOI",
		desc: "Apply for a tour stop on the Discovery page. A confirmed EOI unlocks financing eligibility.",
	},
	{
		step: "02",
		title: "Select Product",
		desc: "Choose the financing product that fits your event budget and timeline.",
	},
	{
		step: "03",
		title: "Upload Documents",
		desc: "Submit venue contract, projected gate receipts, and ID verification.",
	},
	{
		step: "04",
		title: "Decision in 48h",
		desc: "Our capital partners review and issue a term sheet within two business days.",
	},
	{
		step: "05",
		title: "Funds Disbursed",
		desc: "Approved funds land in your account before the event build-out deadline.",
	},
];

const partners = [
	{
		name: "AfriCapital Partners",
		region: "Pan-Africa",
		focus: "Event Finance",
	},
	{ name: "Lagos Growth Fund", region: "West Africa", focus: "SME & Culture" },
	{
		name: "East Africa Ventures",
		region: "East Africa",
		focus: "Creative Economy",
	},
	{
		name: "Rand Music Finance",
		region: "Southern Africa",
		focus: "Live Entertainment",
	},
];

const faqs = [
	{
		q: "Do I need a bank account in Africa to qualify?",
		a: "Yes. Funds are disbursed to a verified business account in the country of the tour stop. We support accounts in 18 African markets.",
	},
	{
		q: "Can I apply for financing before my EOI is approved?",
		a: "You can start your financing profile at any time, but funds will only be released once your EOI is marked Approved by Ckrowd.",
	},
	{
		q: "What happens if the event is cancelled?",
		a: "Cancellation triggered by the artiste is covered by the Event Insurance Bundle. Promoter-initiated cancellations are subject to the repayment schedule in your term sheet.",
	},
	{
		q: "Is there a minimum event budget to qualify?",
		a: "Tour Stop Advance requires a minimum confirmed artiste fee of $5,000. Other products have their own thresholds as shown above.",
	},
];

export default async function FinancingPage() {
	const appsResult = await getFinancingApplications();
	const applications = appsResult.data ?? [];

	return (
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />

			<main className="pt-24 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto flex flex-col gap-16">
				{/* Hero */}
				<header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
					<div className="lg:col-span-7">
						<span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
							TourStack — Financing & Insurance
						</span>
						<h1 className="font-(family-name:--font-manrope) text-5xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tighter">
							Capital for{" "}
							<span className="text-[#FF5A30]">Every Tour Stop.</span>
						</h1>
						<p className="mt-6 text-on-surface-variant text-lg max-w-xl leading-relaxed">
							TourStack connects promoters across Africa with purpose-built
							financing products — so cash flow never stands between you and a
							world-class show.
						</p>
						<div className="mt-8 flex flex-wrap gap-4">
							<Link
								href="/eoi"
								className="bg-[#FF5A30] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
							>
								Apply via EOI
							</Link>
							<a
								href="#products"
								className="border border-outline-variant px-8 py-3.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-low transition-all"
							>
								Explore Products
							</a>
						</div>
					</div>

					{/* Stats strip */}
					<div className="lg:col-span-5 grid grid-cols-2 gap-4">
						{[
							{ value: "$2.4M", label: "Disbursed to Date" },
							{ value: "94%", label: "Repayment Rate" },
							{ value: "48h", label: "Avg Decision Time" },
							{ value: "18", label: "Markets Covered" },
						].map((s) => (
							<div
								key={s.label}
								className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-[#FF5A30]/5 shadow-sm"
							>
								<p className="text-3xl font-black font-(family-name:--font-manrope) text-[#FF5A30]">
									{s.value}
								</p>
								<p className="text-xs uppercase font-bold text-on-surface-variant mt-1 tracking-wider">
									{s.label}
								</p>
							</div>
						))}
					</div>
				</header>

				{/* My Applications */}
				<section>
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						My Applications
					</h2>
					<div id="quick-apply" className="mb-8">
						<FinancingQuickApply />
					</div>
					{applications.length === 0 ? (
						<div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
								account_balance
							</span>
							<h3 className="font-(family-name:--font-manrope) font-bold text-on-surface text-lg mb-2">
								No applications yet
							</h3>
							<p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-6">
								Browse our financing products below and apply to cover your
								event costs.
							</p>
							<Link
								href="#products"
								className="inline-flex items-center gap-2 bg-[#FF5A30] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
							>
								Explore Products
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{applications.map((app) => {
								const appTour = app.tour;
								const appArtist = appTour?.artist;
								const appStatus = String(app.status ?? "pending");
								const statusColor =
									appStatus === "approved"
										? "bg-emerald-100 text-emerald-800"
										: appStatus === "declined"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800";
								return (
									<div
										key={String(app.id)}
										className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-transparent hover:border-outline-variant/20 transition-all"
									>
										<div className="flex items-start justify-between gap-4 mb-4">
											<div>
												<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
													{String(app.product ?? "Application")}
												</p>
												<p className="text-sm text-on-surface-variant mt-0.5">
													{String(appArtist?.name ?? "")}
													{appArtist?.tour_name
														? ` — ${String(appArtist.tour_name)}`
														: ""}
												</p>
											</div>
											<span
												className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${statusColor}`}
											>
												{appStatus.replace(/_/g, " ")}
											</span>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div className="p-3 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
													Requested
												</p>
												<p className="font-bold text-on-surface">
													{String(app.currency ?? "USD")}{" "}
													{Number(app.amount_requested).toLocaleString()}
												</p>
											</div>
											<div className="p-3 bg-surface-container-low rounded-lg">
												<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
													Applied
												</p>
												<p className="font-bold text-on-surface">
													{app.created_at
														? new Date(
																String(app.created_at),
															).toLocaleDateString("en-US", {
																month: "short",
																day: "numeric",
																year: "numeric",
															})
														: "—"}
												</p>
											</div>
										</div>
										<div className="mt-4">
											<Link
												href={`/financing/${String(app.id)}`}
												className="text-sm font-bold text-[#FF5A30] hover:underline"
											>
												View details
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</section>

				{/* Products */}
				<section id="products">
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						Financing Products
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{products.map((p) => (
							<div
								key={p.name}
								className="bg-surface-container-lowest rounded-2xl p-8 border border-transparent hover:border-outline-variant/20 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-5"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="w-12 h-12 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
										<span
											className="material-symbols-outlined text-[#FF5A30] text-2xl"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{p.icon}
										</span>
									</div>
									<span
										className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${p.tagColor}`}
									>
										{p.tag}
									</span>
								</div>

								<div>
									<h3 className="font-(family-name:--font-manrope) text-xl font-extrabold">
										{p.name}
									</h3>
									<p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
										{p.description}
									</p>
								</div>

								<div className="grid grid-cols-3 gap-3 pt-2 border-t border-outline-variant/20">
									{[
										{ label: "Amount", value: p.amount },
										{ label: "Term", value: p.term },
										{ label: "Cost", value: p.rate },
									].map((d) => (
										<div key={d.label}>
											<p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
												{d.label}
											</p>
											<p className="text-sm font-bold text-on-surface mt-0.5">
												{d.value}
											</p>
										</div>
									))}
								</div>

								<div className="flex items-center justify-between pt-1">
									<span className="text-xs text-on-surface-variant flex items-center gap-1.5">
										<span className="material-symbols-outlined text-sm">
											verified
										</span>
										{p.eligibility}
									</span>
									<Link
										href="#quick-apply"
										className="text-[#FF5A30] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
									>
										Apply{" "}
										<span className="material-symbols-outlined text-sm">
											arrow_forward
										</span>
									</Link>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* How it Works + Partners */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
					{/* Steps */}
					<section className="lg:col-span-7">
						<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
							How It Works
						</h2>
						<div className="relative pl-8">
							<div className="absolute left-[14px] top-2 bottom-2 w-px bg-outline-variant/40" />
							<div className="space-y-8">
								{steps.map((s, i) => (
									<div key={s.step} className="relative flex gap-6">
										<div
											className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 ${
												i === 0
													? "bg-[#FF5A30] text-white border-[#FF5A30]"
													: "bg-surface text-[#FF5A30] border-[#FF5A30]/40"
											}`}
										>
											{s.step}
										</div>
										<div>
											<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
												{s.title}
											</p>
											<p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
												{s.desc}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</section>

					{/* Capital Partners */}
					<section className="lg:col-span-5 space-y-6">
						<h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
							Capital Partners
						</h2>
						<div className="space-y-3">
							{partners.map((p) => (
								<div
									key={p.name}
									className="bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4 border border-transparent hover:border-outline-variant/20 transition-all shadow-sm"
								>
									<div className="w-10 h-10 rounded-full bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
										<span
											className="material-symbols-outlined text-[#FF5A30]"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											corporate_fare
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-bold text-sm text-on-surface truncate">
											{p.name}
										</p>
										<p className="text-xs text-on-surface-variant mt-0.5">
											{p.region} · {p.focus}
										</p>
									</div>
									<span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
								</div>
							))}
						</div>

						{/* CTA card */}
						<div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden">
							<div className="relative z-10">
								<h4 className="font-(family-name:--font-manrope) text-lg font-bold leading-tight">
									Ready to Unlock Funding?
								</h4>
								<p className="text-white/90 text-sm mt-2 leading-relaxed">
									Start your EOI and your financing profile in one flow.
								</p>
								<Link
									href="/eoi"
									className="mt-5 inline-block bg-white text-[#FF5A30] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
								>
									Get Started
								</Link>
							</div>
							<span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] rotate-12">
								payments
							</span>
						</div>
					</section>
				</div>

				{/* FAQ */}
				<section>
					<h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">
						Frequently Asked Questions
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{faqs.map((f) => (
							<div
								key={f.q}
								className="bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/10 shadow-sm"
							>
								<p className="font-(family-name:--font-manrope) font-bold text-on-surface mb-2">
									{f.q}
								</p>
								<p className="text-sm text-on-surface-variant leading-relaxed">
									{f.a}
								</p>
							</div>
						))}
					</div>
				</section>
			  <Footer />
</main>
		</div>
	);
}
