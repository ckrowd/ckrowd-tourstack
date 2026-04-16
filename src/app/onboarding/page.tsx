"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";

/* ─────────────────────── Types ─────────────────────── */

type Category = "service" | "workforce" | "artmgmt";

type StakeholderEntry = {
  id: string;
  category: Category;
  name: string;
  email: string;
  phone: string;
  company?: string;
  country: string;
  submittedAt: string;
  // extra fields stored but not displayed in directory
  [key: string]: unknown;
};

const CATEGORY_LABELS: Record<Category, string> = {
  service: "Service Provider",
  workforce: "Workforce",
  artmgmt: "Artist Management Company",
};

const CATEGORY_ICONS: Record<Category, string> = {
  service: "build",
  workforce: "engineering",
  artmgmt: "music_note",
};

/* ─────────────────────── Shared UI ─────────────────────── */

const inputClass =
  "w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm";

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-on-surface-variant mb-1.5"
    >
      {children}
      {optional && (
        <span className="ml-1 font-normal italic text-xs">(optional)</span>
      )}
    </label>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const checked = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition-all text-left ${
              checked
                ? "bg-[#FF5A30]/10 border-[#FF5A30] text-[#FF5A30]"
                : "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-[#FF5A30]/40"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                checked ? "border-[#FF5A30]" : "border-current"
              }`}
            >
              {checked && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A30] block" />
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Step 0: Category Selector ─────────────────────── */

function CategoryStep({
  value,
  onChange,
}: {
  value: Category | "";
  onChange: (v: Category) => void;
}) {
  const categories: { key: Category; label: string; icon: string; desc: string }[] = [
    {
      key: "service",
      label: "Service Provider",
      icon: "build",
      desc: "Venue operators, logistics companies, sound & lighting firms, catering, security, and other event service providers.",
    },
    {
      key: "workforce",
      label: "Workforce",
      icon: "engineering",
      desc: "Stage managers, audio engineers, lighting designers, riggers, photographers, tour managers, and touring crew.",
    },
    {
      key: "artmgmt",
      label: "Artist Management Company",
      icon: "music_note",
      desc: "Companies that represent and manage artists or bands seeking touring opportunities across new markets.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-[#FF5A30]">category</span>
        <h3 className="text-xl font-bold font-(family-name:--font-manrope)">
          Select Stakeholder Category
        </h3>
      </div>
      <p className="text-sm text-on-surface-variant">
        Choose the category that best describes the stakeholder you are onboarding.
        The form fields will adapt to your selection.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const selected = value === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange(cat.key)}
              className={`flex flex-col gap-4 p-6 rounded-2xl border-2 text-left transition-all ${
                selected
                  ? "bg-[#FF5A30]/5 border-[#FF5A30]"
                  : "bg-surface-container-highest border-outline-variant/20 hover:border-[#FF5A30]/40"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selected ? "bg-[#FF5A30] text-white" : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <div>
                <p
                  className={`font-bold text-base font-(family-name:--font-manrope) mb-1 ${
                    selected ? "text-[#FF5A30]" : "text-on-surface"
                  }`}
                >
                  {cat.label}
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── Service Provider Form ─────────────────────── */

type ServiceForm = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  serviceType: string;
  otherService: string;
  yearsOperation: string;
  pastClients: string;
  certifications: string;
  website: string;
  declarationName: string;
  declarationDate: string;
};

const defaultServiceForm: ServiceForm = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  serviceType: "",
  otherService: "",
  yearsOperation: "",
  pastClients: "",
  certifications: "",
  website: "",
  declarationName: "",
  declarationDate: "",
};

const SERVICE_TYPES = [
  "Venue / Facilities",
  "Sound & Audio",
  "Lighting & Staging",
  "Logistics & Transport",
  "Security",
  "Catering & Hospitality",
  "Ticketing & Box Office",
  "Marketing & PR",
  "Photography / Videography",
  "Medical / First Aid",
  "Generator / Power",
  "Other",
];

function ServiceProviderForm({
  form,
  setField,
  step,
}: {
  form: ServiceForm;
  setField: <K extends keyof ServiceForm>(k: K, v: ServiceForm[K]) => void;
  step: number;
}) {
  if (step === 1) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF5A30]">business</span>
          <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Company Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="sp-company">Company / Organisation Name</Label>
            <input id="sp-company" type="text" placeholder="e.g. Lagos Sound Systems Ltd" className={inputClass} required
              value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-contact">Primary Contact Person</Label>
            <input id="sp-contact" type="text" placeholder="e.g. Ade Okafor" className={inputClass} required
              value={form.contactName} onChange={(e) => setField("contactName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-email">Email Address</Label>
            <input id="sp-email" type="email" placeholder="contact@company.com" className={inputClass} required
              value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-phone">Phone Number</Label>
            <input id="sp-phone" type="tel" placeholder="+234 800 000 0000" className={inputClass} required
              value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-country">Country</Label>
            <input id="sp-country" type="text" placeholder="e.g. Nigeria" className={inputClass} required
              value={form.country} onChange={(e) => setField("country", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-city">City</Label>
            <input id="sp-city" type="text" placeholder="e.g. Lagos" className={inputClass} required
              value={form.city} onChange={(e) => setField("city", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-website" optional>Website</Label>
            <input id="sp-website" type="url" placeholder="https://yourcompany.com" className={inputClass}
              value={form.website} onChange={(e) => setField("website", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF5A30]">build</span>
          <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Services &amp; Experience</h3>
        </div>
        <div>
          <Label>Primary Service Type</Label>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVICE_TYPES.map((s) => {
              const checked = form.serviceType === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setField("serviceType", s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    checked
                      ? "bg-[#FF5A30]/10 border-[#FF5A30] text-[#FF5A30]"
                      : "bg-surface-container-highest border-outline-variant/20 text-on-surface-variant hover:border-[#FF5A30]/40"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${checked ? "border-[#FF5A30]" : "border-current"}`}>
                    {checked && <span className="w-2 h-2 rounded-full bg-[#FF5A30] block" />}
                  </span>
                  {s}
                </button>
              );
            })}
          </div>
          {form.serviceType === "Other" && (
            <div className="mt-4">
              <Label htmlFor="sp-other-service">Specify your service</Label>
              <input id="sp-other-service" type="text" placeholder="Describe your service" className={inputClass}
                value={form.otherService} onChange={(e) => setField("otherService", e.target.value)} />
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="sp-years">Years in Operation</Label>
          <div className="mt-2">
            <RadioGroup
              options={["Less than 1 year", "1–3 years", "4–7 years", "8+ years"]}
              value={form.yearsOperation}
              onChange={(v) => setField("yearsOperation", v)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="sp-clients" optional>Notable Past Clients / Events</Label>
          <textarea id="sp-clients" rows={3}
            placeholder="List any notable artists, promoters, or events you have worked with..."
            className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
            value={form.pastClients} onChange={(e) => setField("pastClients", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="sp-certs" optional>Certifications, Licenses, or Affiliations</Label>
          <textarea id="sp-certs" rows={2}
            placeholder="e.g. PSNC membership, ISO certification, safety licenses..."
            className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
            value={form.certifications} onChange={(e) => setField("certifications", e.target.value)} />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF5A30]">gavel</span>
          <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Declaration &amp; Consent</h3>
        </div>
        <ul className="space-y-2">
          {[
            "All information provided is accurate and complete to the best of our knowledge.",
            "We consent to Tour Stack by Crowd holding and processing our data for partnership and deployment purposes.",
            "We understand that misrepresentation may result in removal from the registry.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[#FF5A30] text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_box
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sp-decl-name">Authorised Representative Name</Label>
            <input id="sp-decl-name" type="text" placeholder="Full name" className={inputClass} required
              value={form.declarationName} onChange={(e) => setField("declarationName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="sp-decl-date">Date</Label>
            <input id="sp-decl-date" type="date" className={inputClass} required
              value={form.declarationDate} onChange={(e) => setField("declarationDate", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─────────────────────── Artist Management Form ─────────────────────── */

type ArtmgmtForm = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  yearsOperation: string;
  rosterSize: string;
  genres: string;
  artistsRepresented: string;
  pastCollaborations: string;
  instagram: string;
  website: string;
  declarationName: string;
  declarationDate: string;
};

const defaultArtmgmtForm: ArtmgmtForm = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  yearsOperation: "",
  rosterSize: "",
  genres: "",
  artistsRepresented: "",
  pastCollaborations: "",
  instagram: "",
  website: "",
  declarationName: "",
  declarationDate: "",
};

function ArtMgmtForm({
  form,
  setField,
  step,
}: {
  form: ArtmgmtForm;
  setField: <K extends keyof ArtmgmtForm>(k: K, v: ArtmgmtForm[K]) => void;
  step: number;
}) {
  if (step === 1) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF5A30]">business</span>
          <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Company Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="am-company">Company / Management Firm Name</Label>
            <input id="am-company" type="text" placeholder="e.g. Afrobeats Global Management" className={inputClass} required
              value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-contact">Primary Contact Person</Label>
            <input id="am-contact" type="text" placeholder="e.g. Tunde Balogun" className={inputClass} required
              value={form.contactName} onChange={(e) => setField("contactName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-email">Email Address</Label>
            <input id="am-email" type="email" placeholder="contact@mgmt.com" className={inputClass} required
              value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-phone">Phone Number</Label>
            <input id="am-phone" type="tel" placeholder="+234 800 000 0000" className={inputClass} required
              value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-country">Country of Registration</Label>
            <input id="am-country" type="text" placeholder="e.g. Nigeria" className={inputClass} required
              value={form.country} onChange={(e) => setField("country", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-city">City</Label>
            <input id="am-city" type="text" placeholder="e.g. Lagos" className={inputClass} required
              value={form.city} onChange={(e) => setField("city", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-website" optional>Website</Label>
            <input id="am-website" type="url" placeholder="https://yourmgmt.com" className={inputClass}
              value={form.website} onChange={(e) => setField("website", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-instagram" optional>Instagram Handle</Label>
            <input id="am-instagram" type="text" placeholder="@yourmgmt" className={inputClass}
              value={form.instagram} onChange={(e) => setField("instagram", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF5A30]">music_note</span>
          <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Roster &amp; Experience</h3>
        </div>
        <div>
          <Label>Years in Operation</Label>
          <div className="mt-2">
            <RadioGroup
              options={["Less than 1 year", "1–3 years", "4–7 years", "8+ years"]}
              value={form.yearsOperation}
              onChange={(v) => setField("yearsOperation", v)}
            />
          </div>
        </div>
        <div>
          <Label>Roster Size (Number of Acts Represented)</Label>
          <div className="mt-2">
            <RadioGroup
              options={["1–2 acts", "3–5 acts", "6–10 acts", "11–20 acts", "20+ acts"]}
              value={form.rosterSize}
              onChange={(v) => setField("rosterSize", v)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="am-genres">Primary Genre(s)</Label>
          <input id="am-genres" type="text" placeholder="e.g. Afrobeats, Hip-Hop, Afro-Soul, Highlife" className={inputClass} required
            value={form.genres} onChange={(e) => setField("genres", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="am-artists">Artists / Acts Represented</Label>
          <textarea id="am-artists" rows={3}
            placeholder="List the main artists or acts you represent..."
            className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
            value={form.artistsRepresented} onChange={(e) => setField("artistsRepresented", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="am-collabs" optional>Past Tour Collaborations or Markets Toured</Label>
          <textarea id="am-collabs" rows={3}
            placeholder="e.g. Nigeria, Ghana, UK, USA — collaborations with Coachella, Afronation..."
            className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-[#FF5A30] transition-all text-on-surface outline-none text-sm resize-none"
            value={form.pastCollaborations} onChange={(e) => setField("pastCollaborations", e.target.value)} />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[#FF5A30]">gavel</span>
          <h3 className="text-xl font-bold font-(family-name:--font-manrope)">Declaration &amp; Consent</h3>
        </div>
        <ul className="space-y-2">
          {[
            "All information provided is accurate and complete to the best of our knowledge.",
            "We consent to Tour Stack by Crowd holding and processing our data for matching and deployment purposes.",
            "We understand that misrepresentation may result in removal from the registry.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[#FF5A30] text-base mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_box
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="am-decl-name">Authorised Representative Name</Label>
            <input id="am-decl-name" type="text" placeholder="Full name" className={inputClass} required
              value={form.declarationName} onChange={(e) => setField("declarationName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="am-decl-date">Date</Label>
            <input id="am-decl-date" type="date" className={inputClass} required
              value={form.declarationDate} onChange={(e) => setField("declarationDate", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ─────────────────────── Stepper ─────────────────────── */

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  const progress = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#FF5A30] -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-surface-container-low ${
                  done || active ? "bg-[#FF5A30] text-white" : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {done ? (
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-2 text-[10px] font-bold uppercase tracking-wider text-center max-w-16 leading-tight ${
                  active ? "text-[#FF5A30]" : done ? "text-[#FF5A30]/70" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── Directory Tab ─────────────────────── */

const FILTER_TABS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "service", label: "Service Providers" },
  { key: "workforce", label: "Workforce" },
  { key: "artmgmt", label: "Artist Mgmt" },
];

function DirectoryTab({ entries }: { entries: StakeholderEntry[] }) {
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [selected, setSelected] = useState<StakeholderEntry | null>(null);

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.category === filter);

  if (selected) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-[#FF5A30] text-sm font-semibold mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Directory
        </button>

        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-start gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#FF5A30] text-2xl">
                {CATEGORY_ICONS[selected.category]}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-1">
                {CATEGORY_LABELS[selected.category]}
              </span>
              <h2 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface">
                {selected.name}
              </h2>
              {selected.company && (
                <p className="text-on-surface-variant text-sm mt-0.5">{selected.company}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Email</p>
              <p className="text-sm text-on-surface font-medium">{selected.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Phone</p>
              <p className="text-sm text-on-surface font-medium">{selected.phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Country</p>
              <p className="text-sm text-on-surface font-medium">{selected.country}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Submitted</p>
              <p className="text-sm text-on-surface font-medium">
                {new Date(selected.submittedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === tab.key
                ? "bg-[#FF5A30] text-white shadow-md"
                : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">
              {tab.key === "all"
                ? entries.length
                : entries.filter((e) => e.category === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-4">
            group_add
          </span>
          <p className="text-on-surface-variant font-medium">
            No onboarded stakeholders yet.
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Use the &quot;Onboard Stakeholder&quot; tab to add the first entry.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Name / Company
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">
                  Category
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden lg:table-cell">
                  Country
                </th>
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">
                  Submitted
                </th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#FF5A30] text-base">
                          {CATEGORY_ICONS[entry.category]}
                        </span>
                      </div>
                      <div>
                        <span className="block font-(family-name:--font-manrope) font-bold text-on-surface text-sm">
                          {entry.name}
                        </span>
                        {entry.company && (
                          <span className="block text-xs text-on-surface-variant">
                            {entry.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="px-2 py-1 bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-bold rounded-lg">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant font-medium hidden lg:table-cell">
                    {entry.country}
                  </td>
                  <td className="px-5 py-4 text-xs text-on-surface-variant font-medium hidden md:table-cell">
                    {new Date(entry.submittedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(entry)}
                      className="text-xs font-bold text-[#FF5A30] hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */

const STORAGE_KEY = "onboardedStakeholders";

const SERVICE_STEPS = ["Category", "Company", "Services", "Declaration"];
const ARTMGMT_STEPS = ["Category", "Company", "Roster", "Declaration"];
// Workforce has its own page at /workforce

function getStepsForCategory(cat: Category | "") {
  if (cat === "service") return SERVICE_STEPS;
  if (cat === "artmgmt") return ARTMGMT_STEPS;
  return ["Category", "Details", "Review", "Submit"];
}

export default function OnboardingPage() {
  const [tab, setTab] = useState<"form" | "directory">("form");
  const [category, setCategory] = useState<Category | "">("");
  const [step, setStep] = useState(0); // 0 = category selection

  const [serviceForm, setServiceFormState] = useState<ServiceForm>(defaultServiceForm);
  const [artmgmtForm, setArtmgmtFormState] = useState<ArtmgmtForm>(defaultArtmgmtForm);

  const [submitted, setSubmitted] = useState(false);
  const [entries, setEntries] = useState<StakeholderEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw) as StakeholderEntry[]);
    } catch {
      // ignore
    }
  }, []);

  function setServiceField<K extends keyof ServiceForm>(k: K, v: ServiceForm[K]) {
    setServiceFormState((prev) => ({ ...prev, [k]: v }));
  }

  function setArtmgmtField<K extends keyof ArtmgmtForm>(k: K, v: ArtmgmtForm[K]) {
    setArtmgmtFormState((prev) => ({ ...prev, [k]: v }));
  }

  const steps = getStepsForCategory(category);
  const totalSteps = steps.length; // step 0 = category, 1..n-1 = form steps

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      // Submit
      let newEntry: StakeholderEntry | null = null;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const now = new Date().toISOString();

      if (category === "service") {
        newEntry = {
          id,
          category: "service",
          ...serviceForm,
          name: serviceForm.contactName,
          company: serviceForm.companyName,
          submittedAt: now,
        };
      } else if (category === "artmgmt") {
        newEntry = {
          id,
          category: "artmgmt",
          ...artmgmtForm,
          name: artmgmtForm.contactName,
          company: artmgmtForm.companyName,
          submittedAt: now,
        };
      }

      if (newEntry) {
        const updated = [...entries, newEntry];
        setEntries(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      setSubmitted(true);
    }
  }

  function resetForm() {
    setCategory("");
    setStep(0);
    setServiceFormState(defaultServiceForm);
    setArtmgmtFormState(defaultArtmgmtForm);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="bg-surface text-on-surface">
        <TopNav />
        <div className="flex pt-16 h-screen">
          <SideNav />
          <main className="flex-1 flex items-center justify-center bg-surface-container-low p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <span
                  className="material-symbols-outlined text-4xl text-emerald-600"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-3 font-(family-name:--font-manrope)">
                Stakeholder Onboarded!
              </h1>
              <p className="text-on-surface-variant mb-8">
                The entry has been saved to the directory. You can view it under the Directory tab.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => { resetForm(); setTab("directory"); }}
                  className="px-8 py-3 bg-[#FF5A30] text-white rounded-xl font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform"
                >
                  View Directory
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-bold border border-outline-variant/20 hover:bg-surface-container-low transition-colors"
                >
                  Onboard Another
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface">
      <TopNav />

      <div className="flex pt-16 h-screen">
        <SideNav />

        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-3">
                Platform Management
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-(family-name:--font-manrope)">
                Onboarding
              </h1>
              <p className="text-on-surface-variant">
                Register new stakeholders or browse the existing directory.
              </p>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-container-highest rounded-2xl p-1 mb-8 w-fit">
              {(["form", "directory"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    tab === t
                      ? "bg-white text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t === "form" ? "Onboard Stakeholder" : "Directory"}
                  {t === "directory" && entries.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-[#FF5A30] text-white text-[10px] font-bold rounded-full">
                      {entries.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Directory */}
            {tab === "directory" && <DirectoryTab entries={entries} />}

            {/* Form */}
            {tab === "form" && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-sm border border-outline-variant/10">
                {/* Special case: Workforce routes to /workforce */}
                {step === 0 && (
                  <>
                    <CategoryStep value={category} onChange={(v) => setCategory(v)} />

                    {/* Workforce notice */}
                    {category === "workforce" && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-500 mt-0.5 shrink-0">info</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-800 mb-1">
                            Workforce registration is handled separately
                          </p>
                          <p className="text-xs text-blue-700">
                            Crew members register via the dedicated Workforce portal which includes
                            the WCS (Workforce Capability Score) system.
                          </p>
                          <Link
                            href="/workforce"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                          >
                            Go to Workforce Registration
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-8 mt-8 border-t border-outline-variant/10">
                      <button
                        type="button"
                        disabled={!category || category === "workforce"}
                        onClick={() => setStep(1)}
                        className="px-10 py-3 bg-linear-to-r from-[#FF5A30] to-[#cc4826] text-white rounded-xl font-bold shadow-xl shadow-[#FF5A30]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Continue
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    </div>
                  </>
                )}

                {step > 0 && category !== "" && category !== "workforce" && (
                  <>
                    <Stepper steps={steps} current={step} />

                    <form onSubmit={handleNext}>
                      {category === "service" && (
                        <ServiceProviderForm form={serviceForm} setField={setServiceField} step={step} />
                      )}
                      {category === "artmgmt" && (
                        <ArtMgmtForm form={artmgmtForm} setField={setArtmgmtField} step={step} />
                      )}

                      <footer className="flex items-center justify-between pt-8 mt-10 border-t border-outline-variant/10">
                        <button
                          type="button"
                          onClick={() => setStep((s) => Math.max(0, s - 1))}
                          className="px-8 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined">arrow_back</span>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="px-10 py-3 bg-linear-to-r from-[#FF5A30] to-[#cc4826] text-white rounded-xl font-bold shadow-xl shadow-[#FF5A30]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                          {step < totalSteps - 1 ? "Continue" : "Submit Onboarding"}
                          <span className="material-symbols-outlined">
                            {step < totalSteps - 1 ? "arrow_forward" : "send"}
                          </span>
                        </button>
                      </footer>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
