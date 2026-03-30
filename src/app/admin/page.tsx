import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

const eois = [
  {
    id: "EOI-001",
    promoter: "Stage One Productions",
    city: "Lagos, Nigeria",
    artiste: "Vanguard Echo",
    tour: "Pan-African Tour 2024",
    date: "Oct 12, 2024",
    venue: "Eko Convention Centre",
    capacity: "5,000",
    budget: "$35,000",
    funding: "Financing Needed",
    match: 94,
    status: "Pending Review",
    statusColor: "bg-yellow-100 text-yellow-800",
    flag: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUQQfNDdTgx68ldF99DVk88ykm02ZF5hAFM9Zp82hdkUolvQLjrvMjkwy3ijXu8TDXa5Sp5VEzI3eyaiGNBH-nBotRABfdgcDWY9ue5W2CA6uu6mMwK4jrvpAqvdeuxmIwy2GiKO3iWpDPvrN1DbN1QlBm4ubkjCtTVK8H8Ln463Z9KUsx8Vs3V1lJKEea1fROpcoTQizKU0IncXZQgo--0vp60vC0bSlp-68cVcc6epdqA3NCOVFBScwx-P_JUIBCl-TTJRdGAVg",
    imgAlt: "Vanguard Echo performing on stage",
  },
  {
    id: "EOI-002",
    promoter: "Gold Coast Events",
    city: "Accra, Ghana",
    artiste: "Aria Velvet",
    tour: "Continental Jazz Tour",
    date: "Nov 05, 2024",
    venue: "Alliance Française",
    capacity: "800",
    budget: "$12,000",
    funding: "Self-funded",
    match: 88,
    status: "Approved",
    statusColor: "bg-emerald-100 text-emerald-800",
    flag: null,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChcgGr3TxcalMqo-ST9P_5n6LSpGtfJBeYjeV6cwaO3YOiCIRC_d4ZzBh6XXIrm8aGwv1WrsmGB_FxmCHR4DmY2KNGCqFEGvknXa2_flGCNI3ffIOzvu4Y8RsbhuKGsMdWnnTIsnTQ18p_-tjjoyo4xrUUZrpxvZ8zlZiuoj3weN_cksOhyZEaS91LGVmDkUpbbo2llxzZqjl4F_xdHt2UifuyjJSbHxlS0REFGjXQfqUaYuSHKADz4FSFKIvh86nDNPszIFc8M9Q",
    imgAlt: "Aria Velvet performing in a jazz club",
  },
  {
    id: "EOI-003",
    promoter: "Pulse Nairobi",
    city: "Nairobi, Kenya",
    artiste: "Frequency Shift",
    tour: "Summer Festival Circuit",
    date: "Sept 28, 2024",
    venue: "Carnivore Grounds",
    capacity: "10,000",
    budget: "$28,000",
    funding: "Sponsorship Lead",
    match: 62,
    status: "Needs Revision",
    statusColor: "bg-blue-100 text-blue-800",
    flag: "Budget below artiste minimum ($40k)",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCnldp3BG6jom6onZ4uSYCHhl--8JBW5XcS-VCbc-sMvwvvAaTxVwpeC9NrTpmY3I6_8dcvGDyBe79a5pTIB9O3YiQga_eX5EqROA-dJSUFeRbvt237xMDe76R02FlY2ljDwMLhrvERqJCbLcjEnU92TbO4F0SJnIi5io9q3rajJGWToSyXfSSbMr7ACs9nnNkuG21_NwmRIJenXWpmYekIivGjPsS8IQBzlxtVoDNeusZmXne_1ecDKpxuF515DGIeO7lLpSQ8zk",
    imgAlt: "Frequency Shift DJ at a festival",
  },
  {
    id: "EOI-004",
    promoter: "Teranga Concerts",
    city: "Dakar, Senegal",
    artiste: "The Northern Sights",
    tour: "West Africa Run",
    date: "Dec 15, 2024",
    venue: "BCEAO Auditorium",
    capacity: "1,200",
    budget: "$14,000",
    funding: "Self-funded",
    match: 51,
    status: "Rejected",
    statusColor: "bg-red-100 text-red-800",
    flag: "Date conflict with confirmed stop",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3UtHlE5dJV7XteJoq5By5XTYhbsoyKN3yng520PsHnxCTioeqHv1G1_GpMrFrYyTKaXgDQIR01QJP3NWEmhZo-vydbiQ6bBKrmT-7UBPuV8ofSK8ypqecDVRbgr2-jLES9Q5DHWVCwWsOIv53EOO0TL6bAcUF154LedAW4wlBaUvIxS3tLjNRiE6OnUqtZ7Q489ovLCWs4l0bUjpEzJ4Fgh_O8vPc3ODyXBcjNlhe94SLF__u2miZVaonIXZBJxN5rW2S33i1kw",
    imgAlt: "The Northern Sights band in a studio",
  },
];

const tourProjects = [
  { name: "Vanguard Echo — Pan-African Tour", eois: 14, approved: 4, status: "Active" },
  { name: "Aria Velvet — Continental Jazz Tour", eois: 9, approved: 3, status: "Active" },
  { name: "Frequency Shift — Summer Festival Circuit", eois: 21, approved: 6, status: "Active" },
  { name: "Solana Roots — Roots & Routes Tour", eois: 5, approved: 1, status: "Draft" },
];

function MatchBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-black text-on-surface w-8 text-right">{score}%</span>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="bg-surface-container-low min-h-screen text-on-surface">
      {/* Admin Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-slate-900 text-white shadow-xl">
        <div className="flex justify-between items-center h-14 px-6 md:px-12">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF5A30] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">confirmation_number</span>
              </div>
              <span className="font-(family-name:--font-manrope) font-black text-white tracking-tight">
                TourStack
              </span>
            </Link>
            <span className="px-2 py-0.5 bg-[#FF5A30]/20 text-[#FF5A30] rounded text-[10px] font-black uppercase tracking-widest">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <span className="material-symbols-outlined text-slate-300">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#FF5A30] flex items-center justify-center text-white text-xs font-bold">
              CK
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Admin Sidebar */}
        <aside className="hidden lg:flex flex-col py-6 h-[calc(100vh-3.5rem)] w-56 bg-slate-900 text-white shrink-0 sticky top-14 overflow-y-auto">
          <nav className="flex-1 space-y-1 px-3">
            {[
              { icon: "dashboard", label: "Overview", active: true },
              { icon: "confirmation_number", label: "Tour Projects", active: false },
              { icon: "send", label: "EOI Reviews", active: false },
              { icon: "account_balance", label: "Financing", active: false },
              { icon: "bar_chart", label: "Reports", active: false },
              { icon: "settings", label: "Settings", active: false },
            ].map((item) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-(family-name:--font-manrope) font-semibold transition-all ${
                  item.active
                    ? "bg-[#FF5A30] text-white"
                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="px-3 mt-auto">
            <button
              type="button"
              className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Tour Project
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
                Ckrowd Global Live
              </span>
              <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
                Admin Dashboard
              </h1>
              <p className="text-on-surface-variant font-medium">
                Manage tour projects, review promoter EOIs, and drive decisions
                across the Pan-African touring circuit.
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-6 py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined">add</span>
              Create Tour Project
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { label: "Active Tour Projects", value: "6", icon: "confirmation_number", accent: "border-[#FF5A30]" },
              { label: "EOIs Received", value: "49", icon: "send", accent: "border-secondary" },
              { label: "Pending Review", value: "18", icon: "pending", accent: "border-yellow-400" },
              { label: "Approved Stops", value: "14", icon: "task_alt", accent: "border-emerald-500" },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-3 border-l-4 ${s.accent}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {s.label}
                  </p>
                  <span className="material-symbols-outlined text-on-surface-variant text-base">
                    {s.icon}
                  </span>
                </div>
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* EOI Review Table */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-(family-name:--font-manrope) font-bold">
                  EOI Review Queue
                </h2>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-black">
                  18 Pending
                </span>
              </div>

              <div className="space-y-4">
                {eois.map((eoi) => (
                  <div
                    key={eoi.id}
                    className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow"
                  >
                    {/* Row top */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                        <Image
                          src={eoi.img}
                          alt={eoi.imgAlt}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-black text-[#FF5A30] uppercase tracking-widest">
                            {eoi.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${eoi.statusColor}`}
                          >
                            {eoi.status}
                          </span>
                        </div>
                        <h3 className="font-(family-name:--font-manrope) font-bold text-on-surface">
                          {eoi.artiste}
                          <span className="text-on-surface-variant font-normal text-sm ml-1">
                            — {eoi.tour}
                          </span>
                        </h3>
                        <p className="text-sm text-on-surface-variant mt-0.5">
                          <span className="font-semibold text-on-surface">{eoi.promoter}</span>
                          {" · "}{eoi.city}
                        </p>
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: "event", label: "Date", value: eoi.date },
                        { icon: "location_on", label: "Venue", value: eoi.venue },
                        { icon: "groups", label: "Capacity", value: eoi.capacity },
                        { icon: "payments", label: "Budget", value: eoi.budget },
                      ].map((d) => (
                        <div key={d.label} className="bg-surface-container-low rounded-lg p-3">
                          <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                            <span className="material-symbols-outlined text-xs">{d.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{d.label}</span>
                          </div>
                          <p className="text-sm font-bold text-on-surface">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Match score + flag */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-on-surface-variant w-20 shrink-0">
                          Match Score
                        </span>
                        <div className="flex-1">
                          <MatchBar score={eoi.match} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-xs">account_balance</span>
                        <span>Funding: <span className="font-semibold text-on-surface">{eoi.funding}</span></span>
                      </div>
                      {eoi.flag && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg text-xs text-red-700 font-semibold">
                          <span className="material-symbols-outlined text-xs text-red-500">flag</span>
                          {eoi.flag}
                        </div>
                      )}
                    </div>

                    {/* Decision Actions */}
                    <div className="mt-5 flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                      <button
                        type="button"
                        className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Approve
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        Needs Revision
                      </button>
                      <button
                        type="button"
                        className="flex-1 py-2.5 bg-red-50 text-red-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Create Tour Project */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-[#FF5A30]">add_circle</span>
                  <h3 className="font-(family-name:--font-manrope) font-bold text-lg">
                    New Tour Project
                  </h3>
                </div>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="admin-artiste" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                      Artiste Name
                    </label>
                    <input
                      id="admin-artiste"
                      type="text"
                      placeholder="e.g. Burna Boy"
                      className="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="admin-tour-name" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                      Tour Name
                    </label>
                    <input
                      id="admin-tour-name"
                      type="text"
                      placeholder="e.g. Twice As Tall World Tour"
                      className="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="admin-fee-min" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                        Min Fee (USD)
                      </label>
                      <input
                        id="admin-fee-min"
                        type="text"
                        placeholder="50,000"
                        className="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-fee-max" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                        Max Fee (USD)
                      </label>
                      <input
                        id="admin-fee-max"
                        type="text"
                        placeholder="150,000"
                        className="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="admin-date-from" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                        Available From
                      </label>
                      <input
                        id="admin-date-from"
                        type="date"
                        className="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-date-to" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                        Available To
                      </label>
                      <input
                        id="admin-date-to"
                        type="date"
                        className="w-full px-3 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="admin-genre" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                      Genre
                    </label>
                    <div className="relative">
                      <select
                        id="admin-genre"
                        className="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none appearance-none"
                      >
                        <option>Afrobeats</option>
                        <option>Afropop</option>
                        <option>Electronic</option>
                        <option>Jazz &amp; Soul</option>
                        <option>World / Folk</option>
                        <option>Hip-Hop</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="admin-requirements" className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                      Technical Requirements
                    </label>
                    <textarea
                      id="admin-requirements"
                      rows={3}
                      placeholder="Stage size, hospitality, tech rider notes..."
                      className="w-full px-4 py-2.5 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5A30]/20"
                  >
                    Publish Tour Project
                  </button>
                </form>
              </div>

              {/* Tour Projects Summary */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-5">
                  Active Tour Projects
                </h3>
                <div className="space-y-4">
                  {tourProjects.map((t) => (
                    <div key={t.name} className="flex items-center justify-between gap-4 py-3 border-b border-outline-variant/10 last:border-none">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{t.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {t.eois} EOIs · {t.approved} approved
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          t.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financing Tracker */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-(family-name:--font-manrope) font-bold text-lg">Financing Tracker</h3>
                  <span className="material-symbols-outlined text-[#FF5A30]">account_balance</span>
                </div>
                <div className="space-y-4">
                  {[
                    { promoter: "Stage One Productions", amount: "$75K", status: "Pending", color: "text-yellow-600 bg-yellow-50" },
                    { promoter: "Pulse Nairobi", amount: "$40K", status: "Approved", color: "text-emerald-700 bg-emerald-50" },
                    { promoter: "Teranga Concerts", amount: "$20K", status: "Declined", color: "text-red-700 bg-red-50" },
                  ].map((f) => (
                    <div key={f.promoter} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-on-surface">{f.promoter}</p>
                        <p className="text-xs text-on-surface-variant">{f.amount} requested</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${f.color}`}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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
