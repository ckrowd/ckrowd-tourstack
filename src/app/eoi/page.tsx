"use client";

import Link from "next/link";
import { useState } from "react";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

const STEPS = [
  { label: "Show Interest" },
  { label: "Budget & Finance" },
  { label: "Event Plan" },
  { label: "Review" },
];

const inputClass =
  "w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm";

const selectClass =
  "w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm appearance-none";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-on-surface-variant mb-1.5">
      {children}
    </label>
  );
}

function Stepper({ current }: { current: number }) {
  const progress = (current / (STEPS.length - 1)) * 100;
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#FF5A30] -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface-container-low ${
                  done || active
                    ? "bg-[#FF5A30] text-white"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {done ? (
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
                className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center max-w-18 leading-tight ${
                  active ? "text-[#FF5A30]" : done ? "text-[#FF5A30]/70" : "text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type FormData = {
  artisteTour: string;
  showDate: string;
  venueName: string;
  venueCity: string;
  venueCapacity: string;
  venueType: string;
  artisteFee: string;
  fundingModel: string;
  ticketPrice: string;
  totalBudget: string;
  expVenue: string;
  expMarketing: string;
  expLogistics: string;
  expHospitality: string;
  eventConcept: string;
  prevEvents: string;
  company: string;
  optFinancing: boolean;
  optInsurance: boolean;
};

const defaultForm: FormData = {
  artisteTour: "",
  showDate: "",
  venueName: "",
  venueCity: "",
  venueCapacity: "",
  venueType: "Indoor Arena",
  artisteFee: "",
  fundingModel: "Self-funded",
  ticketPrice: "",
  totalBudget: "",
  expVenue: "",
  expMarketing: "",
  expLogistics: "",
  expHospitality: "",
  eventConcept: "",
  prevEvents: "",
  company: "",
  optFinancing: true,
  optInsurance: false,
};

function reviewRow(label: string, value: string | boolean | undefined) {
  if (value === undefined || value === "" || value === false) return null;
  const display = typeof value === "boolean" ? "Yes" : value;
  return (
    <div className="flex items-start gap-4 py-3 border-b border-outline-variant/10 last:border-none">
      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant w-40 shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-on-surface">{display}</span>
    </div>
  );
}

export default function EOIPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const estimatedRevenue =
    form.venueCapacity && form.ticketPrice
      ? `$${(Number(form.venueCapacity.replace(/,/g, "")) * Number(form.ticketPrice.replace(/,/g, ""))).toLocaleString()}`
      : "—";

  if (submitted) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex">
        <SideNav activeItem="requests" />
        <main className="flex-1 min-h-screen overflow-y-auto bg-surface-container-low p-6 md:p-12 flex items-center justify-center">
          <div className="text-center max-w-lg">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span
                className="material-symbols-outlined text-emerald-600 text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3 font-(family-name:--font-manrope)">
              EOI Submitted!
            </h1>
            <p className="text-on-surface-variant mb-8">
              Your Expression of Interest has been received. The Ckrowd team will review
              it and respond within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-[#FF5A30] text-white rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
              >
                View Dashboard
              </Link>
              <Link
                href="/discovery"
                className="px-8 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
              >
                Browse More Tours
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      <SideNav activeItem="requests" />

      <main className="flex-1 min-h-screen overflow-y-auto bg-surface-container-low p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
              TourStack — Promoter Portal
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Expression of Interest
            </h1>
            <p className="text-on-surface-variant">
              Submit your formal EOI for an upcoming Pan-African Tour Stop.
              Provide accurate venue, budget, and financing details so the
              Ckrowd team can assess your eligibility.
            </p>
          </header>

          <Stepper current={step} />

          {/* Form Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-sm border border-outline-variant/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step < STEPS.length - 1) {
                  setStep((s) => s + 1);
                } else {
                  setSubmitted(true);
                }
              }}
            >
              {/* ── Step 0: Show Interest ── */}
              {step === 0 && (
                <div className="space-y-10">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#FF5A30]">stars</span>
                      <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Show of Interest</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="artiste-tour">Select Artiste / Tour</Label>
                        <div className="relative">
                          <select
                            id="artiste-tour"
                            className={selectClass}
                            value={form.artisteTour}
                            onChange={(e) => set("artisteTour", e.target.value)}
                          >
                            <option value="">-- Choose an Artiste --</option>
                            <option>Vanguard Echo — Pan-African Tour 2024</option>
                            <option>The Northern Sights — West Africa Run</option>
                            <option>Aria Velvet — Continental Jazz Tour</option>
                            <option>Frequency Shift — Summer Festival Circuit</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                            expand_more
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5 italic">
                          Select the artiste and tour you wish to host.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="show-date">Preferred Show Date</Label>
                        <input
                          id="show-date"
                          type="date"
                          className={inputClass}
                          value={form.showDate}
                          onChange={(e) => set("showDate", e.target.value)}
                        />
                        <p className="text-xs text-on-surface-variant mt-1.5 italic">
                          Must fall within the artiste&apos;s availability window.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#FF5A30]">location_on</span>
                      <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Venue Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="venue-name">Venue Name</Label>
                        <input
                          id="venue-name"
                          type="text"
                          placeholder="e.g. Eko Convention Centre"
                          className={inputClass}
                          value={form.venueName}
                          onChange={(e) => set("venueName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="venue-city">City / Country</Label>
                        <input
                          id="venue-city"
                          type="text"
                          placeholder="e.g. Lagos, Nigeria"
                          className={inputClass}
                          value={form.venueCity}
                          onChange={(e) => set("venueCity", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="venue-capacity">Venue Capacity</Label>
                        <input
                          id="venue-capacity"
                          type="number"
                          placeholder="e.g. 5000"
                          className={inputClass}
                          value={form.venueCapacity}
                          onChange={(e) => set("venueCapacity", e.target.value)}
                        />
                        <p className="text-xs text-on-surface-variant mt-1.5 italic">
                          Total seated or standing capacity.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="venue-type">Venue Type</Label>
                        <div className="relative">
                          <select
                            id="venue-type"
                            className={selectClass}
                            value={form.venueType}
                            onChange={(e) => set("venueType", e.target.value)}
                          >
                            <option>Indoor Arena</option>
                            <option>Outdoor Amphitheatre</option>
                            <option>Festival Grounds</option>
                            <option>Concert Hall</option>
                            <option>Stadium</option>
                            <option>Club / Intimate Venue</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ── Step 1: Budget & Finance ── */}
              {step === 1 && (
                <div className="space-y-10">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#FF5A30]">payments</span>
                      <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Budget &amp; Financing</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="artiste-fee">Artiste Fee Budget (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                          <input
                            id="artiste-fee"
                            type="text"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm"
                            value={form.artisteFee}
                            onChange={(e) => set("artisteFee", e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5 italic">
                          Must meet or exceed the artiste&apos;s minimum fee.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="funding-model">Funding Model</Label>
                        <div className="relative">
                          <select
                            id="funding-model"
                            className={selectClass}
                            value={form.fundingModel}
                            onChange={(e) => set("fundingModel", e.target.value)}
                          >
                            <option>Self-funded</option>
                            <option>Financing Needed</option>
                            <option>Sponsorship Lead</option>
                            <option>Co-promoted</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                            expand_more
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ticket-price">Ticket Price (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                          <input
                            id="ticket-price"
                            type="text"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm"
                            value={form.ticketPrice}
                            onChange={(e) => set("ticketPrice", e.target.value)}
                          />
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1.5 italic">
                          Average ticket price for revenue estimation.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="total-budget">Estimated Total Budget (USD)</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">$</span>
                          <input
                            id="total-budget"
                            type="text"
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm"
                            value={form.totalBudget}
                            onChange={(e) => set("totalBudget", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                        Expense Breakdown (Estimates)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { id: "exp-venue", label: "Venue Rental", field: "expVenue" as const },
                          { id: "exp-marketing", label: "Marketing", field: "expMarketing" as const },
                          { id: "exp-logistics", label: "Logistics", field: "expLogistics" as const },
                          { id: "exp-hospitality", label: "Hospitality", field: "expHospitality" as const },
                        ].map((item) => (
                          <div key={item.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                            <label htmlFor={item.id} className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">
                              {item.label}
                            </label>
                            <input
                              id={item.id}
                              type="text"
                              placeholder="0"
                              className="w-full bg-transparent border-none p-0 text-base font-bold text-on-surface focus:ring-0 outline-none"
                              value={form[item.field]}
                              onChange={(e) => set(item.field, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Live revenue estimate */}
                  <div className="bg-[#FF5A30]/5 rounded-2xl p-6 border border-[#FF5A30]/10 flex items-center justify-between gap-6">
                    <div>
                      <h4 className="text-base font-bold text-[#FF5A30] mb-1">Estimated Revenue</h4>
                      <p className="text-sm text-on-surface-variant">
                        Auto-calculated from capacity × ticket price.
                      </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-[#FF5A30]/5 text-center shrink-0 min-w-32">
                      <span className="text-3xl font-black text-[#FF5A30] block">{estimatedRevenue}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Event Plan ── */}
              {step === 2 && (
                <div className="space-y-10">
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#FF5A30]">description</span>
                      <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Event Plan &amp; Offering</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="event-concept">Event Concept / Description</Label>
                        <textarea
                          id="event-concept"
                          rows={4}
                          placeholder="Describe the event format, your production capacity, and any unique elements you're bringing to this Tour Stop..."
                          className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
                          value={form.eventConcept}
                          onChange={(e) => set("eventConcept", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="prev-events">Previous Events Hosted</Label>
                          <input
                            id="prev-events"
                            type="text"
                            placeholder="e.g. Afrobeats Festival Lagos 2023"
                            className={inputClass}
                            value={form.prevEvents}
                            onChange={(e) => set("prevEvents", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company / Organisation</Label>
                          <input
                            id="company"
                            type="text"
                            placeholder="Your promoter company name"
                            className={inputClass}
                            value={form.company}
                            onChange={(e) => set("company", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-[#FF5A30]/5 rounded-2xl p-6 border border-[#FF5A30]/10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-[#FF5A30] mb-2">Financing Support</h4>
                        <p className="text-sm text-on-surface-variant mb-4">
                          If &ldquo;Financing Needed&rdquo; is selected, the Ckrowd team will assess
                          your EOI for bridge capital eligibility and connect you with our financial partners.
                        </p>
                        <div className="space-y-3">
                          <label htmlFor="opt-financing" className="flex items-center gap-2 cursor-pointer">
                            <input
                              id="opt-financing"
                              type="checkbox"
                              className="rounded border-[#FF5A30] text-[#FF5A30] focus:ring-[#FF5A30]"
                              checked={form.optFinancing}
                              onChange={(e) => set("optFinancing", e.target.checked)}
                            />
                            <span className="text-sm font-medium text-on-surface">
                              I would like to be considered for financing support
                            </span>
                          </label>
                          <label htmlFor="opt-insurance" className="flex items-center gap-2 cursor-pointer">
                            <input
                              id="opt-insurance"
                              type="checkbox"
                              className="rounded border-[#FF5A30] text-[#FF5A30] focus:ring-[#FF5A30]"
                              checked={form.optInsurance}
                              onChange={(e) => set("optInsurance", e.target.checked)}
                            />
                            <span className="text-sm font-medium text-on-surface">
                              I would like to be considered for event insurance
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#FF5A30]">fact_check</span>
                    <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Review &amp; Submit</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant -mt-4">
                    Please review all details before submitting your EOI.
                  </p>

                  {/* Show Interest */}
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-on-surface font-(family-name:--font-manrope)">Show of Interest</h4>
                      <button type="button" onClick={() => setStep(0)} className="text-xs text-[#FF5A30] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    {reviewRow("Artiste / Tour", form.artisteTour || "Not selected")}
                    {reviewRow("Show Date", form.showDate || "Not set")}
                    {reviewRow("Venue", form.venueName || "Not set")}
                    {reviewRow("City / Country", form.venueCity || "Not set")}
                    {reviewRow("Capacity", form.venueCapacity ? `${form.venueCapacity} pax` : "Not set")}
                    {reviewRow("Venue Type", form.venueType)}
                  </div>

                  {/* Budget */}
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-on-surface font-(family-name:--font-manrope)">Budget &amp; Financing</h4>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-[#FF5A30] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    {reviewRow("Artiste Fee Budget", form.artisteFee ? `$${form.artisteFee}` : "Not set")}
                    {reviewRow("Funding Model", form.fundingModel)}
                    {reviewRow("Ticket Price", form.ticketPrice ? `$${form.ticketPrice}` : "Not set")}
                    {reviewRow("Total Budget", form.totalBudget ? `$${form.totalBudget}` : "Not set")}
                    {reviewRow("Est. Revenue", estimatedRevenue !== "—" ? estimatedRevenue : undefined)}
                    {(form.expVenue || form.expMarketing || form.expLogistics || form.expHospitality) && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Venue Rental", val: form.expVenue },
                          { label: "Marketing", val: form.expMarketing },
                          { label: "Logistics", val: form.expLogistics },
                          { label: "Hospitality", val: form.expHospitality },
                        ].filter((x) => x.val).map((x) => (
                          <div key={x.label} className="bg-surface-container-lowest rounded-lg p-3">
                            <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">{x.label}</p>
                            <p className="text-sm font-bold">${x.val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Event Plan */}
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-on-surface font-(family-name:--font-manrope)">Event Plan</h4>
                      <button type="button" onClick={() => setStep(2)} className="text-xs text-[#FF5A30] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    {reviewRow("Company", form.company || "Not set")}
                    {reviewRow("Previous Events", form.prevEvents || "Not provided")}
                    {form.eventConcept && (
                      <div className="py-3 border-b border-outline-variant/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-1">Event Concept</span>
                        <p className="text-sm text-on-surface">{form.eventConcept}</p>
                      </div>
                    )}
                    {reviewRow("Financing Support", form.optFinancing)}
                    {reviewRow("Event Insurance", form.optInsurance)}
                  </div>

                  {/* Declaration */}
                  <div className="bg-surface-container-low rounded-2xl p-6 border border-[#FF5A30]/10">
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      By submitting this Expression of Interest, you confirm that all
                      information provided is accurate and that you have the authority to
                      commit your organisation to this proposal. Your data is handled
                      securely and shared only with the Ckrowd team.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <footer className="flex items-center justify-between pt-8 mt-10 border-t border-outline-variant/10">
                {step === 0 ? (
                  <Link
                    href="/discovery"
                    className="px-8 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="px-8 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                  </button>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-linear-to-r from-[#FF5A30] to-[#cc4826] text-white rounded-xl font-bold shadow-xl shadow-[#FF5A30]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                  >
                    {step < STEPS.length - 1 ? "Continue" : "Submit EOI"}
                    <span className="material-symbols-outlined">
                      {step < STEPS.length - 1 ? "arrow_forward" : "send"}
                    </span>
                  </button>
                </div>
              </footer>
            </form>
          </div>

          {/* Help Tips */}
          {step < 3 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-tertiary-fixed">lightbulb</span>
                </div>
                <div>
                  <h5 className="font-bold text-on-surface mb-1">Matching Tip</h5>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    EOIs with a budget at or above the artiste&apos;s minimum fee,
                    a matching date, and a venue of suitable capacity score highest
                    in our review process.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container">verified_user</span>
                </div>
                <div>
                  <h5 className="font-bold text-on-surface mb-1">Secure &amp; Confidential</h5>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Your financial data is encrypted and only shared with the
                    Ckrowd team and verified capital partners as part of the review
                    process.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="md:hidden fixed top-0 w-full z-50">
        <TopNav />
      </div>
    </div>
  );
}
