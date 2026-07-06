// Shared Tailwind class strings for the dual-theme auth funnel
// (sign in / sign up). Colors resolve from the `.ts-theme` token vars, so the
// same markup works in light and dark. Relies on the global orange/ember tokens.

export const authLabel =
	"block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] mb-2";

export const authInput =
	"w-full px-4 py-3 bg-[var(--surface)] border border-[var(--hair)] rounded-xl text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange/60 transition-all";

export const authPrimaryBtn =
	"w-full py-3.5 bg-orange text-white font-semibold rounded-xl shadow-lg shadow-orange/25 hover:bg-ember transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

export const authTitle =
	"font-(family-name:--font-display) text-3xl leading-tight tracking-tight text-[var(--text)]";
