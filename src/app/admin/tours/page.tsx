import Link from "next/link";
import { getAdminTours } from "@/app/actions";

export default async function AdminToursPage() {
  const toursResult = await getAdminTours();
  const tourProjects = toursResult.data ?? [];

  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
            Tour Management
          </span>
          <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
            Tour Projects
          </h1>
          <p className="text-on-surface-variant font-medium">
            Manage your active and upcoming tour projects.
          </p>
        </div>
        <Link
          href="/admin/tours/create"
          className="flex items-center gap-2 px-6 py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined">add</span>
          Create Tour Project
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
        <h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-5">
          All Tour Projects
        </h3>
        <div className="space-y-4">
          {tourProjects.length === 0 && (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
                confirmation_number
              </span>
              <p className="font-(family-name:--font-manrope) font-bold text-on-surface text-lg mb-2">
                No tour projects yet
              </p>
              <p className="text-on-surface-variant text-sm">
                Publish a new tour project to get started.
              </p>
            </div>
          )}
          {tourProjects.map((t) => {
            const tArtist = t.artist;
            return (
              <div
                key={String(t.id)}
                className="flex items-center justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-none"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-on-surface truncate">
                    {String(tArtist?.name ?? tArtist?.tour_name ?? "Tour")}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {String(tArtist?.genre ?? "")}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${
                    String(t.status ?? "draft") === "active" ||
                    String(t.status ?? "") === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {String(t.status ?? "Draft")}
                </span>
                <button
                  type="button"
                  className="ml-4 p-2 text-on-surface-variant hover:text-[#FF5A30] hover:bg-[#FF5A30]/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
