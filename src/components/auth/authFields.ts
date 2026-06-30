// Shared Tailwind class strings for the dark-cinematic auth funnel
// (sign in / sign up). Keeps inputs, labels, and the primary CTA identical
// across pages. Relies on the global `orange`/`ember` color tokens.

export const authLabel =
	"block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45 mb-2";

export const authInput =
	"w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange/60 transition-all";

export const authPrimaryBtn =
	"w-full py-3.5 bg-orange text-white font-semibold rounded-xl shadow-lg shadow-orange/25 hover:bg-ember transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

export const authTitle =
	"font-(family-name:--font-display) text-3xl leading-tight tracking-tight text-white";
