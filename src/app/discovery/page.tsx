import Image from "next/image";
import Link from "next/link";
import TopNav from "@/components/TopNav";

const artists = [
  {
    name: "Vanguard Echo",
    genre: "Electronic / Pop",
    dates: "Aug 15 — Oct 20, 2024",
    fee: "$25k — $45k per show",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfoWQg4uRMI07wclIZKzfGjklZJ5PCMeHLOvgkYvHDWb80Z4WKS1F9Buuug2V2ODx8uWqGJBVjglrIJLCv5sktEvpq1iamNwmJbI9LT0aRTDK0AviKTmqrYnP9eUyqzHNEYlqEaWrY4i_buCOgnACH2Oqid1eqtvmfJAbMQgDRIwWGNfnXdMTLIzUpiVA-C47r4xin031Nv0lDXyD8E-nnf2g4EPkpw5up_vkzL8nPAm0irl1WFqBELnFf6ocju3IcVUEzbS21wrk",
    imgAlt: "A charismatic singer performing under dramatic purple neon lights",
  },
  {
    name: "The Northern Sights",
    genre: "Indie Rock",
    dates: "Sep 01 — Nov 12, 2024",
    fee: "$12k — $20k per show",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd3UtHlE5dJV7XteJoq5By5XTYhbsoyKN3yng520PsHnxCTioeqHv1G1_GpMrFrYyTKaXgDQIR01QJP3NWEmhZo-vydbiQ6bBKrmT-7UBPuV8ofSK8ypqecDVRbgr2-jLES9Q5DHWVCwWsOIv53EOO0TL6bAcUF154LedAW4wlBaUvIxS3tLjNRiE6OnUqtZ7Q489ovLCWs4l0bUjpEzJ4Fgh_O8vPc3ODyXBcjNlhe94SLF__u2miZVaonIXZBJxN5rW2S33i1kw",
    imgAlt: "Three band members sitting on a vintage leather sofa in a rustic studio",
  },
  {
    name: "Aria Velvet",
    genre: "Neo-Soul / Jazz",
    dates: "Oct 10 — Dec 22, 2024",
    fee: "$8k — $15k per show",
    trending: true,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChcgGr3TxcalMqo-ST9P_5n6LSpGtfJBeYjeV6cwaO3YOiCIRC_d4ZzBh6XXIrm8aGwv1WrsmGB_FxmCHR4DmY2KNGCqFEGvknXa2_flGCNI3ffIOzvu4Y8RsbhuKGsMdWnnTIsnTQ18p_-tjjoyo4xrUUZrpxvZ8zlZiuoj3weN_cksOhyZEaS91LGVmDkUpbbo2llxzZqjl4F_xdHt2UifuyjJSbHxlS0REFGjXQfqUaYuSHKADz4FSFKIvh86nDNPszIFc8M9Q",
    imgAlt: "A soulful jazz singer with eyes closed holding a classic silver microphone in a moody club",
  },
  {
    name: "Frequency Shift",
    genre: "Tech-House",
    dates: "Jun 10 — Aug 30, 2024",
    fee: "$40k — $75k per show",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCnldp3BG6jom6onZ4uSYCHhl--8JBW5XcS-VCbc-sMvwvvAaTxVwpeC9NrTpmY3I6_8dcvGDyBe79a5pTIB9O3YiQga_eX5EqROA-dJSUFeRbvt237xMDe76R02FlY2ljDwMLhrvERqJCbLcjEnU92TbO4F0SJnIi5io9q3rajJGWToSyXfSSbMr7ACs9nnNkuG21_NwmRIJenXWpmYekIivGjPsS8IQBzlxtVoDNeusZmXne_1ecDKpxuF515DGIeO7lLpSQ8zk",
    imgAlt: "High-energy silhouette of a DJ at a large festival stage with electric blue and pink light beams",
  },
  {
    name: "Solana Roots",
    genre: "World / Folk",
    dates: "May 20 — Jul 15, 2025",
    fee: "$5k — $12k per show",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOKK9ZDZyfZbTtwqMpotZlzGetgF5IEsCXPyaRP8gEQujN--te0UgKnrlU50GI-czkXB5Z0hDdjPyLr3-rk_MzGpppsPanIhvqGwQHdGBjI5yBwW19-X_cmEEd0lmIkc7EU8JRkCchrFAEg6pXbEEpMFGdeAagT9FKBpBdhkfZMnIRRk5ieaZydh9swygY1kHU5PGtl5zsyBwb1TvSYjxfN8dKDuHqp5k98c11_fAT4Bmso8umqUhJr2oRauLjyJXHI6mb03kbBIM",
    imgAlt: "A vibrant street musician playing an exotic acoustic guitar in a colorful Mediterranean plaza",
  },
  {
    name: "Eleanor Thorne",
    genre: "Modern Classical",
    dates: "Jan 05 — Mar 20, 2025",
    fee: "$15k — $30k per show",
    trending: false,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi18PBvAxxUOmxemsDq1Ny-SnwOe0mfNjah4nyXtrDCSapRC1vwX0zbXsJyWxMS1F5bRG75CUQ8Sb-MLOa5EykUjElNDyYxIP21vAVdb96BwNOU-Y03Hyq8Xg4XCIE--HUKhLT09hsZ9CuM06l0HAPMh3FkgoP31ODkk9YE9LDs7TXuA3nzcJlmJ_ad24-i-_4wlMnAkfgm2WfRBvu-9wZcbViA4JEKvAZP4XutgUDafIiE4Bg1STgDrk7VLDme5VMMNCiEOn-k6U",
    imgAlt: "A grand symphonic orchestra hall with a center spotlight on a grand piano",
  },
];

export default function DiscoveryPage() {
  return (
    <div className="bg-surface text-on-surface antialiased">
      <TopNav activeLink="discovery" showSearch />

      <main className="pt-24 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto flex flex-col gap-12">
        {/* Hero Header */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
              Discovery Gallery
            </span>
            <h1 className="font-(family-name:--font-manrope) text-5xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tighter">
              Find the Sound of <br />
              Your Next{" "}
              <span className="text-[#FF5A30]">Global Stage.</span>
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Access curated artist rosters and exclusive tour windows. Submit
              Expressions of Interest (EOI) directly to management teams and
              secure world-class talent for your venue.
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
                <p className="text-on-tertiary-fixed-variant text-sm mt-1">
                  Electronic acts seeing 40% surge in EOI for Q3 Summer
                  Festivals.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <section className="bg-surface-container-low rounded-2xl p-4 md:p-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Genre
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none">
                <option>All Genres</option>
                <option>Electronic</option>
                <option>Indie Rock</option>
                <option>Jazz &amp; Soul</option>
                <option>Pop</option>
                <option>World Music</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Available Window
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none">
                <option>Summer 2024</option>
                <option>Autumn 2024</option>
                <option>Winter 2024</option>
                <option>Spring 2025</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                calendar_today
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Fee Range (USD)
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none">
                <option>All Ranges</option>
                <option>$5k - $15k</option>
                <option>$15k - $50k</option>
                <option>$50k - $150k</option>
                <option>$150k+</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                payments
              </span>
            </div>
          </div>
          <div className="flex items-end h-full self-end">
            <button
              type="button"
              className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#FF5A30]/20"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Apply Filters
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
                Active Tours (24)
              </h2>
              <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                <span>Sort by:</span>
                <button
                  type="button"
                  className="text-[#FF5A30] font-bold flex items-center gap-1"
                >
                  Newest First{" "}
                  <span className="material-symbols-outlined text-xs">
                    arrow_drop_down
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <div
                  key={artist.name}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-outline-variant/20"
                >
                  <div className="h-64 relative overflow-hidden">
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
                  </div>
                  <div className="p-6">
                    <h3 className="font-(family-name:--font-manrope) text-xl font-extrabold group-hover:text-[#FF5A30] transition-colors">
                      {artist.name}
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">
                          event
                        </span>
                        <span className="text-sm font-medium">
                          {artist.dates}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">
                          monetization_on
                        </span>
                        <span className="text-sm font-medium">{artist.fee}</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Link
                        href="/eoi"
                        className="block w-full bg-[#FF5A30] py-3 rounded-xl text-white font-bold text-sm tracking-wide shadow-md shadow-[#FF5A30]/10 active:scale-[0.98] transition-all text-center"
                      >
                        Show Interest
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            {/* How it Works */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <h3 className="font-(family-name:--font-manrope) text-xl font-bold mb-6">
                How it Works
              </h3>
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Browse & Filter",
                    desc: "Discover acts that match your venue's capacity and budget.",
                  },
                  {
                    step: "2",
                    title: "Submit EOI",
                    desc: "An Expression of Interest is a non-binding intent to book specific dates.",
                  },
                  {
                    step: "3",
                    title: "Management Review",
                    desc: "Artists review your venue and offer before initiating the final contract.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[#FF5A30] font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  className="w-full text-[#FF5A30] font-bold text-sm flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed/30 rounded-lg transition-colors"
                >
                  Learn More{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            {/* Financing Banner */}
            <div className="bg-gradient-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-(family-name:--font-manrope) text-xl font-bold leading-tight">
                  Secure Pre-Sale Financing
                </h4>
                <p className="text-white/90 text-sm mt-3 leading-relaxed">
                  Get up to 40% of the artist fee covered upfront with our
                  TourStack Funding.
                </p>
                <button
                  type="button"
                  className="mt-6 bg-white text-[#FF5A30] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
                >
                  Apply Now
                </button>
              </div>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] rotate-12 group-hover:scale-110 transition-transform duration-500">
                account_balance_wallet
              </span>
            </div>

            {/* Discovery Stats */}
            <div className="bg-surface-container-high rounded-2xl p-8">
              <h3 className="font-(family-name:--font-manrope) font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">
                Discovery Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "1.2k", label: "Total Acts" },
                  { value: "340", label: "Active Tours" },
                  { value: "89%", label: "Match Rate" },
                  { value: "48h", label: "Avg Response" },
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
