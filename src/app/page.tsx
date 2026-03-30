import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";

export default function LandingPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e]">
      <TopNav activeLink="platform" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            alt="High-energy live concert crowd at night with vibrant stage lights"
            fill
            className="object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzmBZ4sptM2EkEigkgVtZoQswUChDcxcN0l6igDH_EBa2GLtVN7P1I0t88pF31shR8wCgzj8mSaIu9AyJPvDpAhc2Zn1ivhXJDcBLGQ5AzaptLJr7T6fzIAIrhumj7UB4lHs54qvzSr8qd20qkkM4-u_3ZS16w8T0TYa-lLii8xmKgEmUtd-6QMIxrtRTa2qj4P3QBHJI6nBv1QRVZg0oWkiaWSXSeE06motFRMGPuzO9rrRsgINcAeTbd-6DNlL26ZgKLmyAsnjE"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 px-6 md:px-12 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">
                The Future of Touring
              </span>
            </div>
            <h1 className="font-(family-name:--font-manrope) font-extrabold text-5xl md:text-7xl text-white leading-[1.1] tracking-tight">
              Plan Live Music with{" "}
              <span className="text-white">Confidence</span>
            </h1>
            <p className="text-xl text-white/80 max-w-xl leading-relaxed">
              TourStack by Ckrowd connects artists, promoters, and financiers on
              a single high-performance stage. Transform your global reach with
              smart booking.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/discovery"
                className="px-8 py-4 bg-[#FF5A30] text-white rounded-xl font-bold flex items-center gap-3 shadow-2xl shadow-[#FF5A30]/40 hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                Browse Tours
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button
                type="button"
                className="px-8 py-4 glass-effect bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero analytics card */}
          <div className="hidden lg:block">
            <div className="glass-effect bg-white/10 p-1 rounded-2xl border border-white/20 shadow-2xl">
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-(family-name:--font-manrope) font-bold text-slate-900">
                    Live Tour Analytics
                  </h3>
                  <span className="material-symbols-outlined text-[#FF5A30]">
                    trending_up
                  </span>
                </div>
                <div className="space-y-6">
                  <div className="h-32 w-full bg-slate-50 rounded-lg flex items-end gap-2 p-4">
                    <div className="w-full bg-orange-100 h-12 rounded-t-sm" />
                    <div className="w-full bg-orange-200 h-24 rounded-t-sm" />
                    <div className="w-full bg-orange-300 h-16 rounded-t-sm" />
                    <div className="w-full bg-[#FF5A30] h-28 rounded-t-sm" />
                    <div className="w-full bg-orange-400 h-20 rounded-t-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Ticket Sales
                      </p>
                      <p className="text-2xl font-black text-slate-900 font-(family-name:--font-manrope)">
                        84.2k
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-black text-slate-900 font-(family-name:--font-manrope)">
                        $1.2M
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-slate-900 mb-6 tracking-tight">
              The Global Stage
            </h2>
            <div className="w-20 h-1.5 bg-[#FF5A30] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "hub",
                title: "Centralized Workflow",
                desc: "Eliminate the fragmentation of planning. Manage routing, logistics, and communication in one unified cockpit.",
              },
              {
                icon: "temp_preferences_custom",
                title: "Smart Matching",
                desc: "Our AI-driven engine connects artists with promoters who match their genre, scale, and performance history.",
              },
              {
                icon: "payments",
                title: "Financing & Support",
                desc: "Access direct funding opportunities and secure escrow payments to protect every stakeholder in the ecosystem.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group p-8 rounded-4xl bg-slate-50 hover:bg-white hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500 border border-transparent hover:border-orange-100"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF5A30] mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-(family-name:--font-manrope) font-bold text-xl text-slate-900 mb-4">
                  {card.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Audience Section */}
      <section className="bg-surface-container-low overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* For Promoters */}
          <div className="relative py-24 px-6 md:px-12 lg:px-24 flex flex-col justify-center">
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
              <span className="material-symbols-outlined text-[30rem]">
                groups
              </span>
            </div>
            <div className="max-w-md relative z-10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#FF5A30] mb-4">
                For Promoters
              </h4>
              <h3 className="font-(family-name:--font-manrope) font-extrabold text-4xl text-slate-900 mb-6">
                Discover the Next World Tour.
              </h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Access a curated database of verified talent ready for global
                expansion. TourStack provides the risk-assessment data and
                financing support you need to scale confidently.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#FF5A30] mt-0.5">
                    check_circle
                  </span>
                  <span className="font-medium text-slate-800">
                    Advanced talent discovery filters
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#FF5A30] mt-0.5">
                    check_circle
                  </span>
                  <span className="font-medium text-slate-800">
                    Direct financing application bridge
                  </span>
                </li>
              </ul>
              <Link
                href="/discovery"
                className="inline-flex items-center gap-2 font-bold text-[#FF5A30] group"
              >
                Explore Promoter Tools
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          {/* Promoter image */}
          <div className="relative h-96 lg:h-auto">
            <Image
              alt="Music producer's hands working on a sophisticated digital soundboard in an orange-lit studio"
              fill
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzWXPpYohajV9i7Nd0f9nzx-ZWA-tIa92UNiK1ciIptOjCXWTaS3dc_47Xao19pvyBY20pemwKhiZAORMyLQUsvnpz47j7Ty2kc-GwX4GsqJpk9nDK37jcHqTWWovvwUB0FWkOPtz32B-frt4qdx60UbG80S0Lo6dDt-VOsw-7eJhXNueDzYuhohAZFrva2dYqgIkUJU6RpnQs6-EbDYa6ksvtgbA69otuCbhFqP9M0P54dlvDSkfG7wB_C3dQcwrYXrM3f7VxuPI"
            />
          </div>

          {/* Artist image */}
          <div className="relative h-96 lg:h-auto lg:order-last">
            <Image
              alt="Dynamic shot of a solo artist singing with intense emotion on a smoke-filled stage"
              fill
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbFVWZKlKsZYgRPvM0_3Z5o9HdJi657RnEtca1r4aYNUftgUS2nAOzMz417vGZwR_y_xW1veV6xagqfoflEtz6sZtDBxicjpLtLT7D-X1HDtHV8CxXlPso3y9Y582MCO0VKsaNLu0udmjL08bCvSPI_hUUHdLEg3UJEE8HJGjyKV1l7ZA9wJ9FCnxszkrE6UKyR62DNQ6FXMf3LB-96QpptnFowC5bbNUocWbod9gtnzTI7JjP43E_IkBxiscjfIuHBS2M9nIljEw"
            />
          </div>

          {/* For Artists */}
          <div className="relative py-24 px-6 md:px-12 lg:px-24 flex flex-col justify-center bg-white">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none hidden lg:block">
              <span className="material-symbols-outlined text-[30rem]">
                mic_external_on
              </span>
            </div>
            <div className="max-w-md relative z-10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#FF5A30] mb-4">
                For Artists
              </h4>
              <h3 className="font-(family-name:--font-manrope) font-extrabold text-4xl text-slate-900 mb-6">
                Your Market Expansion, Simplified.
              </h3>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Turn fragmented booking requests into a structured growth plan.
                Own your data, secure your payments, and find the right partners
                for your next career milestone.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#FF5A30] mt-0.5">
                    check_circle
                  </span>
                  <span className="font-medium text-slate-800">
                    Structured booking request management
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#FF5A30] mt-0.5">
                    check_circle
                  </span>
                  <span className="font-medium text-slate-800">
                    Real-time revenue & data tracking
                  </span>
                </li>
              </ul>
              <Link
                href="/discovery"
                className="inline-flex items-center gap-2 font-bold text-[#FF5A30] group"
              >
                Start Your Artist Journey
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 md:px-12 text-center bg-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full opacity-[0.03] pointer-events-none"
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-(family-name:--font-manrope) font-extrabold text-4xl md:text-5xl text-slate-900 mb-8 tracking-tight">
            Join the Tour Ecosystem
          </h2>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            Ready to take your production to the next stage? Get started with
            TourStack and experience the future of live music management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-[#FF5A30] text-white rounded-xl font-bold text-lg shadow-xl shadow-[#FF5A30]/20 hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              Get Started Free
            </Link>
            <button
              type="button"
              className="px-10 py-5 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all"
            >
              Contact Sales
            </button>
          </div>
          <p className="mt-8 text-sm text-slate-400 font-medium">
            Trusted by 500+ global promoters and 2,000+ artists.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
