import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";

const whyCkrowd = [
  {
    icon: "hub",
    title: "Centralized Touring Workflow",
    desc: "Manage every stage of tour planning in one place — from discovery to execution. No fragmented spreadsheets, no missed messages.",
  },
  {
    icon: "temp_preferences_custom",
    title: "Smart Promoter–Artiste Matching",
    desc: "Rule-based matching connects promoters with artistes based on date availability, venue capacity, and budget alignment.",
  },
  {
    icon: "bar_chart",
    title: "Data-Driven Event Planning",
    desc: "Generate business summaries with estimated revenue, cost projections, and risk notes — structured for financiers from day one.",
  },
  {
    icon: "account_balance",
    title: "Financing & Insurance Support",
    desc: "Track financing requirements, connect with capital partners, and unlock insurance backing to scale ambitious live experiences.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e]">
      <TopNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            alt="High-energy live concert crowd at night with vibrant stage lights and raised hands"
            fill
            className="object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzmBZ4sptM2EkEigkgVtZoQswUChDcxcN0l6igDH_EBa2GLtVN7P1I0t88pF31shR8wCgzj8mSaIu9AyJPvDpAhc2Zn1ivhXJDcBLGQ5AzaptLJr7T6fzIAIrhumj7UB4lHs54qvzSr8qd20qkkM4-u_3ZS16w8T0TYa-lLii8xmKgEmUtd-6QMIxrtRTa2qj4P3QBHJI6nBv1QRVZg0oWkiaWSXSeE06motFRMGPuzO9rrRsgINcAeTbd-6DNlL26ZgKLmyAsnjE"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                public
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">
                Live Music Ecosystem
              </span>
            </div>

            <h1 className="font-(family-name:--font-manrope) font-extrabold text-5xl md:text-7xl text-white leading-[1.1] tracking-tight">
              Concert & Touring as a {" "}
              <span className="text-white">Service.</span>
            </h1>

            <p className="text-xl text-white/85 max-w-xl leading-relaxed">
              TourStack by Ckrowd connects concert &amp; festival promoters with
              artiste management companies. Plan live music with confidence —
              from discovery to execution.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-[#FF5A30] text-white rounded-xl font-bold flex items-center gap-3 shadow-2xl shadow-[#FF5A30]/40 hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                Browse Artistes &amp; Tours
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 glass-effect bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Promoter Dashboard
              </Link>
            </div>
          </div>

          {/* Hero analytics card */}
          <div className="hidden lg:block">
            <div className="glass-effect bg-white/10 p-1 rounded-2xl border border-white/20 shadow-2xl">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-(family-name:--font-manrope) font-bold text-slate-900">
                    Tour Pipeline Overview
                  </h3>
                  <span className="material-symbols-outlined text-[#FF5A30]">
                    trending_up
                  </span>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#FF5A30] shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">Active Tour Projects</span>
                    </div>
                    <span className="font-(family-name:--font-manrope) font-extrabold text-slate-900">12</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">EOIs Under Review</span>
                    </div>
                    <span className="font-(family-name:--font-manrope) font-extrabold text-slate-900">47</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-sm font-semibold text-slate-700">Approved Tour Stops</span>
                    </div>
                    <span className="font-(family-name:--font-manrope) font-extrabold text-slate-900">38</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Promoters</p>
                      <p className="text-xl font-black text-slate-900 font-(family-name:--font-manrope)">500+</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Markets</p>
                      <p className="text-xl font-black text-slate-900 font-(family-name:--font-manrope)">24</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Ckrowd */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-4">
              Why TourStack
            </span>
            <h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-slate-900 mb-6 tracking-tight">
              Built for the Touring Business
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A dedicated platform for the entire touring ecosystem — Promoters,
              Artiste Management, Service Providers, Banks, Insurance, and
              Workforce.
            </p>
            <div className="w-20 h-1.5 bg-[#FF5A30] mx-auto rounded-full mt-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyCkrowd.map((card) => (
              <div
                key={card.title}
                className="group p-8 rounded-4xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 border border-transparent hover:border-orange-100"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF5A30] mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-(family-name:--font-manrope) font-bold text-lg text-slate-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Promoters + For Artists & Management */}
      <section className="bg-surface-container-low overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* For Promoters */}
          <div className="relative py-24 px-6 md:px-12 lg:px-24 flex flex-col justify-center">
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
              <span className="material-symbols-outlined text-[30rem]">groups</span>
            </div>
            <div className="max-w-md relative z-10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#FF5A30] mb-4">
                For Promoters
              </h4>
              <h3 className="font-(family-name:--font-manrope) font-extrabold text-4xl text-slate-900 mb-6">
                Join the Pan-African Tour Circuit.
              </h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Become part of a structured, continent-wide touring network.
                Discover top-tier artistes, submit formal Expressions of Interest,
                and access financing support to bring ambitious shows to life.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Show interest in being part of a Tour Stop",
                  "Discover and submit EOIs for top-tier artistes",
                  "State financing needs for your concert or festival",
                  "Streamline planning and align with other Tour Promoters",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#FF5A30] mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <span className="font-medium text-slate-800 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/discovery"
                className="inline-flex items-center gap-2 font-bold text-[#FF5A30] group"
              >
                Browse Artistes &amp; Tours
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          <div className="relative h-96 lg:h-auto">
            <Image
              alt="Music producer working on a sophisticated digital soundboard in an orange-lit studio"
              fill
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzWXPpYohajV9i7Nd0f9nzx-ZWA-tIa92UNiK1ciIptOjCXWTaS3dc_47Xao19pvyBY20pemwKhiZAORMyLQUsvnpz47j7Ty2kc-GwX4GsqJpk9nDK37jcHqTWWovvwUB0FWkOPtz32B-frt4qdx60UbG80S0Lo6dDt-VOsw-7eJhXNueDzYuhohAZFrva2dYqgIkUJU6RpnQs6-EbDYa6ksvtgbA69otuCbhFqP9M0P54dlvDSkfG7wB_C3dQcwrYXrM3f7VxuPI"
            />
          </div>

          <div className="relative h-96 lg:h-auto lg:order-last">
            <Image
              alt="Solo artist performing with intense emotion on a smoke-filled stage under a single bright spotlight"
              fill
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbFVWZKlKsZYgRPvM0_3Z5o9HdJi657RnEtca1r4aYNUftgUS2nAOzMz417vGZwR_y_xW1veV6xagqfoflEtz6sZtDBxicjpLtLT7D-X1HDtHV8CxXlPso3y9Y582MCO0VKsaNLu0udmjL08bCvSPI_hUUHdLEg3UJEE8HJGjyKV1l7ZA9wJ9FCnxszkrE6UKyR62DNQ6FXMf3LB-96QpptnFowC5bbNUocWbod9gtnzTI7JjP43E_IkBxiscjfIuHBS2M9nIljEw"
            />
          </div>

          {/* For Artists & Management */}
          <div className="relative py-24 px-6 md:px-12 lg:px-24 flex flex-col justify-center bg-white">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
              <span className="material-symbols-outlined text-[30rem]">mic_external_on</span>
            </div>
            <div className="max-w-md relative z-10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#FF5A30] mb-4">
                For Artists &amp; Management
              </h4>
              <h3 className="font-(family-name:--font-manrope) font-extrabold text-4xl text-slate-900 mb-6">
                Expand into New Markets.
              </h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                State your touring intent, get matched with serious promoters,
                and receive structured high-quality booking requests. Reduce
                friction and grow with confidence across new territories.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "State interest to tour and set your availability window",
                  "Get matched with verified, serious promoters",
                  "Receive structured Expressions of Interest",
                  "Align on tour dates and expand into new markets",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#FF5A30] mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <span className="font-medium text-slate-800 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/discovery"
                className="inline-flex items-center gap-2 font-bold text-[#FF5A30] group"
              >
                Start Your Touring Journey
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How the Platform Works */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-4">
              Platform Workflow
            </span>
            <h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl text-slate-900 tracking-tight">
              From Discovery to Execution
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-6 top-8 bottom-8 w-0.5 bg-orange-100" />
            <div className="space-y-10">
              {[
                {
                  n: "01",
                  title: "Ckrowd Announces Tour & Artistes",
                  desc: "Admin creates a Tour Project on TourStack — including artiste roster, fee range, availability dates, and technical requirements.",
                  icon: "campaign",
                },
                {
                  n: "02",
                  title: "Promoter Submits Expression of Interest",
                  desc: "Promoters browse available artistes and tours, then submit a formal EOI with their venue, date, budget, and funding model.",
                  icon: "send",
                },
                {
                  n: "03",
                  title: "Matching & Review",
                  desc: "TourStack scores each EOI against artiste requirements. Ckrowd team reviews flagged matches and makes informed decisions.",
                  icon: "manage_search",
                },
                {
                  n: "04",
                  title: "Report & Decision",
                  desc: "The system generates a business summary — estimated revenue, costs, and risk notes — structured for financiers. Admin approves, rejects, or requests revision.",
                  icon: "task_alt",
                },
              ].map((step) => (
                <div key={step.n} className="relative flex gap-6 md:gap-10 items-start">
                  <div className="relative z-10 shrink-0 w-12 h-12 rounded-full bg-[#FF5A30] text-white flex items-center justify-center shadow-lg shadow-[#FF5A30]/30">
                    <span className="material-symbols-outlined text-sm">{step.icon}</span>
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-[#FF5A30] tracking-widest uppercase">
                        Step {step.n}
                      </span>
                    </div>
                    <h4 className="font-(family-name:--font-manrope) font-bold text-xl text-slate-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 md:px-12 text-center bg-surface-container-low relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-slate-900 mb-6 tracking-tight">
            Ready to Take the Stage?
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Join TourStack and become part of the Pan-African touring ecosystem.
            Whether you&apos;re a promoter, artiste management company, or
            service provider — this is your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-10 py-5 bg-[#FF5A30] text-white rounded-xl font-bold text-lg shadow-xl shadow-[#FF5A30]/20 hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              Get Started as a Promoter
            </Link>
            <Link
              href="/discovery"
              className="px-10 py-5 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all"
            >
              Browse Artistes &amp; Tours
            </Link>
          </div>
          <p className="mt-8 text-sm text-slate-400 font-medium">
            Trusted by 500+ promoters across 24 markets.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
