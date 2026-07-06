"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { getInsuranceAdminProfile, updateInsuranceAdminProfile } from "@/app/actions";
import SignaturePad from "@/components/SignaturePad";

type ServerProfile = {
  org_name?: string | null;
  contact_person?: string | null;
  role?: string | null;
  admin_signature?: string | null;
};

export default function InsuranceAdminProfilePage() {
  const t = useTranslations("InsuranceAdminProfilePage");
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["insuranceAdminProfile"],
    queryFn: getInsuranceAdminProfile,
  });
  const serverProfile = (profileQuery.data?.data ?? null) as ServerProfile | null;

  const [localEdits, setLocalEdits] = useState<{
    orgName?: string;
    contactPerson?: string;
    role?: string;
    adminSignature?: string | null;
    logo?: string | null;
  }>({});

  const profile = {
    orgName: localEdits.orgName ?? serverProfile?.org_name ?? "",
    contactPerson: localEdits.contactPerson ?? serverProfile?.contact_person ?? "",
    role: localEdits.role ?? serverProfile?.role ?? "",
    adminSignature:
      localEdits.adminSignature !== undefined
        ? localEdits.adminSignature
        : (serverProfile?.admin_signature ?? null),
    logo: localEdits.logo !== undefined ? localEdits.logo : null,
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      updateInsuranceAdminProfile({
        orgName: profile.orgName || undefined,
        contactPerson: profile.contactPerson || undefined,
        role: profile.role || undefined,
        adminSignature: profile.adminSignature,
      }),
    onSuccess: (result) => {
      if (result.success) {
        setLocalEdits({});
        void queryClient.invalidateQueries({ queryKey: ["insuranceAdminProfile"] });
      }
    },
  });

  function set<K extends keyof typeof localEdits>(key: K, value: (typeof localEdits)[K]) {
    setLocalEdits((p) => ({ ...p, [key]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("logo", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const inputClass =
    "w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2";

  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-2">
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
                    shield
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
            <label className={labelClass} htmlFor="ins-org-name">
              {t("fields.orgName")}
            </label>
            <input
              id="ins-org-name"
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
            <label className={labelClass} htmlFor="ins-contact">
              {t("fields.contactPerson")}
            </label>
            <input
              id="ins-contact"
              type="text"
              value={profile.contactPerson}
              onChange={(e) => set("contactPerson", e.target.value)}
              placeholder={t("fields.contactPersonPlaceholder")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="ins-role">
              {t("fields.role")}
            </label>
            <input
              id="ins-role"
              type="text"
              value={profile.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder={t("fields.rolePlaceholder")}
              className={inputClass}
            />
          </div>
        </div>

        {/* Signatures */}
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
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="px-8 py-3 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-all disabled:opacity-60"
        >
          {saveMutation.isPending ? t("saving") : t("save")}
        </button>
        {saveMutation.data?.success && (
          <p className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            {t("saved")}
          </p>
        )}
        {saveMutation.isSuccess && !saveMutation.data?.success && (
          <p className="text-sm font-medium text-red-600">{t("saveError")}</p>
        )}
      </div>
    </>
  );
}
