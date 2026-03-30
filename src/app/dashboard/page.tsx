import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const requests = [
  {
    name: "The Midnight Echo",
    date: "Oct 12, 2024",
    status: "Pending",
    match: "94%",
    statusColor: "bg-yellow-100 text-yellow-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUQQfNDdTgx68ldF99DVk88ykm02ZF5hAFM9Zp82hdkUolvQLjrvMjkwy3ijXu8TDXa5Sp5VEzI3eyaiGNBH-nBotRABfdgcDWY9ue5W2CA6uu6mMwK4jrvpAqvdeuxmIwy2GiKO3iWpDPvrN1DbN1QlBm4ubkjCtTVK8H8Ln463Z9KUsx8Vs3V1lJKEea1fROpcoTQizKU0IncXZQgo--0vp60vC0bSlp-68cVcc6epdqA3NCOVFBScwx-P_JUIBCl-TTJRdGAVg",
    imgAlt: "Indie rock musician performing on stage with blue atmospheric lighting",
  },
  {
    name: "Pulse Collective",
    date: "Nov 05, 2024",
    status: "Approved",
    match: "88%",
    statusColor: "bg-emerald-100 text-emerald-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgXVCiK7XsOmsTThPU_g3X78cKuo0ogP57es-dVzCe_ldS3EjQz1HHwjMNhgyJvxOLmza1078k4nDjWHbzGxnJDXAyll4ehX7wIK8wqA8GQMJKGOUqAEA-FrwlQoiCgXplZz7SzqorHvVcIKer8RBF9ycXRkg7Ijr4AEcgr3vTHtU3K-ryC8jKEJlJ8Cuw73dNMUacc4uFKofEdYIY94czWtD2UrhP-H8hlYKrKUHOE0YcWm7Ljxwe171DDPIMyf6Ur-QNTVjY5F4",
    imgAlt: "Vibrant stage lights reflecting off a mirrored surface during a live electronic concert",
  },
  {
    name: "Solar Orbit",
    date: "Sept 28, 2024",
    status: "Rejected",
    match: "62%",
    statusColor: "bg-red-100 text-red-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1ezKowZagB8USr5DCmeGO9ACzgjKR7qSj17eElhml9-B3XV4e5G8G7o4tL-CthexPr4tAxATA5aj5FS7sSWjgXm7vUU-XKH-G2PxVVMxAYyrv0FQ4q2VDeR2Az1DIdSa0HGrKgE2noOv4DKSDy6qs6OMX26mZ1ElZ37sXvxnRRDnXxY2-qPv5FDbD1CRjOzuCkcWuTeyJ97AH875CTXkjby4zBFtk1QhDkM44gQVXJ4HOApkoZl3KimjQeT-rtuO6sF7XLbjaGEU",
    imgAlt: "Stadium crowd silhouetted against a brilliant white stage explosion of light",
  },
  {
    name: "Velvet Horizon",
    date: "Dec 15, 2024",
    status: "Needs Revision",
    match: "91%",
    statusColor: "bg-blue-100 text-blue-800",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBm3RM1-BhXSdrTRK1WiEXqxmheGDqQl4NA3RkQXFDioRxRDllhZMle-ZsXETS9vAHq-m-BbwM-l4LQ6CdsrXx1Jq-m-KO7QWSJmWZ18vW5peDmWD547K5IvLdYyMnK5IaJovGwtU1UNkc5sZiVI8N7BKDKsUcAVRIspR186wefLI4oNtkte52-CM-GnaA40VutwPrrLog2fGOtu7hkZq7aqyDGeBH4sxAw3UiakEFC9MyTVU3SboCt59YJlMGwHSZkorF-zD9oGM",
    imgAlt: "Close up of a jazz trumpeter in a dimly lit club with warm ambient orange glow",
  },
];

export default function DashboardPage() {
  return (
    <div className="bg-surface text-on-surface">
      <TopNav activeLink="platform" showSearch />

      <div className="flex pt-16 h-screen">
        <SideNav activeItem="overview" />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
                Promoter Dashboard
              </h1>
              <p className="text-on-surface-variant font-medium">
                Welcome back, Stage One Productions. Here is your touring
                ecosystem.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-tertiary-container ml-2">
                calendar_month
              </span>
              <span className="font-(family-name:--font-manrope) font-bold text-sm pr-4">
                Touring Season: Summer 2024
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-[#FF5A30]">
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                Total Requests
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  142
                </span>
                <span className="text-[#FF5A30] font-bold flex items-center text-sm">
                  +12%{" "}
                  <span className="material-symbols-outlined text-xs">
                    arrow_upward
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-secondary">
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                Approved Tours
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  38
                </span>
                <span className="text-slate-400 font-bold text-sm">
                  Season Peak
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between border-l-4 border-tertiary-container">
              <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
                Pending Financing
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                  $2.4M
                </span>
                <span className="text-tertiary-container font-bold text-sm">
                  8 Pending
                </span>
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
                  Neon Shadows @ Wembley
                </span>
                <span className="text-orange-50 font-medium text-sm">
                  In 4 days
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Requests Table */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-(family-name:--font-manrope) font-bold text-on-surface">
                  Your Requests
                </h2>
                <button
                  type="button"
                  className="text-sm font-bold text-[#FF5A30] flex items-center gap-1 hover:underline"
                >
                  View All{" "}
                  <span className="material-symbols-outlined text-sm">
                    open_in_new
                  </span>
                </button>
              </div>

              <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Artist
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 relative">
                              <Image
                                src={req.img}
                                alt={req.imgAlt}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-(family-name:--font-manrope) font-bold text-on-surface">
                              {req.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                          {req.date}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${req.statusColor}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
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
              {/* Financing Status */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-(family-name:--font-manrope) font-bold text-lg">
                    Financing Status
                  </h3>
                  <span className="material-symbols-outlined text-[#FF5A30]">
                    account_balance
                  </span>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-on-surface-variant font-medium">
                        Summer Series Pool
                      </span>
                      <span className="font-bold text-[#FF5A30]">
                        82% Funded
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FF5A30] h-full rounded-full"
                        style={{ width: "82%" }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-low rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                        Approved
                      </p>
                      <p className="text-xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
                        $1.8M
                      </p>
                    </div>
                    <div className="p-4 bg-surface-container-low rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
                        Pending
                      </p>
                      <p className="text-xl font-(family-name:--font-manrope) font-extrabold text-tertiary-container">
                        $640K
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full py-3 bg-orange-50 text-[#FF5A30] font-(family-name:--font-manrope) font-bold text-sm rounded-lg hover:brightness-95 transition-all"
                  >
                    Manage Treasury
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm">
                <h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-container-high">
                  <div className="relative flex gap-4 pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-surface-container-lowest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        Tour Confirmed: &lsquo;Urban Pulse&rsquo;
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        2 hours ago • Financing Approved
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center border-4 border-surface-container-lowest">
                      <div className="w-2 h-2 rounded-full bg-[#FF5A30]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        New Artist Request
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        5 hours ago • Silver Lake Management
                      </p>
                    </div>
                  </div>
                  <div className="relative flex gap-4 pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center border-4 border-surface-container-lowest">
                      <div className="w-2 h-2 rounded-full bg-tertiary-container" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        Document Required
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Yesterday • Venue Contract - Wembley
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
