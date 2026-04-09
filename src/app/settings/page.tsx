"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";

type Tab = "profile" | "venue" | "notifications" | "billing" | "security";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "profile", label: "Profile", icon: "person" },
  { key: "venue", label: "Venue", icon: "stadium" },
  { key: "notifications", label: "Notifications", icon: "notifications" },
  { key: "billing", label: "Billing", icon: "credit_card" },
  { key: "security", label: "Security", icon: "lock" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm space-y-6">
      <div className="border-b border-outline-variant/20 pb-4">
        <h3 className="font-(family-name:--font-manrope) font-bold text-lg text-on-surface">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-on-surface-variant mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  id,
  defaultValue,
  type = "text",
  hint,
}: {
  label: string;
  id: string;
  defaultValue?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30"
      />
      {hint && (
        <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultChecked = false,
}: {
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-6 py-3 border-b border-outline-variant/10 last:border-0">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {description && (
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          on ? "bg-[#FF5A30]" : "bg-surface-container-high"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function ProfileTab() {
  const { markProfileComplete } = useAuth();
  return (
    <div className="space-y-6">
      <Section title="Company Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Company Name" id="company-name" defaultValue="Stage One Productions" />
          <Field label="Trading Name" id="trading-name" defaultValue="Stage One" />
          <Field label="Contact Person" id="contact-name" defaultValue="Kwame Asante" />
          <Field label="Job Title" id="job-title" defaultValue="Managing Director" />
          <Field label="Email Address" id="email" type="email" defaultValue="kwame@stageone.gh" />
          <Field label="Phone Number" id="phone" type="tel" defaultValue="+233 20 000 0000" />
          <Field label="Country" id="country" defaultValue="Ghana" />
          <Field label="City" id="city" defaultValue="Accra" />
        </div>
      </Section>

      <Section title="Public Profile" description="This information appears on your promoter profile visible to artiste managers.">
        <div className="space-y-5">
          <div>
            <label htmlFor="bio" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              defaultValue="Stage One Productions is a premier live events company based in Accra, Ghana. We have produced over 50 major shows across West and East Africa since 2015."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 resize-none"
            />
          </div>
          <Field label="Website" id="website" type="url" defaultValue="https://stageone.gh" />
          <Field
            label="Social Handle (Instagram)"
            id="instagram"
            defaultValue="@stageonegh"
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => markProfileComplete()}
          className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function VenueTab() {
  return (
    <div className="space-y-6">
      {/* Existing Venues */}
      <Section title="My Venues" description="Venues registered under your promoter account.">
        <div className="space-y-3">
          {[
            {
              name: "Alliance Française Accra",
              city: "Accra, Ghana",
              capacity: "1,200",
              type: "Indoor Theatre",
              verified: true,
            },
            {
              name: "Freedom Park",
              city: "Lagos, Nigeria",
              capacity: "5,000",
              type: "Outdoor Amphitheatre",
              verified: true,
            },
            {
              name: "Eko Convention Centre",
              city: "Lagos, Nigeria",
              capacity: "3,000",
              type: "Convention Hall",
              verified: false,
            },
          ].map((v) => (
            <div
              key={v.name}
              className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/10"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[#FF5A30]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  stadium
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm text-on-surface">{v.name}</p>
                  {v.verified ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {v.city} · {v.type} · Cap: {v.capacity}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-on-surface-variant hover:text-[#FF5A30] transition-colors"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add New Venue
        </button>
      </Section>

      {/* Add Venue Form */}
      <Section title="Venue Details" description="Update the primary venue on your account.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Venue Name" id="v-name" defaultValue="Alliance Française Accra" />
          <Field label="Venue Type" id="v-type" defaultValue="Indoor Theatre" />
          <Field label="City" id="v-city" defaultValue="Accra" />
          <Field label="Country" id="v-country" defaultValue="Ghana" />
          <Field label="Seated Capacity" id="v-cap-seated" defaultValue="800" />
          <Field label="Standing Capacity" id="v-cap-stand" defaultValue="1200" />
          <Field label="Street Address" id="v-address" defaultValue="Alliance Française, Liberation Road" />
          <Field label="Google Maps URL" id="v-maps" type="url" />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
          >
            Save Venue
          </button>
        </div>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Section title="Email Notifications">
        <div>
          <Toggle label="EOI Status Updates" description="When your EOI is approved, rejected, or needs revision" defaultChecked />
          <Toggle label="New Tour Announcements" description="When Ckrowd announces a new artiste or tour project" defaultChecked />
          <Toggle label="Financing Decisions" description="When your financing application is reviewed" defaultChecked />
          <Toggle label="Show Reminders" description="7-day and 24-hour reminders before your confirmed shows" defaultChecked />
          <Toggle label="Settlement Notifications" description="When a post-show financial settlement is ready" defaultChecked />
          <Toggle label="Platform Updates" description="Product announcements and feature releases" />
        </div>
      </Section>

      <Section title="In-App Notifications">
        <div>
          <Toggle label="EOI Activity" defaultChecked />
          <Toggle label="Message Alerts" defaultChecked />
          <Toggle label="Milestone Reminders" defaultChecked />
          <Toggle label="Promoter Tips & Insights" />
        </div>
      </Section>

      <Section title="Digest Frequency">
        <div className="space-y-3">
          {["Real-time", "Daily Digest", "Weekly Summary"].map((opt, i) => (
            <label
              key={opt}
              className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
            >
              <input
                type="radio"
                name="digest"
                defaultChecked={i === 0}
                className="accent-[#FF5A30]"
              />
              <span className="text-sm font-semibold text-on-surface">{opt}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <Section title="Current Plan">
        <div className="flex items-center justify-between p-5 bg-[#FF5A30]/5 rounded-xl border border-[#FF5A30]/20">
          <div>
            <p className="font-(family-name:--font-manrope) font-black text-lg text-on-surface">
              Global Stage Pro
            </p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Unlimited EOIs · Priority review · Financing access
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-2xl text-[#FF5A30]">$99</p>
            <p className="text-xs text-on-surface-variant">/ month</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-3 border border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            Change Plan
          </button>
          <button
            type="button"
            className="flex-1 py-3 border border-red-200 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            Cancel Subscription
          </button>
        </div>
      </Section>

      <Section title="Payment Method">
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <div className="w-12 h-8 bg-slate-800 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-black">VISA</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-on-surface">•••• •••• •••• 4242</p>
              <p className="text-xs text-on-surface-variant">Expires 08 / 2026</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              Default
            </span>
          </div>
          <button
            type="button"
            className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add_card</span>
            Add Payment Method
          </button>
        </div>
      </Section>

      <Section title="Billing History">
        <div className="overflow-hidden rounded-xl border border-outline-variant/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {["Date", "Description", "Amount", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {[
                { date: "Oct 1, 2024", desc: "Global Stage Pro — Monthly", amount: "$99.00", status: "Paid" },
                { date: "Sep 1, 2024", desc: "Global Stage Pro — Monthly", amount: "$99.00", status: "Paid" },
                { date: "Aug 1, 2024", desc: "Global Stage Pro — Monthly", amount: "$99.00", status: "Paid" },
              ].map((row) => (
                <tr key={row.date} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-5 py-4 text-sm text-on-surface-variant">{row.date}</td>
                  <td className="px-5 py-4 text-sm font-medium text-on-surface">{row.desc}</td>
                  <td className="px-5 py-4 text-sm font-bold text-on-surface">{row.amount}</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <Section title="Change Password">
        <div className="space-y-4 max-w-md">
          <Field label="Current Password" id="cur-pw" type="password" />
          <Field label="New Password" id="new-pw" type="password" hint="Minimum 8 characters with at least one number and symbol." />
          <Field label="Confirm New Password" id="confirm-pw" type="password" />
        </div>
        <div className="flex justify-start pt-2">
          <button
            type="button"
            className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
          >
            Update Password
          </button>
        </div>
      </Section>

      <Section title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
        <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-on-surface">Authenticator App</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Not configured</p>
            </div>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-[#FF5A30] border border-[#FF5A30]/30 px-4 py-2 rounded-lg hover:bg-[#FF5A30]/5 transition-colors"
          >
            Enable
          </button>
        </div>
      </Section>

      <Section title="Active Sessions" description="Devices currently signed in to your account.">
        <div className="space-y-3">
          {[
            { device: "Chrome on macOS", location: "Accra, Ghana", time: "Now", current: true },
            { device: "Safari on iPhone 15", location: "Accra, Ghana", time: "2 hours ago", current: false },
          ].map((s) => (
            <div
              key={s.device}
              className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl"
            >
              <span className="material-symbols-outlined text-on-surface-variant">
                {s.device.includes("iPhone") ? "smartphone" : "laptop_mac"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-on-surface">{s.device}</p>
                <p className="text-xs text-on-surface-variant">
                  {s.location} · {s.time}
                </p>
              </div>
              {s.current ? (
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  This device
                </span>
              ) : (
                <button
                  type="button"
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Danger Zone">
        <div className="flex items-center justify-between p-5 bg-red-50 rounded-xl border border-red-100">
          <div>
            <p className="font-bold text-sm text-red-800">Delete Account</p>
            <p className="text-xs text-red-600 mt-0.5">
              Permanently removes all your data. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </Section>
    </div>
  );
}

const tabContent: Record<Tab, React.ReactNode> = {
  profile: <ProfileTab />,
  venue: <VenueTab />,
  notifications: <NotificationsTab />,
  billing: <BillingTab />,
  security: <SecurityTab />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  return (
    <div className="bg-surface text-on-surface">
      <TopNav />

      <div className="flex pt-16 h-screen">
        <SideNav />

        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
              Promoter Portal
            </span>
            <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
              Settings
            </h1>
            <p className="text-on-surface-variant font-medium">
              Manage your account, venues, and preferences.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container-lowest rounded-xl p-1 mb-8 w-fit shadow-sm flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t.key
                    ? "bg-[#FF5A30] text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tabContent[activeTab]}
        </main>
      </div>
    </div>
  );
}
