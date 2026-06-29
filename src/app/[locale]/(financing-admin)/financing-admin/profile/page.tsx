"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import SignaturePad from "@/components/SignaturePad";

const STORAGE_KEY = "fin_admin_profile";

interface Profile {
  orgName: string;
  contactPerson: string;
  role: string;
  email: string;
  phone: string;
  logo: string | null;
  adminSignature: string | null;
}

function loadProfile(): Profile {
  if (typeof window === "undefined") return emptyProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyProfile(), ...JSON.parse(raw) };
  } catch {}
  return emptyProfile();
}

function emptyProfile(): Profile {
  return {
    orgName: "",
    contactPerson: "",
    role: "",
    email: "",
    phone: "",
    logo: null,
    adminSignature: null,
  };
}

export default function FinancingAdminProfilePage() {
  const t = useTranslations("FinancingAdminProfilePage");
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setSaved(true);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("logo", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const inputClass =
    "w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2";

  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
          {t("badge")}
        </span>
        <h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
          {t("title")}
        </h1>
        <p className="text-on-surface-variant text-sm font-medium max-w-2xl">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identity */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-(family-name:--font-manrope) font-semibold text-base border-b border-outline-variant/15 pb-3">
            {t("sections.identity")}
          </h2>

          {/* Logo */}
          <div>
            <p className={labelClass}>{t("fields.logo")}</p>
            <div className="flex items-center gap-4">
              {profile.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logo}
                  alt="Logo"
                  className="w-16 h-16 rounded-xl object-contain border border-outline-variant/20 bg-white p-1"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant">
                    business
                  </span>
                </div>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest transition-colors"
                >
                  {profile.logo ? t("fields.logoChange") : t("fields.logo")}
                </button>
                <p className="text-[10px] text-on-surface-variant">
                  {t("fields.logoHint")}
                </p>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="fin-org-name">
              {t("fields.orgName")}
            </label>
            <input
              id="fin-org-name"
              type="text"
              value={profile.orgName}
              onChange={(e) => set("orgName", e.target.value)}
              placeholder={t("fields.orgNamePlaceholder")}
              className={inputClass}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="font-(family-name:--font-manrope) font-semibold text-base border-b border-outline-variant/15 pb-3">
            {t("sections.contact")}
          </h2>

          <div>
            <label className={labelClass} htmlFor="fin-contact">
              {t("fields.contactPerson")}
            </label>
            <input
              id="fin-contact"
              type="text"
              value={profile.contactPerson}
              onChange={(e) => set("contactPerson", e.target.value)}
              placeholder={t("fields.contactPersonPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="fin-role">
              {t("fields.role")}
            </label>
            <input
              id="fin-role"
              type="text"
              value={profile.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder={t("fields.rolePlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="fin-email">
              {t("fields.email")}
            </label>
            <input
              id="fin-email"
              type="email"
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder={t("fields.emailPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="fin-phone">
              {t("fields.phone")}
            </label>
            <input
              id="fin-phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder={t("fields.phonePlaceholder")}
              className={inputClass}
            />
          </div>
        </div>

        {/* Admin Signature */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
          <h2 className="font-(family-name:--font-manrope) font-semibold text-base border-b border-outline-variant/15 pb-3 mb-5">
            {t("sections.signatures")}
          </h2>
          <SignaturePad
              value={profile.adminSignature}
              onChange={(v) => set("adminSignature", v)}
              label={t("fields.adminSig")}
              hint={t("fields.adminSigHint")}
            />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          className="px-8 py-3 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
        >
          {t("save")}
        </button>
        {saved && (
          <p className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            {t("saved")}
          </p>
        )}
      </div>
    </>
  );
}
