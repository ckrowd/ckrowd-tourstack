import { getAdminEOIs } from "@/app/actions";

function MatchBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 60
        ? "bg-yellow-400"
        : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-black text-on-surface w-8 text-right">
        {score}%
      </span>
    </div>
  );
}

export default async function AdminEOIPage() {
  const eoisResult = await getAdminEOIs();
  const eois = eoisResult.data ?? [];
  const pendingEOICount = eois.filter((e) =>
    ["pending", "pending_review"].includes(String(e.status ?? "").toLowerCase()),
  ).length;

  return (
    <>
      <div className="mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
          EOI Management
        </span>
        <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
          EOI Review Queue
        </h1>
        <p className="text-on-surface-variant font-medium">
          Review, approve, or reject Expressions of Interest submitted by promoters.
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-(family-name:--font-manrope) font-bold">
            Pending Submissions
          </h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-black">
            {pendingEOICount} Pending
          </span>
        </div>

        <div className="space-y-4">
          {eois.length === 0 && (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
                inbox
              </span>
              <p className="font-(family-name:--font-manrope) font-bold text-on-surface text-lg mb-2">
                No EOIs yet
              </p>
              <p className="text-on-surface-variant text-sm">
                EOI submissions will appear here for review.
              </p>
            </div>
          )}
          {eois.map((eoi) => {
            const eoiArtist = eoi.artist;
            const eoiPromoter = eoi.promoter;
            const status = String(eoi.status ?? "pending");
            const statusColor =
              status === "approved"
                ? "bg-emerald-100 text-emerald-800"
                : status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : status === "needs_revision"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800";
            const matchScore =
              typeof eoi.match_score === "number"
                ? eoi.match_score
                : typeof eoi.match_score === "string"
                  ? Number(eoi.match_score)
                  : 0;
            return (
              <div
                key={String(eoi.id)}
                className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      music_note
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-black text-[#FF5A30] uppercase tracking-widest">
                        {eoi.id
                          ? `EOI-${String(eoi.id).slice(-4).toUpperCase()}`
                          : "EOI"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColor}`}
                      >
                        {status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h3 className="font-(family-name:--font-manrope) font-bold text-on-surface text-lg">
                      {String(eoiArtist?.name ?? "Artist")}
                      <span className="text-on-surface-variant font-normal text-sm ml-1">
                        — {String(eoiArtist?.tour_name ?? "")}
                      </span>
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      <span className="font-semibold text-on-surface">
                        {String(eoiPromoter?.company_name ?? "")}
                      </span>
                      {" · "}
                      {String(eoi.city ?? "")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      icon: "event",
                      label: "Date",
                      value: eoi.created_at
                        ? new Date(String(eoi.created_at)).toLocaleDateString()
                        : "—",
                    },
                    {
                      icon: "location_on",
                      label: "Venue",
                      value: String(eoi.venue ?? eoi.city ?? "—"),
                    },
                    {
                      icon: "groups",
                      label: "Capacity",
                      value: eoi.capacity != null ? String(eoi.capacity) : "—",
                    },
                    {
                      icon: "payments",
                      label: "Budget",
                      value: eoi.budget != null ? String(eoi.budget) : "—",
                    },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="bg-surface-container-lowest rounded-lg p-3"
                    >
                      <div className="flex items-center gap-1 text-on-surface-variant mb-1">
                        <span className="material-symbols-outlined text-xs">
                          {d.icon}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {d.label}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-on-surface">
                        {d.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-on-surface-variant w-20 shrink-0">
                      Match Score
                    </span>
                    <div className="flex-1">
                      <MatchBar score={matchScore} />
                    </div>
                  </div>
                  {eoi.funding_type != null && (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-xs">
                        account_balance
                      </span>
                      <span>
                        Funding:{" "}
                        <span className="font-semibold text-on-surface">
                          {String(eoi.funding_type)}
                        </span>
                      </span>
                    </div>
                  )}
                  {eoi.flag_note != null && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg text-xs text-red-700 font-semibold">
                      <span className="material-symbols-outlined text-xs text-red-500">
                        flag
                      </span>
                      {String(eoi.flag_note)}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap md:flex-nowrap items-center gap-3 pt-4 border-t border-outline-variant/10">
                  <button
                    type="button"
                    className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Approve
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      edit_note
                    </span>
                    Needs Revision
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2.5 bg-red-50 text-red-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      cancel
                    </span>
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
