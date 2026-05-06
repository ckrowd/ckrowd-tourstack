"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import { useTranslations } from 'next-intl';

type Tab = "venue" | "notifications" | "billing" | "security";

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

function VenueTab() {
  const t = useTranslations('SettingsPage.venueTab');
  return (
    <div className="space-y-6">
      {/* Existing Venues */}
      <Section title={t('myVenues.title')} description={t('myVenues.description')}>
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
                      {t('myVenues.statuses.verified')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      {t('myVenues.statuses.pending')}
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
                {t('myVenues.actions.edit')}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('myVenues.actions.addNew')}
        </button>
      </Section>

      {/* Add Venue Form */}
      <Section title={t('venueDetails.title')} description={t('venueDetails.description')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label={t('venueDetails.fields.name')} id="v-name" defaultValue="Alliance Française Accra" />
          <Field label={t('venueDetails.fields.type')} id="v-type" defaultValue="Indoor Theatre" />
          <Field label={t('venueDetails.fields.city')} id="v-city" defaultValue="Accra" />
          <Field label={t('venueDetails.fields.country')} id="v-country" defaultValue="Ghana" />
          <Field label={t('venueDetails.fields.seatedCap')} id="v-cap-seated" defaultValue="800" />
          <Field label={t('venueDetails.fields.standingCap')} id="v-cap-stand" defaultValue="1200" />
          <Field label={t('venueDetails.fields.address')} id="v-address" defaultValue="Alliance Française, Liberation Road" />
          <Field label={t('venueDetails.fields.maps')} id="v-maps" type="url" />
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
          >
            {t('venueDetails.actions.save')}
          </button>
        </div>
      </Section>
    </div>
  );
}

function NotificationsTab() {
  const t = useTranslations('SettingsPage.notificationsTab');
  return (
    <div className="space-y-6">
      <Section title={t('email.title')}>
        <div>
          <Toggle
            label={t('email.toggles.eoiUpdates.label')}
            description={t('email.toggles.eoiUpdates.description')}
            defaultChecked
          />
          <Toggle
            label={t('email.toggles.announcements.label')}
            description={t('email.toggles.announcements.description')}
            defaultChecked
          />
          <Toggle
            label={t('email.toggles.financing.label')}
            description={t('email.toggles.financing.description')}
            defaultChecked
          />
          <Toggle
            label={t('email.toggles.reminders.label')}
            description={t('email.toggles.reminders.description')}
            defaultChecked
          />
          <Toggle
            label={t('email.toggles.settlement.label')}
            description={t('email.toggles.settlement.description')}
            defaultChecked
          />
          <Toggle
            label={t('email.toggles.platform.label')}
            description={t('email.toggles.platform.description')}
          />
        </div>
      </Section>

      <Section title={t('inApp.title')}>
        <div>
          <Toggle label={t('inApp.toggles.eoi')} defaultChecked />
          <Toggle label={t('inApp.toggles.messages')} defaultChecked />
          <Toggle label={t('inApp.toggles.milestones')} defaultChecked />
          <Toggle label={t('inApp.toggles.tips')} />
        </div>
      </Section>

      <Section title={t('digest.title')}>
        <div className="space-y-3">
          {[
            { key: "realTime", label: t('digest.options.realTime') },
            { key: "daily", label: t('digest.options.daily') },
            { key: "weekly", label: t('digest.options.weekly') },
          ].map((opt, i) => (
            <label
              key={opt.key}
              className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
            >
              <input
                type="radio"
                name="digest"
                defaultChecked={i === 0}
                className="accent-[#FF5A30]"
              />
              <span className="text-sm font-semibold text-on-surface">{opt.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
        >
          {t('actions.save')}
        </button>
      </div>
    </div>
  );
}

function BillingTab() {
  const t = useTranslations('SettingsPage.billingTab');
  return (
    <div className="space-y-6">
      <Section title={t('currentPlan.title')}>
        <div className="flex items-center justify-between p-5 bg-[#FF5A30]/5 rounded-xl border border-[#FF5A30]/20">
          <div>
            <p className="font-(family-name:--font-manrope) font-black text-lg text-on-surface">
              {t('currentPlan.proLabel')}
            </p>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {t('currentPlan.proDescription')}
            </p>
          </div>
          <div className="text-right">
            <p className="font-black text-2xl text-[#FF5A30]">$99</p>
            <p className="text-xs text-on-surface-variant">{t('currentPlan.perMonth')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 py-3 border border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all"
          >
            {t('currentPlan.actions.change')}
          </button>
          <button
            type="button"
            className="flex-1 py-3 border border-red-200 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            {t('currentPlan.actions.cancel')}
          </button>
        </div>
      </Section>

      <Section title={t('paymentMethod.title')}>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <div className="w-12 h-8 bg-slate-800 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-black">VISA</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-on-surface">•••• •••• •••• 4242</p>
              <p className="text-xs text-on-surface-variant">{t('paymentMethod.expires')} 08 / 2026</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              {t('paymentMethod.default')}
            </span>
          </div>
          <button
            type="button"
            className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-bold text-on-surface-variant hover:border-[#FF5A30]/40 hover:text-[#FF5A30] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add_card</span>
            {t('paymentMethod.actions.add')}
          </button>
        </div>
      </Section>

      <Section title={t('history.title')}>
        <div className="overflow-hidden rounded-xl border border-outline-variant/10">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {[
                  t('history.table.date'),
                  t('history.table.description'),
                  t('history.table.amount'),
                  t('history.table.status'),
                ].map((h) => (
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
  const t = useTranslations('SettingsPage.securityTab');
  return (
    <div className="space-y-6">
      <Section title={t('password.title')}>
        <div className="space-y-4">
          <Field label={t('password.fields.current')} id="cur-pw" type="password" />
          <Field
            label={t('password.fields.new')}
            id="new-pw"
            type="password"
            hint={t('password.hint')}
          />
          <Field label={t('password.fields.confirm')} id="confirm-pw" type="password" />
        </div>
        <div className="flex justify-start pt-2">
          <button
            type="button"
            className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
          >
            {t('password.actions.update')}
          </button>
        </div>
      </Section>

      <Section title={t('twoFactor.title')} description={t('twoFactor.description')}>
        <div className="flex items-center justify-between p-5 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">smartphone</span>
            </div>
            <div>
              <p className="font-semibold text-sm text-on-surface">{t('twoFactor.authenticator')}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{t('twoFactor.notConfigured')}</p>
            </div>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-[#FF5A30] border border-[#FF5A30]/30 px-4 py-2 rounded-lg hover:bg-[#FF5A30]/5 transition-colors"
          >
            {t('twoFactor.actions.enable')}
          </button>
        </div>
      </Section>

      <Section title={t('sessions.title')} description={t('sessions.description')}>
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
                  {t('sessions.thisDevice')}
                </span>
              ) : (
                <button
                  type="button"
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                >
                  {t('sessions.actions.revoke')}
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('dangerZone.title')}>
        <div className="flex items-center justify-between p-5 bg-red-50 rounded-xl border border-red-100">
          <div>
            <p className="font-bold text-sm text-red-800">{t('dangerZone.delete.title')}</p>
            <p className="text-xs text-red-600 mt-0.5">
              {t('dangerZone.delete.description')}
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-bold text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            {t('dangerZone.actions.delete')}
          </button>
        </div>
      </Section>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const [activeTab, setActiveTab] = useState<Tab>("venue");

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "venue", label: t('tabs.venue'), icon: "stadium" },
    { key: "notifications", label: t('tabs.notifications'), icon: "notifications" },
    { key: "billing", label: t('tabs.billing'), icon: "credit_card" },
    { key: "security", label: t('tabs.security'), icon: "lock" },
  ];

  const tabContent: Record<Tab, React.ReactNode> = {
    venue: <VenueTab />,
    notifications: <NotificationsTab />,
    billing: <BillingTab />,
    security: <SecurityTab />,
  };

  return (
    <div className="bg-surface text-on-surface">
      <TopNav />

      <div className="flex pt-16 h-screen">
        <SideNav />

        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
              {t('promoterPortal')}
            </span>
            <h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
              {t('title')}
            </h1>
            <p className="text-on-surface-variant font-medium">
              {t('description')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-container-lowest rounded-xl p-1 mb-8 w-fit shadow-sm flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-[#FF5A30] text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
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
