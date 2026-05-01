export default function AdminFinancingPage() {
  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
            Capital Access
          </span>
          <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
            Financing Tracker
          </h1>
          <p className="text-on-surface-variant font-medium">
            Monitor and manage financing requests from tour promoters.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-(family-name:--font-manrope) font-bold text-lg">
            Financing Requests
          </h3>
          <span className="material-symbols-outlined text-[#FF5A30]">
            account_balance
          </span>
        </div>
        <div className="space-y-4">
          {[
            {
              promoter: "Stage One Productions",
              tour: "Burna Boy — Twice As Tall",
              amount: "$75,000",
              status: "Pending",
              color: "text-yellow-600 bg-yellow-50",
            },
            {
              promoter: "Pulse Nairobi",
              tour: "Davido — Timeless Tour",
              amount: "$40,000",
              status: "Approved",
              color: "text-emerald-700 bg-emerald-50",
            },
            {
              promoter: "Teranga Concerts",
              tour: "Asake — Work of Art",
              amount: "$20,000",
              status: "Declined",
              color: "text-red-700 bg-red-50",
            },
          ].map((f) => (
            <div
              key={f.promoter}
              className="flex items-center justify-between gap-4 p-4 border border-outline-variant/10 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div>
                <p className="text-base font-bold text-on-surface">
                  {f.promoter}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {f.tour} — <span className="font-semibold">{f.amount} requested</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${f.color}`}
                >
                  {f.status}
                </span>
                <button type="button" className="text-xs font-bold text-[#FF5A30] hover:underline">
                  Review Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
