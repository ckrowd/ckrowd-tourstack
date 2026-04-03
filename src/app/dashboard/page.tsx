import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const requests = [
  {
    name: "Vanguard Echo",
    tour: "Pan-African Tour 2024",
    date: "Oct 12, 2024",
    venue: "Eko Convention Centre, Lagos",
    status: "Pending Review",
    match: "94%",
    statusColor: "bg-yellow-100 text-yellow-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUQQfNDdTgx68ldF99DVk88ykm02ZF5hAFM9Zp82hdkUolvQLjrvMjkwy3ijXu8TDXa5Sp5VEzI3eyaiGNBH-nBotRABfdgcDWY9ue5W2CA6uu6mMwK4jrvpAqvdeuxmIwy2GiKO3iWpDPvrN1DbN1QlBm4ubkjCtTVK8H8Ln463Z9KUsx8Vs3V1lJKEea1fROpcoTQizKU0IncXZQgo--0vp60vC0bSlp-68cVcc6epdqA3NCOVFBScwx-P_JUIBCl-TTJRdGAVg",
    imgAlt: "Vanguard Echo performing on stage with blue atmospheric lighting",
  },
  {
    name: "Aria Velvet",
    tour: "Continental Jazz Tour",
    date: "Nov 05, 2024",
    venue: "Alliance Française, Accra",
    status: "Approved",
    match: "88%",
    statusColor: "bg-emerald-100 text-emerald-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChcgGr3TxcalMqo-ST9P_5n6LSpGtfJBeYjeV6cwaO3YOiCIRC_d4ZzBh6XXIrm8aGwv1WrsmGB_FxmCHR4DmY2KNGCqFEGvknXa2_flGCNI3ffIOzvu4Y8RsbhuKGsMdWnnTIsnTQ18p_-tjjoyo4xrUUZrpxvZ8zlZiuoj3weN_cksOhyZEaS91LGVmDkUpbbo2llxzZqjl4F_xdHt2UifuyjJSbHxlS0REFGjXQfqUaYuSHKADz4FSFKIvh86nDNPszIFc8M9Q",
    imgAlt: "Aria Velvet performing in a moody jazz club",
  },
  {
    name: "Frequency Shift",
    tour: "Summer Festival Circuit",
    date: "Sept 28, 2024",
    venue: "Freedom Park, Lagos",
    status: "Needs Revision",
    match: "72%",
    statusColor: "bg-blue-100 text-blue-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCnldp3BG6jom6onZ4uSYCHhl--8JBW5XcS-VCbc-sMvwvvAaTxVwpeC9NrTpmY3I6_8dcvGDyBe79a5pTIB9O3YiQga_eX5EqROA-dJSUFeRbvt237xMDe76R02FlY2ljDwMLhrvERqJCbLcjEnU92TbO4F0SJnIi5io9q3rajJGWToSyXfSSbMr7ACs9nnNkuG21_NwmRIJenXWpmYekIivGjPsS8IQBzlxtVoDNeusZmXne_1ecDKpxuF515DGIeO7lLpSQ8zk",
    imgAlt: "Frequency Shift DJ performing at a large festival",
  },
  {
    name: "The Northern Sights",
    tour: "West Africa Run",
    date: "Dec 15, 2024",
    venue: "BCEAO Auditorium, Dakar",
    status: "Rejected",
    match: "51%",
    statusColor: "bg-red-100 text-red-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3UtHlE5dJV7XteJoq5By5XTYhbsoyKN3yng520PsHnxCTioeqHv1G1_GpMrFrYyTKaXgDQIR01QJP3NWEmhZo-vydbiQ6bBKrmT-7UBPuV8ofSK8ypqecDVRbgr2-jLES9Q5DHWVCwWsOIv53EOO0TL6bAcUF154LedAW4wlBaUvIxS3tLjNRiE6OnUqtZ7Q489ovLCWs4l0bUjpEzJ4Fgh_O8vPc3ODyXBcjNlhe94SLF__u2miZVaonIXZBJxN5rW2S33i1kw",
    imgAlt: "The Northern Sights band in a rustic studio setting",
  },
];

const tourSteps = [
  { n: "01", label: "EOI Submitted", done: true },
  { n: "02", label: "Under Review", done: true },
  { n: "03", label: "Match Score", done: false },
  { n: "04", label: "Decision", done: false },
  { n: "05", label: "Confirmed", done: false },
];

export default function DashboardPage() {
  return (
    <div className="bg-surface text-on-surface">
      <TopNav showSearch />

      <div className="flex pt-16 h-screen">
        <SideNav />

        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
                Promoter Portal
              </span>
              <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
                Your Tour Dashboard
              </h1>
              <p className="text-on-surface-variant font-medium">
                Welcome back, Stage One Productions. Track your EOIs and tour
                process below.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-tertiary-container ml-2">
                calendar_month
              </span>
              <span className="font-(family-name:--font-manrope) font-bold text-sm pr-4">
                Touring Season: 2024 / 2025
              </span>
            </div>
          </div>

          {/* Tour Progress Tracker */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-(family-name:--font-manrope) font-bold text-base">
                EOI Progress — Vanguard Echo (Pan-African Tour 2024)
              </h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black uppercase tracking-tighter">
                Under Review
              </span>
            </div>
            <div className="flex items-center justify-between relative mt-6">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-surface-variant z-0" />
              <div className="absolute top-5 left-0 w-2/5 h-0.5 bg-[#FF5A30] z-0 transition-all duration-500" />
              {tourSteps.map((s) => (
                <div key={s.n} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-surface-container-lowest transition-all ${
                      s.done
                        ? "bg-[#FF5A30] text-white"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {s.done ? (
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    ) : (
                      s.n
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center max-w-16 leading-tight text-on-surface-variant">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-[#FF5A30]">
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                EOIs Submitted
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  4
                </span>
                <span className="text-[#FF5A30] font-bold flex items-center text-sm">
                  +2 this month
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-secondary">
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                Approved
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  1
                </span>
                <span className="text-emerald-600 font-bold text-sm">Confirmed</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-tertiary-container">
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                Financing Status
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  $75K
                </span>
                <span className="text-tertiary-container font-bold text-sm">Pending</span>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#FF5A30] p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <span
                  className="material-symbols-outlined text-8xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  electric_bolt
                </span>
              </div>
              <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4 z-10">
                Next Show
              </p>
              <div className="z-10">
                <span className="block text-xl font-(family-name:--font-manrope) font-extrabold text-white leading-tight">
                  Aria Velvet @ Accra
                </span>
                <span className="text-orange-50 font-medium text-sm">Nov 5, 2024</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* EOI Requests Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-(family-name:--font-manrope) font-bold text-on-surface">
                  My EOI Submissions
                </h2>
                <Link
                  href="/eoi"
                  className="text-sm font-bold text-[#FF5A30] flex items-center gap-1 hover:underline"
                >
                  New EOI{" "}
                  <span className="material-symbols-outlined text-sm">add</span>
                </Link>
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Artiste / Tour
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">
                        Venue
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                        Match
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {requests.map((req) => (
                      <tr
                        key={req.name}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 relative">
                              <Image
                                src={req.img}
                                alt={req.imgAlt}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <span className="block font-(family-name:--font-manrope) font-bold text-on-surface text-sm">
                                {req.name}
                              </span>
                              <span className="block text-xs text-on-surface-variant">
                                {req.tour}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant font-medium hidden md:table-cell">
                          {req.venue}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${req.statusColor}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="font-(family-name:--font-manrope) font-extrabold text-[#FF5A30]">
                            {req.match}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Widgets */}
            <div className="space-y-8">
              {/* Financing Widget */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-(family-name:--font-manrope) font-bold text-lg">
                    Financing Status
                  </h3>
                  <span className="material-symbols-outlined text-[#FF5A30]">account_balance</span>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-on-surface-variant font-medium">EOI Financing Gap</span>
                      <span className="font-bold text-[#FF5A30]">Pending</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-[#FF5A30] h-full rounded-full" style={{ width: "35%" }} />
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      35% of requested financing assessed
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-low rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Requested</p>
                      <p className="text-xl font-(family-name:--font-manrope) font-extrabold text-on-surface">$75K</p>
                    </div>
                    <div className="p-4 bg-surface-container-low rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Status</p>
                      <p className="text-xl font-(family-name:--font-manrope) font-extrabold text-tertiary-container">Pending</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-3 bg-orange-50 text-[#FF5A30] font-(family-name:--font-manrope) font-bold text-sm rounded-lg hover:brightness-95 transition-all"
                  >
                    View Financing Details
                  </button>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-6">
                  Tour Activity
                </h3>
                <div className="space-y-6 relative before:absolute before:left-2.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                  <div className="relative flex gap-4 pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-surface-container-lowest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        EOI Approved — Aria Velvet
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        2 hours ago • Accra, Ghana
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center border-4 border-surface-container-lowest">
                      <div className="w-2 h-2 rounded-full bg-[#FF5A30]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        Revision Requested
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Yesterday • Frequency Shift — budget too low
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center border-4 border-surface-container-lowest">
                      <div className="w-2 h-2 rounded-full bg-tertiary-container" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        EOI Submitted — Vanguard Echo
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        3 days ago • Pending review
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick CTA */}
              <Link
                href="/eoi"
                className="flex items-center gap-4 bg-[#FF5A30] text-white p-5 rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
              >
                <span className="material-symbols-outlined text-2xl">send</span>
                <div>
                  <p className="font-(family-name:--font-manrope) font-bold">Submit New EOI</p>
                  <p className="text-xs text-orange-100 mt-0.5">
                    Browse artistes &amp; apply for a Tour Stop
                  </p>
                </div>
                <span className="material-symbols-outlined ml-auto">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
