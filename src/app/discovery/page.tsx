"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import TopNav from "@/components/TopNav";

const artists = [
  {
    name: "Vanguard Echo",
    genre: "Electronic / Pop",
    tour: "Pan-African Tour 2024",
    dates: "Aug 15 — Oct 20, 2024",
    fee: "$25k — $45k per show",
    feeMin: 25000,
    feeMax: 45000,
    markets: "Lagos · Accra · Nairobi",
    region: "West Africa",
    window: "Q3 2024 (Jul–Sep)",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfoWQg4uRMI07wclIZKzfGjklZJ5PCMeHLOvgkYvHDWb80Z4WKS1F9Buuug2V2ODx8uWqGJBVjglrIJLCv5sktEvpq1iamNwmJbI9LT0aRTDK0AviKTmqrYnP9eUyqzHNEYlqEaWrY4i_buCOgnACH2Oqid1eqtvmfJAbMQgDRIwWGNfnXdMTLIzUpiVA-C47r4xin031Nv0lDXyD8E-nnf2g4EPkpw5up_vkzL8nPAm0irl1WFqBELnFf6ocju3IcVUEzbS21wrk",
    imgAlt: "A charismatic singer performing under dramatic purple neon lights",
  },
  {
    name: "The Northern Sights",
    genre: "Indie Rock",
    tour: "West Africa Run",
    dates: "Sep 01 — Nov 12, 2024",
    fee: "$12k — $20k per show",
    feeMin: 12000,
    feeMax: 20000,
    markets: "Dakar · Abidjan · Lomé",
    region: "West Africa",
    window: "Q3 2024 (Jul–Sep)",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3UtHlE5dJV7XteJoq5By5XTYhbsoyKN3yng520PsHnxCTioeqHv1G1_GpMrFrYyTKaXgDQIR01QJP3NWEmhZo-vydbiQ6bBKrmT-7UBPuV8ofSK8ypqecDVRbgr2-jLES9Q5DHWVCwWsOIv53EOO0TL6bAcUF154LedAW4wlBaUvIxS3tLjNRiE6OnUqtZ7Q489ovLCWs4l0bUjpEzJ4Fgh_O8vPc3ODyXBcjNlhe94SLF__u2miZVaonIXZBJxN5rW2S33i1kw",
    imgAlt: "Three band members in a rustic studio with warm natural lighting",
  },
  {
    name: "Aria Velvet",
    genre: "Neo-Soul / Jazz",
    tour: "Continental Jazz Tour",
    dates: "Oct 10 — Dec 22, 2024",
    fee: "$8k — $15k per show",
    feeMin: 8000,
    feeMax: 15000,
    markets: "Accra · Cape Town · Kampala",
    region: "East Africa",
    window: "Q4 2024 (Oct–Dec)",
    trending: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChcgGr3TxcalMqo-ST9P_5n6LSpGtfJBeYjeV6cwaO3YOiCIRC_d4ZzBh6XXIrm8aGwv1WrsmGB_FxmCHR4DmY2KNGCqFEGvknXa2_flGCNI3ffIOzvu4Y8RsbhuKGsMdWnnTIsnTQ18p_-tjjoyo4xrUUZrpxvZ8zlZiuoj3weN_cksOhyZEaS91LGVmDkUpbbo2llxzZqjl4F_xdHt2UifuyjJSbHxlS0REFGjXQfqUaYuSHKADz4FSFKIvh86nDNPszIFc8M9Q",
    imgAlt: "Soulful jazz singer with eyes closed holding a silver microphone in a moody jazz club",
  },
  {
    name: "Frequency Shift",
    genre: "Tech-House",
    tour: "Summer Festival Circuit",
    dates: "Jun 10 — Aug 30, 2024",
    fee: "$40k — $75k per show",
    feeMin: 40000,
    feeMax: 75000,
    markets: "Lagos · Johannesburg · Cairo",
    region: "Southern Africa",
    window: "Q3 2024 (Jul–Sep)",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCnldp3BG6jom6onZ4uSYCHhl--8JBW5XcS-VCbc-sMvwvvAaTxVwpeC9NrTpmY3I6_8dcvGDyBe79a5pTIB9O3YiQga_eX5EqROA-dJSUFeRbvt237xMDe76R02FlY2ljDwMLhrvERqJCbLcjEnU92TbO4F0SJnIi5io9q3rajJGWToSyXfSSbMr7ACs9nnNkuG21_NwmRIJenXWpmYekIivGjPsS8IQBzlxtVoDNeusZmXne_1ecDKpxuF515DGIeO7lLpSQ8zk",
    imgAlt: "DJ silhouette at a large festival stage with electric blue and pink light beams",
  },
  {
    name: "Solana Roots",
    genre: "World / Folk",
    tour: "Roots & Routes Tour",
    dates: "May 20 — Jul 15, 2025",
    fee: "$5k — $12k per show",
    feeMin: 5000,
    feeMax: 12000,
    markets: "Nairobi · Dar es Salaam · Kigali",
    region: "East Africa",
    window: "Q2 2025 (Apr–Jun)",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOKK9ZDZyfZbTtwqMpotZlzGetgF5IEsCXPyaRP8gEQujN--te0UgKnrlU50GI-czkXB5Z0hDdjPyLr3-rk_MzGpppsPanIhvqGwQHdGBjI5yBwW19-X_cmEEd0lmIkc7EU8JRkCchrFAEg6pXbEEpMFGdeAagT9FKBpBdhkfZMnIRRk5ieaZydh9swygY1kHU5PGtl5zsyBwb1TvSYjxfN8dKDuHqp5k98c11_fAT4Bmso8umqUhJr2oRauLjyJXHI6mb03kbBIM",
    imgAlt: "Street musician playing an exotic acoustic guitar in a Mediterranean plaza at sunset",
  },
  {
    name: "Eleanor Thorne",
    genre: "Modern Classical",
    tour: "Africa Classical Series",
    dates: "Jan 05 — Mar 20, 2025",
    fee: "$15k — $30k per show",
    feeMin: 15000,
    feeMax: 30000,
    markets: "Cairo · Tunis · Casablanca",
    region: "North Africa",
    window: "Q1 2025 (Jan–Mar)",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi18PBvAxxUOmxemsDq1Ny-SnwOe0mfNjah4nyXtrDCSapRC1vwX0zbXsJyWxMS1F5bRG75CUQ8Sb-MLOa5EykUjElNDyYxIP21vAVdb96BwNOU-Y03Hyq8Xg4XCIE--HUKhLT09hsZ9CuM06l0HAPMh3FkgoP31ODkk9YE9LDs7TXuA3nzcJlmJ_ad24-i-_4wlMnAkfgm2WfRBvu-9wZcbViA4JEKvAZP4XutgUDafIiE4Bg1STgDrk7VLDme5VMMNCiEOn-k6U",
    imgAlt: "Grand symphonic orchestra hall with a center spotlight on a grand piano",
  },
];

const FEE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "$5k – $15k", min: 5000, max: 15000 },
  { label: "$15k – $50k", min: 15000, max: 50000 },
  { label: "$50k – $150k", min: 50000, max: 150000 },
  { label: "$150k+", min: 150000, max: Infinity },
];

export default function DiscoveryPage() {
  const [genre, setGenre] = useState("All Genres");
  const [window, setWindow] = useState("All Windows");
  const [feeRange, setFeeRange] = useState("All Ranges");
  const [region, setRegion] = useState("All Africa");

  const filtered = artists.filter((a) => {
    if (genre !== "All Genres" && !a.genre.toLowerCase().includes(genre.toLowerCase().split(" ")[0])) {
      // Map select options to genre data
      const genreMap: Record<string, string[]> = {
        "Afrobeats": ["afrobeats", "afro"],
        "Electronic": ["electronic", "tech-house"],
        "Indie Rock": ["indie rock"],
        "Jazz & Soul": ["jazz", "soul", "neo-soul"],
        "World / Folk": ["world", "folk"],
        "Modern Classical": ["classical"],
      };
      const keys = genreMap[genre] ?? [];
      if (!keys.some((k) => a.genre.toLowerCase().includes(k))) return false;
    }
    if (window !== "All Windows" && a.window !== window) return false;
    if (feeRange !== "All Ranges") {
      const range = FEE_RANGES.find((r) => r.label === feeRange);
      if (range && !(a.feeMin <= range.max && a.feeMax >= range.min)) return false;
    }
    if (region !== "All Africa" && a.region !== region) return false;
    return true;
  });

  return (
    <div className="bg-surface text-on-surface antialiased">
      <TopNav />

      <main className="pt-24 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto flex flex-col gap-12">
        {/* Hero Header */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
              TourStack — Artiste &amp; Tour Discovery
            </span>
            <h1 className="font-(family-name:--font-manrope) text-5xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tighter">
              Find Your Next{" "}
              <span className="text-[#FF5A30]">Tour Stop.</span>
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Browse artistes announced by Ckrowd Global Live for the
              Pan-African touring circuit. Submit an Expression of Interest to
              host a Tour Stop at your venue.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end pb-2">
            <div className="bg-tertiary-fixed p-6 rounded-xl flex items-start gap-4 shadow-sm max-w-sm">
              <span
                className="material-symbols-outlined text-tertiary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bolt
              </span>
              <div>
                <p className="font-(family-name:--font-manrope) font-bold text-on-tertiary-fixed leading-tight">
                  Trending Now
                </p>
                <p className="text-on-tertiary-fixed-variant text-sm mt-1 leading-relaxed">
                  Neo-Soul &amp; Jazz acts seeing a 40% EOI surge for Q4 across
                  East &amp; West Africa.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="bg-surface-container-low rounded-2xl p-4 md:p-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-45">
            <label htmlFor="filter-genre" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Genre
            </label>
            <div className="relative">
              <select
                id="filter-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
              >
                <option>All Genres</option>
                <option>Afrobeats</option>
                <option>Electronic</option>
                <option>Indie Rock</option>
                <option>Jazz &amp; Soul</option>
                <option>World / Folk</option>
                <option>Modern Classical</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-45">
            <label htmlFor="filter-window" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Available Window
            </label>
            <div className="relative">
              <select
                id="filter-window"
                value={window}
                onChange={(e) => setWindow(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
              >
                <option>All Windows</option>
                <option>Q3 2024 (Jul–Sep)</option>
                <option>Q4 2024 (Oct–Dec)</option>
                <option>Q1 2025 (Jan–Mar)</option>
                <option>Q2 2025 (Apr–Jun)</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                calendar_today
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-45">
            <label htmlFor="filter-fee" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Fee Range (USD)
            </label>
            <div className="relative">
              <select
                id="filter-fee"
                value={feeRange}
                onChange={(e) => setFeeRange(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
              >
                <option>All Ranges</option>
                <option>$5k – $15k</option>
                <option>$15k – $50k</option>
                <option>$50k – $150k</option>
                <option>$150k+</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                payments
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-45">
            <label htmlFor="filter-region" className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Region
            </label>
            <div className="relative">
              <select
                id="filter-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
              >
                <option>All Africa</option>
                <option>West Africa</option>
                <option>East Africa</option>
                <option>Southern Africa</option>
                <option>North Africa</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                public
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setGenre("All Genres"); setWindow("All Windows"); setFeeRange("All Ranges"); setRegion("All Africa"); }}
            className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#FF5A30]/20 self-end"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            Reset Filters
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
                Active Tour Projects{" "}
                <span className="text-on-surface-variant font-normal text-lg">({filtered.length})</span>
              </h2>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                <span>Sort by:</span>
                <button
                  type="button"
                  className="text-[#FF5A30] font-bold flex items-center gap-1"
                >
                  Newest First{" "}
                  <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                <p className="font-bold text-lg">No results match your filters</p>
                <p className="text-sm mt-1">Try adjusting or resetting the filters above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((artist) => (
                  <div
                    key={artist.name}
                    className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-outline-variant/20"
                  >
                    <div className="h-56 relative overflow-hidden">
                      <Image
                        src={artist.img}
                        alt={artist.imgAlt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#FF5A30] uppercase tracking-tighter shadow-sm">
                          {artist.genre}
                        </span>
                      </div>
                      {artist.trending && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            Trending
                          </span>
                        </div>
                      )}
                      {/* Tour name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
                        <span className="text-white text-xs font-bold uppercase tracking-wider opacity-90">
                          {artist.tour}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-(family-name:--font-manrope) text-xl font-extrabold group-hover:text-[#FF5A30] transition-colors">
                        {artist.name}
                      </h3>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">event</span>
                          <span className="text-sm font-medium">{artist.dates}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">monetization_on</span>
                          <span className="text-sm font-medium">{artist.fee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-base">location_on</span>
                          <span className="text-sm font-medium">{artist.markets}</span>
                        </div>
                      </div>
                      <div className="mt-5">
                        <Link
                          href="/eoi"
                          className="block w-full bg-[#FF5A30] py-3 rounded-xl text-white font-bold text-sm tracking-wide shadow-md shadow-[#FF5A30]/10 active:scale-[0.98] transition-all text-center"
                        >
                          Submit Expression of Interest
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            {/* How it Works */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <h3 className="font-(family-name:--font-manrope) text-xl font-bold mb-6">
                How It Works
              </h3>
              <div className="space-y-7">
                {[
                  {
                    step: "01",
                    title: "Browse Tour Projects",
                    desc: "Ckrowd announces artistes and tours. Browse and filter by genre, date, fee, or region.",
                  },
                  {
                    step: "02",
                    title: "Submit Your EOI",
                    desc: "Submit a formal Expression of Interest with your venue, date, budget, and funding plan.",
                  },
                  {
                    step: "03",
                    title: "Matching & Review",
                    desc: "Ckrowd scores your EOI against artiste requirements and reviews your application.",
                  },
                  {
                    step: "04",
                    title: "Decision & Execution",
                    desc: "You receive Approved, Rejected, or Needs Revision — then proceed to planning.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[#FF5A30] font-black text-xs">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">{item.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href="/eoi"
                  className="w-full text-[#FF5A30] font-bold text-sm flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed/30 rounded-lg transition-colors"
                >
                  Start Your EOI{" "}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Financing Banner */}
            <div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-(family-name:--font-manrope) text-xl font-bold leading-tight">
                  Financing Support Available
                </h4>
                <p className="text-white/90 text-sm mt-3 leading-relaxed">
                  Get up to 40% of the artiste fee covered upfront through
                  TourStack&apos;s capital partners.
                </p>
                <Link
                  href="/eoi"
                  className="mt-6 inline-block bg-white text-[#FF5A30] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
                >
                  Apply with EOI
                </Link>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] rotate-12 group-hover:scale-110 transition-transform duration-500">
                account_balance_wallet
              </span>
            </div>

            {/* Platform Stats */}
            <div className="bg-surface-container-high rounded-2xl p-8">
              <h3 className="font-(family-name:--font-manrope) font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">
                Platform Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "24", label: "Markets" },
                  { value: "500+", label: "Promoters" },
                  { value: `${filtered.length}`, label: "Active Tours" },
                  { value: "48h", label: "Avg Review" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-surface-container-lowest p-4 rounded-xl text-center border border-[#FF5A30]/5"
                  >
                    <p className="text-2xl font-black font-(family-name:--font-manrope) text-[#FF5A30]">
                      {stat.value}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
