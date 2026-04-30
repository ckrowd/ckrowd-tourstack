"use client";
import Footer from "@/components/Footer";
import { useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import StepForm from "@/components/StepForm";

// ─── Data ────────────────────────────────────────────────────────────────────

const STAKEHOLDERS = [
  {
    id: "promoter",
    label: "Tour Promoter",
    icon: "celebration",
    tag: "CERTIFIED GLOBAL PARTNER",
    description: "Concert & event organisers running CTaaS-certified tour stops",
    products: ["Event Cancellation", "Promoter Business", "Credit Guarantee", "Audience Ticket Protection"],
    steps: [
      { id: 1, label: "Submit EOI", detail: "Apply for a tour stop via the Discovery page. Complete your Expression of Interest and select your preferred markets." },
      { id: 2, label: "Certification Training", detail: "Complete CTaaS LMS certification. Pass the Promoter module to unlock certified partner status." },
      { id: 3, label: "Access Bank Onboarding", detail: "Open an Enterprise Account via the Ckrowd partnership with Access Bank. Required for insurance and finance activation." },
      { id: 4, label: "Insurance Activation", detail: "SanlamAllianz Business Insurance activates upon certification completion. Coverage includes event cancellation, liability, and credit guarantee." },
      { id: 5, label: "Finance Eligibility", detail: "Certified Access Bank account becomes Paymaster-eligible. Tour Stop Advance and Venue Build-Out Credit unlocked." },
    ],
    coverage: [
      { product: "Event Cancellation & Non-Appearance", type: "EVENT INSURANCE", desc: "Artist withdrawal, weather events, force majeure. Protects full event revenue.", premium: "1.5–3%", term: "Per Event" },
      { product: "Promoter Business Insurance", type: "SME INSURANCE", desc: "Public liability, property damage, business interruption for the promoter entity.", premium: "From $800/yr", term: "Annual" },
      { product: "Credit Guarantee Insurance", type: "HIGHEST VALUE", desc: "Underwrites Tour Stop Advance lending facility. Enables Access Bank lending.", premium: "0.8–1.2%", term: "Per Facility" },
      { product: "Audience Ticket Protection", type: "EMBEDDED", desc: "Embedded at checkout — refund guarantee for ticket holders if event is cancelled.", premium: "1–2% of ticket", term: "Per Event" },
    ],
    financeProducts: [
      { name: "Tour Stop Advance", amount: "Up to $30,000", term: "30–90 days", cost: "3–5% flat" },
      { name: "Venue Build-Out Credit", amount: "Up to $75,000", term: "6–18 months", cost: "12–15% p.a." },
    ],
    color: "bg-[#FF5A30]",
    accent: "#FF5A30",
  },
  {
    id: "workforce",
    label: "Touring Workforce",
    icon: "engineering",
    tag: "TOURING AGENT",
    description: "Sound engineers, lighting crews, stage managers, production staff deployed across tour stops",
    products: ["Group Personal Accident", "Employer Liability", "Contractor Coverage"],
    steps: [
      { id: 1, label: "WCS Registration", detail: "Register as a Workforce Contractor on Ckrowd. Submit skills, experience, and availability." },
      { id: 2, label: "Vetting & Verification", detail: "Skills assessment, reference check, and identity verification completed by Ckrowd operations." },
      { id: 3, label: "Touring Agent Certification", detail: "Complete role-specific CTaaS training module. Earn your Touring Agent certification badge." },
      { id: 4, label: "Group Insurance Activation", detail: "Personal accident, employer liability, and contractor coverage activated via SanlamAllianz group policy." },
      { id: 5, label: "Cross-Border Deployment", detail: "Access cross-border payroll via PAPSS. Deploy to certified tour stops across 27 markets." },
    ],
    coverage: [
      { product: "Group Personal Accident", type: "GROUP INSURANCE", desc: "Personal accident and injury coverage for all certified touring workforce members.", premium: "From $200/yr", term: "Annual" },
      { product: "Employer Liability", type: "GROUP INSURANCE", desc: "Employer liability protection covering workplace injuries and claims.", premium: "From $350/yr", term: "Annual" },
      { product: "Contractor Coverage", type: "SPECIALTY", desc: "Professional indemnity and equipment coverage for independent contractors.", premium: "From $400/yr", term: "Annual" },
    ],
    financeProducts: [
      { name: "Contractor Float", amount: "Up to $15,000", term: "60 days", cost: "2.5% flat" },
    ],
    color: "bg-[#2D5A8E]",
    accent: "#2D5A8E",
  },
  {
    id: "vendor",
    label: "SMEs & Vendors",
    icon: "warehouse",
    tag: "ECOSYSTEM PARTNER",
    description: "Production companies, equipment suppliers, catering, merchandise, and transport providers",
    products: ["Equipment & Cargo", "Business Interruption", "Professional Indemnity"],
    steps: [
      { id: 1, label: "Vendor EOI", detail: "Submit Expression of Interest to supply services to certified tour stops. Specify your category and capacity." },
      { id: 2, label: "Ckrowd Supplier Vetting", detail: "Capacity check, business registration verification, and quality assessment conducted by Ckrowd." },
      { id: 3, label: "Approved Vendor Listing", detail: "Listed in Ckrowd Vendor Marketplace and matched to relevant tour stops based on geography and capacity." },
      { id: 4, label: "Insurance Profile Creation", detail: "SME business insurance bundle activated via SanlamAllianz. Covers equipment, cargo, and business interruption." },
      { id: 5, label: "Finance Access", detail: "Working capital pre-event financing unlocked for approved vendors with certified tour stop contracts." },
    ],
    coverage: [
      { product: "Aviation & Equipment Insurance", type: "SPECIALTY LINES", desc: "Charter aircraft, production equipment, and high-value cargo in transit.", premium: "Bespoke", term: "Per Tour" },
      { product: "Business Interruption", type: "SME INSURANCE", desc: "Revenue protection if supply contracts are disrupted due to event cancellation.", premium: "From $600/yr", term: "Annual" },
      { product: "Professional Indemnity", type: "SME INSURANCE", desc: "Covers service delivery failures and contractual liability claims.", premium: "From $450/yr", term: "Annual" },
    ],
    financeProducts: [
      { name: "Vendor Working Capital", amount: "Up to $15,000", term: "60 days", cost: "2.5% flat" },
    ],
    color: "bg-[#3D6B2E]",
    accent: "#3D6B2E",
  },
  {
    id: "talent",
    label: "Artist Management",
    icon: "mic",
    tag: "TALENT SUPPLIER",
    description: "Agencies and management companies supplying artists to CTaaS-certified tour stops",
    products: ["Artist Non-Appearance", "Tour Liability", "Revenue Protection"],
    steps: [
      { id: 1, label: "Talent Supplier Registration", detail: "Register your management company. Submit artist roster and territory preferences." },
      { id: 2, label: "Artist LOI Submission", detail: "Submit Letter of Interest for specific tour stops. Attach artist technical rider and fee schedule." },
      { id: 3, label: "Contract & Block Rate Agreement", detail: "Negotiate block-rate artist fee agreements with promoters via the Ckrowd platform." },
      { id: 4, label: "Insurance Embed", detail: "Artist non-appearance and tour liability coverage embedded into performance contracts automatically." },
      { id: 5, label: "Paymaster Integration", detail: "Artist fees routed via certified Paymaster. Milestone-based release tied to performance completion." },
    ],
    coverage: [
      { product: "Artist Non-Appearance", type: "EVENT INSURANCE", desc: "Covers artist cancellation due to illness, injury, or force majeure.", premium: "2–4%", term: "Per Event" },
      { product: "Tour Revenue Protection", type: "SPECIALTY", desc: "Revenue guarantee product protecting management fees and artist earnings.", premium: "1.5–3%", term: "Per Tour" },
      { product: "Production Liability", type: "EVENT INSURANCE", desc: "Third-party liability arising from artist performance and production activities.", premium: "From $500", term: "Per Event" },
    ],
    financeProducts: [
      { name: "Artist Fee Advance", amount: "Up to $30,000", term: "30–90 days", cost: "3–5% flat" },
    ],
    color: "bg-[#7B3F8E]",
    accent: "#7B3F8E",
  },
];

const ECOSYSTEM_FLOW = [
  { step: "01", label: "Register & EOI", desc: "Submit Expression of Interest and select your stakeholder type.", icon: "description" },
  { step: "02", label: "Vetting", desc: "Identity, capacity, and business credentials verified.", icon: "fact_check" },
  { step: "03", label: "CTaaS Certification", desc: "Complete role-specific training on the Ckrowd LMS.", icon: "school" },
  { step: "04", label: "Bank Onboarding", desc: "Access Bank enterprise account opened via Ckrowd partnership.", icon: "account_balance" },
  { step: "05", label: "Insurance Activation", desc: "SanlamAllianz product suite activates automatically.", icon: "shield" },
  { step: "06", label: "Finance Eligibility", desc: "Tour finance products unlocked for certified accounts.", icon: "payments" },
];

const INSURANCE_PRODUCTS = [
  { name: "Event Cancellation", tag: "EVENT INSURANCE", icon: "event_busy", who: ["promoter", "talent"], desc: "Protects event revenue against cancellation, non-appearance, and force majeure events.", highlight: false },
  { name: "Credit Guarantee", tag: "HIGHEST VALUE", icon: "account_balance", who: ["promoter"], desc: "Underwrites Tour Stop Advance lending facility. Highest-value product in the portfolio.", highlight: true },
  { name: "Promoter Business", tag: "SME INSURANCE", icon: "business", who: ["promoter", "vendor"], desc: "Public liability, property, and business interruption for promoter and vendor entities.", highlight: false },
  { name: "Touring Workforce", tag: "GROUP INSURANCE", icon: "groups", who: ["workforce"], desc: "Group personal accident, employer liability, and contractor coverage for touring crew.", highlight: false },
  { name: "Aviation & Equipment", tag: "SPECIALTY LINES", icon: "flight", who: ["promoter", "vendor"], desc: "Charter aircraft, production equipment, and high-value cargo specialty coverage.", highlight: false },
  { name: "Audience Ticket Protection", tag: "EMBEDDED", icon: "confirmation_number", who: ["promoter", "talent"], desc: "Embedded refund guarantee for ticket holders. Activated at checkout automatically.", highlight: false },
];

const TABS = [
  { id: "overview", label: "Ecosystem Overview" },
  { id: "onboarding", label: "Onboarding Flow" },
  { id: "products", label: "Insurance Products" },
  { id: "profile", label: "My Insurance Profile" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeStakeholder, setActiveStakeholder] = useState("promoter");
  const [activeStep, setActiveStep] = useState(1);

  const current = STAKEHOLDERS.find(s => s.id === activeStakeholder)!;

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <TopNav />

      <main className="pt-24 pb-20 px-6 md:px-12 max-w-screen-2xl mx-auto flex flex-col gap-12">

        {/* ── Hero ── */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block font-(family-name:--font-manrope)">
              TourStack · Insurance Hub
            </span>
            <h1 className="font-(family-name:--font-manrope) text-5xl md:text-6xl font-extrabold text-on-surface leading-tight tracking-tighter">
              Insurance for{" "}
              <span className="text-[#FF5A30]">Every Role.</span>
              <br />Built Into the Pipeline.
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg max-w-xl leading-relaxed">
              SanlamAllianz-powered coverage embedded in the CTaaS certification
              pipeline — activating automatically as you onboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab("onboarding")}
                className="bg-[#FF5A30] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
              >
                Start Onboarding
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className="border border-outline-variant px-8 py-3.5 rounded-xl font-bold text-on-surface hover:bg-surface-container-low transition-all"
              >
                View Products
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[
              { value: "$400M–600M", label: "Insurable Portfolio" },
              { value: "27", label: "SanlamAllianz Markets" },
              { value: "6", label: "Coverage Lines" },
              { value: "4", label: "Certified Roles" },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-[#FF5A30]/5 shadow-sm">
                <p className="text-2xl font-black font-(family-name:--font-manrope) text-[#FF5A30]">{s.value}</p>
                <p className="text-xs uppercase font-bold text-on-surface-variant mt-1 tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* ── Tab Bar ── */}
        <div className="flex gap-0 border-b border-outline-variant/30 -mb-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold font-(family-name:--font-manrope) border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-[#FF5A30] text-[#FF5A30]"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            TAB: ECOSYSTEM OVERVIEW
        ══════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-16">

            {/* Pipeline flow */}
            <section>
              <h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">The Certification Pipeline</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {ECOSYSTEM_FLOW.map((step, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex flex-col gap-3 relative">
                    <div className="w-10 h-10 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#FF5A30] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-[#FF5A30] uppercase">{step.step}</span>
                    <p className="font-(family-name:--font-manrope) font-bold text-sm">{step.label}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
                    {i < ECOSYSTEM_FLOW.length - 1 && (
                      <span className="material-symbols-outlined absolute -right-2 top-1/2 -translate-y-1/2 text-outline-variant text-base hidden lg:block">chevron_right</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Stakeholder cards */}
            <section>
              <h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">Stakeholder Profiles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STAKEHOLDERS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveStakeholder(s.id); setActiveTab("profile"); }}
                    className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-outline-variant/30 transition-all duration-300 text-left flex flex-col"
                  >
                    <div className={`${s.color} p-6`}>
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                      </div>
                      <span className="text-[9px] font-black tracking-widest text-white/70 uppercase block mb-1">{s.tag}</span>
                      <p className="font-(family-name:--font-manrope) font-bold text-lg text-white">{s.label}</p>
                    </div>
                    <div className="p-6 flex flex-col gap-4 flex-1">
                      <p className="text-sm text-on-surface-variant leading-relaxed">{s.description}</p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Coverage includes</p>
                        <div className="flex flex-col gap-1.5">
                          {s.products.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A30] shrink-0" />
                              <span className="text-xs text-on-surface-variant">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-auto flex items-center gap-1 text-[#FF5A30] text-xs font-bold">
                        View profile
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Insurance products grid */}
            <section>
              <h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-8">Insurance Product Suite</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INSURANCE_PRODUCTS.map((p, i) => (
                  <div key={i} className={`rounded-2xl p-6 border shadow-sm flex flex-col gap-4 ${p.highlight ? "bg-[#FF5A30] text-white border-[#FF5A30]" : "bg-surface-container-lowest border-outline-variant/10"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.highlight ? "bg-white/20" : "bg-[#FF5A30]/10"}`}>
                        <span className={`material-symbols-outlined text-2xl ${p.highlight ? "text-white" : "text-[#FF5A30]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${p.highlight ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"}`}>{p.tag}</span>
                    </div>
                    <div>
                      <h3 className={`font-(family-name:--font-manrope) text-lg font-extrabold mb-1 ${p.highlight ? "text-white" : "text-on-surface"}`}>{p.name}</h3>
                      <p className={`text-sm leading-relaxed ${p.highlight ? "text-white/80" : "text-on-surface-variant"}`}>{p.desc}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-auto">
                      {p.who.map(w => {
                        const sh = STAKEHOLDERS.find(s => s.id === w);
                        return (
                          <span key={w} className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${p.highlight ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"}`}>
                            {sh?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-(family-name:--font-manrope) text-2xl font-bold text-white mb-2">Ready to activate your coverage?</h3>
                <p className="text-white/80 text-sm">Complete CTaaS certification and insurance activates automatically.</p>
              </div>
              <button
                onClick={() => setActiveTab("onboarding")}
                className="relative z-10 bg-white text-[#FF5A30] px-8 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform shrink-0"
              >
                Start Onboarding →
              </button>
              <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-white/10 text-[160px] rotate-12 select-none">shield</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: ONBOARDING FLOW
        ══════════════════════════════════════════ */}
        {activeTab === "onboarding" && (
          <div className="flex flex-col gap-10">

            {/* Role selector */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Select your role</p>
              <div className="flex flex-wrap gap-3">
                {STAKEHOLDERS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveStakeholder(s.id); setActiveStep(1); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all font-(family-name:--font-manrope) ${
                      activeStakeholder === s.id
                        ? "border-[#FF5A30] bg-[#FF5A30] text-white"
                        : "border-outline-variant text-on-surface-variant hover:border-[#FF5A30]/40"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Step list */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
                  <div className={`${current.color} p-5`}>
                    <span className="text-[9px] font-black tracking-widest text-white/70 uppercase block mb-1">{current.tag}</span>
                    <p className="font-(family-name:--font-manrope) font-bold text-white">{current.label} — Onboarding</p>
                  </div>
                  <div className="relative pl-10 pr-4 py-4 flex flex-col gap-0">
                    <div className="absolute left-[38px] top-6 bottom-6 w-px bg-outline-variant/30" />
                    {current.steps.map((step, i) => (
                      <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className={`relative flex gap-4 items-start py-3 text-left group transition-all`}
                      >
                        <div className={`absolute -left-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 transition-all ${
                          i < activeStep - 1
                            ? "bg-green-500 border-green-500 text-white"
                            : activeStep === step.id
                            ? "bg-[#FF5A30] border-[#FF5A30] text-white"
                            : "bg-surface border-outline-variant/40 text-on-surface-variant"
                        }`}>
                          {i < activeStep - 1 ? (
                            <span className="material-symbols-outlined text-sm">check</span>
                          ) : step.id}
                        </div>
                        <div className="pl-6">
                          <p className={`text-sm font-bold font-(family-name:--font-manrope) ${activeStep === step.id ? "text-[#FF5A30]" : "text-on-surface"}`}>{step.label}</p>
                          <p className="text-xs text-on-surface-variant">Step {step.id} of {current.steps.length}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Partners */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-outline-variant/10">
                    <p className="font-(family-name:--font-manrope) font-bold text-sm">Insurance Partners</p>
                  </div>
                  {[
                    { name: "SanlamAllianz Nigeria", sub: "Pan-Africa · All Insurance Lines" },
                    { name: "Access Bank Plc", sub: "Pan-Africa · Tour Finance Facility" },
                    { name: "PAPSS Network", sub: "Pan-Africa · Payment Rails" },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-outline-variant/10 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#FF5A30] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface">{p.name}</p>
                        <p className="text-xs text-on-surface-variant">{p.sub}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Step detail */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {current.steps.filter(s => s.id === activeStep).map(step => (
                  <div key={step.id} className="flex flex-col gap-4">
                    <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30] block mb-2">Step {step.id} of {current.steps.length}</span>
                          <h2 className="font-(family-name:--font-manrope) text-3xl font-extrabold">{step.label}</h2>
                        </div>
                        <div className={`${current.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black font-(family-name:--font-manrope) shrink-0`}>
                          {step.id}
                        </div>
                      </div>
                      <p className="text-on-surface-variant leading-relaxed mb-8">{step.detail}</p>
                      
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (activeStep < current.steps.length) setActiveStep(activeStep + 1);
                        else setActiveTab("profile");
                      }}>
                        <StepForm stakeholderId={current.id} stepId={step.id} />

                      {step.id === 4 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 flex gap-4 items-start">
                          <span className="material-symbols-outlined text-green-600 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                          <div>
                            <p className="font-(family-name:--font-manrope) font-bold text-green-800 text-sm mb-1">Insurance Activates at This Step</p>
                            <p className="text-xs text-green-700 leading-relaxed">SanlamAllianz coverage activates automatically upon certification completion. No separate application required.</p>
                          </div>
                        </div>
                      )}

                      {step.id === 5 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex gap-4 items-start">
                          <span className="material-symbols-outlined text-amber-600 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                          <div>
                            <p className="font-(family-name:--font-manrope) font-bold text-amber-800 text-sm mb-1">Finance Products Unlocked</p>
                            <p className="text-xs text-amber-700 leading-relaxed">Tour finance facilities are now available via Access Bank. Apply directly through the Financing tab.</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {activeStep > 1 && (
                          <button type="button" onClick={() => setActiveStep(activeStep - 1)} className="px-6 py-2.5 rounded-xl border border-outline-variant text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all">
                            ← Previous
                          </button>
                        )}
                        {activeStep < current.steps.length && (
                          <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[#FF5A30]/20">
                            Continue → Step {activeStep + 1}
                          </button>
                        )}
                        {activeStep === current.steps.length && (
                          <button type="submit" className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:opacity-90 transition-all">
                            ✓ Complete — View Coverage
                          </button>
                        )}
                      </div>
                      </form>
                    </div>

                    {/* Progress bar */}
                    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Onboarding Progress</p>
                      <div className="flex gap-1.5 mb-2">
                        {current.steps.map(s => (
                          <div key={s.id} className={`flex-1 h-1.5 rounded-full transition-all ${s.id <= activeStep ? "bg-[#FF5A30]" : "bg-outline-variant/30"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-on-surface-variant">{activeStep} of {current.steps.length} steps completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <section>
              <h2 className="font-(family-name:--font-manrope) text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { q: "Do I need to be certified before insurance activates?", a: "Yes. Insurance coverage activates automatically at Step 4 of the CTaaS certification pipeline. No separate insurance application is required." },
                  { q: "Can I apply for finance before my EOI is approved?", a: "You can start the process, but finance eligibility is unlocked at Step 5 — after certification and bank onboarding are complete." },
                  { q: "What happens if the event is cancelled?", a: "Promoter-initiated cancellation triggers the Event Cancellation policy. Claims are processed within 30 days via SanlamAllianz." },
                  { q: "Is a bank account in Africa required?", a: "Yes. Funds and insurance premiums are routed via Access Bank. The enterprise account is opened as part of the onboarding pipeline." },
                ].map((faq, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/10 shadow-sm">
                    <p className="font-(family-name:--font-manrope) font-bold text-on-surface mb-2">{faq.q}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: INSURANCE PRODUCTS
        ══════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INSURANCE_PRODUCTS.map((p, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className={`p-6 flex items-start justify-between gap-4 ${i % 2 === 0 ? "bg-on-surface/5" : "bg-surface-container"}`}>
                    <div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 inline-block ${p.highlight ? "bg-[#FF5A30] text-white" : "bg-surface-container-highest text-on-surface-variant"}`}>{p.tag}</span>
                      <h3 className="font-(family-name:--font-manrope) text-xl font-extrabold">{p.name}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#FF5A30] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <p className="text-sm text-on-surface-variant leading-relaxed">{p.desc}</p>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Available to</p>
                      <div className="flex gap-2 flex-wrap">
                        {p.who.map(w => {
                          const sh = STAKEHOLDERS.find(s => s.id === w);
                          return (
                            <span key={w} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30]">
                              {sh?.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <Link href="/eoi" className="text-[#FF5A30] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all mt-auto">
                      Apply via EOI
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Underwriter banner */}
            <div className="bg-linear-to-br from-on-surface to-on-surface/80 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30] block mb-2">Insurance Underwriter</span>
                <h3 className="font-(family-name:--font-manrope) text-2xl font-bold text-white mb-2">SanlamAllianz</h3>
                <p className="text-white/60 text-sm max-w-md">Pan-African insurance leader. 27 markets. All product lines underwritten and managed in-partnership with Ckrowd.</p>
              </div>
              <div className="relative z-10 text-right shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Insurable Portfolio</p>
                <p className="font-(family-name:--font-manrope) text-5xl font-black text-[#FF5A30] leading-none">$600M</p>
                <p className="text-xs text-white/40 mt-1">at 5-year scale</p>
              </div>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-white/5 text-[180px] select-none">verified_user</span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: MY INSURANCE PROFILE
        ══════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="flex flex-col gap-8">

            {/* Stakeholder switcher */}
            <div className="flex flex-wrap gap-3">
              {STAKEHOLDERS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveStakeholder(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all font-(family-name:--font-manrope) ${
                    activeStakeholder === s.id
                      ? "border-[#FF5A30] bg-[#FF5A30] text-white"
                      : "border-outline-variant text-on-surface-variant hover:border-[#FF5A30]/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left column */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Profile header */}
                <div className={`${current.color} rounded-2xl p-8`}>
                  <span className="text-[9px] font-black tracking-widest text-white/60 uppercase block mb-2">{current.tag}</span>
                  <h2 className="font-(family-name:--font-manrope) text-3xl font-extrabold text-white mb-2">{current.label}</h2>
                  <p className="text-white/70 text-sm leading-relaxed">{current.description}</p>
                </div>

                {/* Certification pathway */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                  <h3 className="font-(family-name:--font-manrope) font-bold mb-5">Certification Pathway</h3>
                  <div className="relative pl-8 flex flex-col gap-0">
                    <div className="absolute left-[30px] top-2 bottom-2 w-px bg-outline-variant/30" />
                    {current.steps.map((step, i) => (
                      <div key={step.id} className="relative flex gap-4 py-3">
                        <div className={`absolute -left-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 shrink-0 ${
                          i === 0 ? "bg-green-500 border-green-500 text-white" : "bg-surface border-outline-variant/40 text-on-surface-variant"
                        }`}>
                          {i === 0 ? <span className="material-symbols-outlined text-sm">check</span> : step.id}
                        </div>
                        <div className="flex-1 pl-6">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold font-(family-name:--font-manrope)">{step.label}</p>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${i === 0 ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}>
                              {i === 0 ? "COMPLETE" : "PENDING"}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5">{step.detail.slice(0, 75)}…</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Finance products */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                  <h3 className="font-(family-name:--font-manrope) font-bold mb-5">Available Finance Products</h3>
                  <div className="flex flex-col gap-4">
                    {current.financeProducts.map((fp, i) => (
                      <div key={i} className="border border-outline-variant/20 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <p className="font-(family-name:--font-manrope) font-bold">{fp.name}</p>
                          <span className="text-[9px] font-black uppercase tracking-widest bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full">ACCESS BANK</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-outline-variant/20">
                          {([["Amount", fp.amount], ["Term", fp.term], ["Cost", fp.cost]] as [string, string][]).map(([label, val]) => (
                            <div key={label}>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
                              <p className="text-sm font-bold text-on-surface mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                        <Link href="/financing" className="mt-4 flex items-center gap-1 text-[#FF5A30] text-xs font-bold hover:gap-2 transition-all">
                          Apply via Financing
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Coverage detail */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6">Your Coverage Profile</p>
                  <div className="flex flex-col gap-6">
                    {current.coverage.map((c, i) => (
                      <div key={i} className={`pl-4 border-l-4 ${i === 0 ? "border-[#FF5A30]" : "border-outline-variant/30"}`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h4 className="font-(family-name:--font-manrope) font-bold">{c.product}</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${i === 0 ? "bg-[#FF5A30]/10 text-[#FF5A30]" : "bg-surface-container text-on-surface-variant"}`}>{c.type}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{c.desc}</p>
                        <div className="grid grid-cols-2 gap-4">
                          {([["Premium", c.premium], ["Term", c.term]] as [string, string][]).map(([label, val]) => (
                            <div key={label}>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</p>
                              <p className="text-sm font-bold text-on-surface mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activate CTA */}
                <div className="bg-linear-to-br from-on-surface to-on-surface/80 rounded-2xl p-8 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30] block mb-2">Next Action</span>
                    <h3 className="font-(family-name:--font-manrope) text-xl font-bold text-white mb-2">Complete certification to activate coverage</h3>
                    <p className="text-white/60 text-sm mb-6">Insurance products are embedded in the pipeline. No separate application required.</p>
                    <button
                      onClick={() => setActiveTab("onboarding")}
                      className="bg-[#FF5A30] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                    >
                      CONTINUE ONBOARDING →
                    </button>
                  </div>
                  <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-white/5 text-[140px] select-none">shield</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
</main>
    </div>
  );
}
