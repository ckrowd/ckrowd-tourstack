import Link from "next/link";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const steps = [
  { label: "Interest", active: true, done: true },
  { label: "Financing", active: true, done: false },
  { label: "Event Plan", active: false, done: false },
  { label: "Review", active: false, done: false },
];

export default function EOIPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      <SideNav activeItem="requests" />

      {/* Main Content Canvas */}
      <main className="flex-1 min-h-screen overflow-y-auto bg-surface-container-low p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Expression of Interest
            </h1>
            <p className="text-on-surface-variant">
              Submit your proposal for the upcoming global tour circuit. Ensure
              all financial and logistics data is accurate.
            </p>
          </header>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex justify-between items-center relative">
              {/* Background line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 z-0" />
              {/* Progress line */}
              <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-[#FF5A30] -translate-y-1/2 z-0 transition-all duration-500" />

              {steps.map((step, i) => (
                <div key={step.label} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface-container-low ${
                      step.active
                        ? "bg-[#FF5A30] text-white"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {step.done ? (
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                      step.active ? "text-[#FF5A30]" : "text-on-surface-variant"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-sm border border-outline-variant/10">
            <form className="space-y-10">
              {/* Budget & Financing */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-[#FF5A30]">
                    payments
                  </span>
                  <h3 className="text-xl font-bold">Budget &amp; Financing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant">
                      Artiste Fee (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                        $
                      </span>
                      <input
                        type="text"
                        defaultValue="75,000"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none"
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant italic">
                      Enter the projected base performance fee.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-on-surface-variant">
                      Funding Model
                    </label>
                    <select
                      defaultValue="Financing Needed"
                      className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface appearance-none outline-none"
                    >
                      <option>Self-funded</option>
                      <option>Financing Needed</option>
                      <option>Sponsorship Lead</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Expense Projections */}
              <section>
                <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                  Expense Projections
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Venue Rental", value: "12,000" },
                    { label: "Marketing", value: "5,500" },
                    { label: "Logistics", value: "8,200" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/20"
                    >
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        defaultValue={item.value}
                        className="w-full bg-transparent border-none p-0 text-lg font-bold text-on-surface focus:ring-0 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Financing Requirements Spotlight */}
              <section className="bg-[#FF5A30]/5 rounded-2xl p-6 border border-[#FF5A30]/10">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-[#FF5A30] mb-2">
                      Financing Requirements
                    </h4>
                    <p className="text-sm text-on-surface-variant mb-4">
                      Since &ldquo;Financing Needed&rdquo; is selected, our
                      underwriters will review this EOI for bridge capital
                      eligibility.
                    </p>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-[#FF5A30] text-[#FF5A30] focus:ring-[#FF5A30]"
                      />
                      <span className="ml-2 text-sm font-medium text-on-surface">
                        Enable automated match-making
                      </span>
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-[#FF5A30]/5 w-full md:w-48 text-center">
                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      Total Gap
                    </span>
                    <span className="text-2xl font-black text-[#FF5A30]">
                      $100,700
                    </span>
                  </div>
                </div>
              </section>

              {/* Navigation Actions */}
              <footer className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                <Link
                  href="/discovery"
                  className="px-8 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>{" "}
                  Back
                </Link>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-gradient-to-r from-[#FF5A30] to-[#cc4826] text-white rounded-xl font-bold shadow-xl shadow-[#FF5A30]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    Continue{" "}
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </footer>
            </form>
          </div>

          {/* Contextual Help */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-tertiary-fixed">
                  lightbulb
                </span>
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-1">
                  Financial Tip
                </h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Promoters who include a 15% contingency buffer in their EOI
                  are 40% more likely to be approved for financing within 48
                  hours.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container">
                  verified_user
                </span>
              </div>
              <div>
                <h5 className="font-bold text-on-surface mb-1">
                  Secure Submission
                </h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Your financial data is encrypted and only shared with verified
                  TourStack capital partners and necessary tour personnel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Top nav overlay for mobile */}
      <div className="md:hidden fixed top-0 w-full z-50">
        <TopNav activeLink="platform" />
      </div>
    </div>
  );
}
