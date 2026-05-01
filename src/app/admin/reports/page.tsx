export default function AdminReportsPage() {
  return (
    <>
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
            Analytics
          </span>
          <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
            Tour Reports
          </h1>
          <p className="text-on-surface-variant font-medium">
            High-level metrics and financial reports for the Pan-African tour circuit.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-(family-name:--font-manrope) font-bold hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export CSV
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/10">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-6">
          query_stats
        </span>
        <h2 className="text-2xl font-(family-name:--font-manrope) font-black text-on-surface mb-2">
          Reports Dashboard Coming Soon
        </h2>
        <p className="text-on-surface-variant max-w-md mx-auto">
          We are currently aggregating data across your active tour projects. 
          Detailed financial breakdowns, ticket sale projections, and risk analysis will be available here shortly.
        </p>
      </div>
    </>
  );
}
