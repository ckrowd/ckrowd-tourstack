import Image from "next/image";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";

const tours = [
  {
    id: "t1",
    artiste: "Aria Velvet",
    genre: "Neo-Soul / Jazz",
    tour: "Continental Jazz Tour",
    venue: "Alliance Française, Accra",
    city: "Accra, Ghana",
    date: "Nov 5, 2024",
    capacity: 1200,
    ticketsSold: 1050,
    fee: "$12,000",
    status: "Confirmed",
    statusColor: "bg-emerald-100 text-emerald-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChcgGr3TxcalMqo-ST9P_5n6LSpGtfJBeYjeV6cwaO3YOiCIRC_d4ZzBh6XXIrm8aGwv1WrsmGB_FxmCHR4DmY2KNGCqFEGvknXa2_flGCNI3ffIOzvu4Y8RsbhuKGsMdWnnTIsnTQ18p_-tjjoyo4xrUUZrpxvZ8zlZiuoj3weN_cksOhyZEaS91LGVmDkUpbbo2llxzZqjl4F_xdHt2UifuyjJSbHxlS0REFGjXQfqUaYuSHKADz4FSFKIvh86nDNPszIFc8M9Q",
    imgAlt: "Aria Velvet performing in a moody jazz club",
    daysAway: 32,
    financing: true,
    financingAmount: "$5,000",
  },
  {
    id: "t2",
    artiste: "Vanguard Echo",
    genre: "Electronic / Pop",
    tour: "Pan-African Tour 2024",
    venue: "Eko Convention Centre, Lagos",
    city: "Lagos, Nigeria",
    date: "Oct 12, 2024",
    capacity: 3000,
    ticketsSold: 0,
    fee: "$35,000",
    status: "Under Review",
    statusColor: "bg-yellow-100 text-yellow-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUQQfNDdTgx68ldF99DVk88ykm02ZF5hAFM9Zp82hdkUolvQLjrvMjkwy3ijXu8TDXa5Sp5VEzI3eyaiGNBH-nBotRABfdgcDWY9ue5W2CA6uu6mMwK4jrvpAqvdeuxmIwy2GiKO3iWpDPvrN1DbN1QlBm4ubkjCtTVK8H8Ln463Z9KUsx8Vs3V1lJKEea1fROpcoTQizKU0IncXZQgo--0vp60vC0bSlp-68cVcc6epdqA3NCOVFBScwx-P_JUIBCl-TTJRdGAVg",
    imgAlt: "Vanguard Echo performing with blue atmospheric lighting",
    daysAway: 9,
    financing: false,
    financingAmount: null,
  },
  {
    id: "t3",
    artiste: "Frequency Shift",
    genre: "Tech-House",
    tour: "Summer Festival Circuit",
    venue: "Freedom Park, Lagos",
    city: "Lagos, Nigeria",
    date: "Sept 28, 2024",
    capacity: 5000,
    ticketsSold: 0,
    fee: "$55,000",
    status: "Needs Revision",
    statusColor: "bg-blue-100 text-blue-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCnldp3BG6jom6onZ4uSYCHhl--8JBW5XcS-VCbc-sMvwvvAaTxVwpeC9NrTpmY3I6_8dcvGDyBe79a5pTIB9O3YiQga_eX5EqROA-dJSUFeRbvt237xMDe76R02FlY2ljDwMLhrvERqJCbLcjEnU92TbO4F0SJnIi5io9q3rajJGWToSyXfSSbMr7ACs9nnNkuG21_NwmRIJenXWpmYekIivGjPsS8IQBzlxtVoDNeusZmXne_1ecDKpxuF515DGIeO7lLpSQ8zk",
    imgAlt: "DJ silhouette at a large festival with electric light beams",
    daysAway: -5,
    financing: false,
    financingAmount: null,
  },
  {
    id: "t4",
    artiste: "The Northern Sights",
    genre: "Indie Rock",
    tour: "West Africa Run",
    venue: "BCEAO Auditorium, Dakar",
    city: "Dakar, Senegal",
    date: "Dec 15, 2024",
    capacity: 800,
    ticketsSold: 0,
    fee: "$14,000",
    status: "Rejected",
    statusColor: "bg-red-100 text-red-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3UtHlE5dJV7XteJoq5By5XTYhbsoyKN3yng520PsHnxCTioeqHv1G1_GpMrFrYyTKaXgDQIR01QJP3NWEmhZo-vydbiQ6bBKrmT-7UBPuV8ofSK8ypqecDVRbgr2-jLES9Q5DHWVCwWsOIv53EOO0TL6bAcUF154LedAW4wlBaUvIxS3tLjNRiE6OnUqtZ7Q489ovLCWs4l0bUjpEzJ4Fgh_O8vPc3ODyXBcjNlhe94SLF__u2miZVaonIXZBJxN5rW2S33i1kw",
    imgAlt: "Three band members in a rustic studio",
    daysAway: 76,
    financing: false,
    financingAmount: null,
  },
];

const upcomingMilestones = [
  {
    date: "Sept 28",
    label: "Frequency Shift — Production call",
    type: "call",
    icon: "call",
    color: "bg-blue-100 text-blue-600",
  },
  {
    date: "Oct 01",
    label: "Vanguard Echo — Venue contract deadline",
    type: "deadline",
    icon: "gavel",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    date: "Oct 12",
    label: "Vanguard Echo — Show Day",
    type: "show",
    icon: "celebration",
    color: "bg-[#FF5A30]/10 text-[#FF5A30]",
  },
  {
    date: "Nov 05",
    label: "Aria Velvet — Show Day",
    type: "show",
    icon: "celebration",
    color: "bg-[#FF5A30]/10 text-[#FF5A30]",
  },
  {
    date: "Nov 12",
    label: "Aria Velvet — Settlement due",
    type: "payment",
    icon: "payments",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function ToursPage() {
  const confirmed = tours.filter((t) => t.status === "Confirmed");
  const inProgress = tours.filter((t) =>
    ["Under Review", "Needs Revision"].includes(t.status)
  );
  const rejected = tours.filter((t) => t.status === "Rejected");

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
                My Tours
              </h1>
              <p className="text-on-surface-variant font-medium">
                Track every tour stop — from EOI submission to show-day settlement.
              </p>
            </div>
            <Link
              href="/eoi"
              className="flex items-center gap-2 bg-[#FF5A30] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Tour Stop
            </Link>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Total Stops", value: tours.length.toString(), color: "border-[#FF5A30]" },
              { label: "Confirmed", value: confirmed.length.toString(), color: "border-emerald-400" },
              { label: "In Progress", value: inProgress.length.toString(), color: "border-yellow-400" },
              { label: "Rejected", value: rejected.length.toString(), color: "border-red-400" },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm border-l-4 ${s.color}`}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  {s.label}
                </p>
                <p className="text-3xl font-black font-(family-name:--font-manrope) text-on-surface">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tour Cards */}
            <div className="lg:col-span-8 space-y-5">
              {tours.map((tour) => {
                const soldPct =
                  tour.ticketsSold > 0
                    ? Math.round((tour.ticketsSold / tour.capacity) * 100)
                    : 0;

                return (
                  <div
                    key={tour.id}
                    className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-transparent hover:border-outline-variant/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-36 h-36 relative shrink-0">
                        <Image
                          src={tour.img}
                          alt={tour.imgAlt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/20 to-transparent sm:bg-linear-to-b sm:from-transparent sm:to-black/30" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-(family-name:--font-manrope) font-extrabold text-lg text-on-surface">
                                {tour.artiste}
                              </h3>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                                {tour.genre}
                              </span>
                            </div>
                            <p className="text-sm text-on-surface-variant mt-0.5">
                              {tour.tour}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${tour.statusColor}`}
                          >
                            {tour.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-on-surface-variant">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            {tour.city}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">event</span>
                            {tour.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">monetization_on</span>
                            {tour.fee}
                          </span>
                          {tour.financing && (
                            <span className="flex items-center gap-1.5 text-[#FF5A30] font-semibold">
                              <span className="material-symbols-outlined text-sm">account_balance</span>
                              Financed · {tour.financingAmount}
                            </span>
                          )}
                        </div>

                        {tour.status === "Confirmed" && (
                          <div className="mt-1">
                            <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                              <span>Tickets Sold</span>
                              <span className="font-bold text-on-surface">
                                {tour.ticketsSold.toLocaleString()} / {tour.capacity.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#FF5A30] h-full rounded-full transition-all"
                                style={{ width: `${soldPct}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-1">
                          {tour.daysAway > 0 ? (
                            <span className="text-xs text-on-surface-variant">
                              <span className="font-bold text-on-surface">{tour.daysAway}d</span> until show
                            </span>
                          ) : tour.daysAway < 0 ? (
                            <span className="text-xs text-on-surface-variant">
                              Show passed {Math.abs(tour.daysAway)}d ago
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#FF5A30]">Show day!</span>
                          )}

                          <div className="flex items-center gap-2">
                            {tour.status === "Needs Revision" && (
                              <Link
                                href="/eoi"
                                className="text-xs font-bold text-[#FF5A30] border border-[#FF5A30]/30 px-3 py-1.5 rounded-lg hover:bg-[#FF5A30]/5 transition-colors"
                              >
                                Revise EOI
                              </Link>
                            )}
                            <button
                              type="button"
                              className="text-xs font-bold text-on-surface-variant border border-outline-variant/30 px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar: Milestones */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm">
                <h3 className="font-(family-name:--font-manrope) font-bold text-base mb-6">
                  Upcoming Milestones
                </h3>
                <div className="space-y-4">
                  {upcomingMilestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}
                      >
                        <span
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {m.icon}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-snug">
                          {m.label}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {m.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Venue snapshot */}
              <div className="bg-surface-container-lowest rounded-2xl p-7 shadow-sm">
                <h3 className="font-(family-name:--font-manrope) font-bold text-base mb-5">
                  Venue Summary
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Alliance Française, Accra", cap: "1,200", shows: 1 },
                    { label: "Eko Convention Centre", cap: "3,000", shows: 1 },
                    { label: "Freedom Park, Lagos", cap: "5,000", shows: 1 },
                  ].map((v) => (
                    <div
                      key={v.label}
                      className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0"
                    >
                      <span
                        className="material-symbols-outlined text-[#FF5A30]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        stadium
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {v.label}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Cap: {v.cap} · {v.shows} show
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/financing"
                className="flex items-center gap-4 bg-linear-to-br from-[#FF5A30] to-[#cc4826] text-white p-6 rounded-2xl shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
              >
                <span
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_balance_wallet
                </span>
                <div>
                  <p className="font-(family-name:--font-manrope) font-bold text-sm">
                    Need Financing?
                  </p>
                  <p className="text-xs text-orange-100 mt-0.5">
                    Cover up to 40% of artiste fees upfront
                  </p>
                </div>
                <span className="material-symbols-outlined ml-auto">
                  arrow_forward
                </span>
              </Link>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
