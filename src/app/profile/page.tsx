"use client";

import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";

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

export default function ProfilePage() {
  const { markProfileComplete } = useAuth();

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
              Profile
            </h1>
            <p className="text-on-surface-variant font-medium">
              Manage your company information and public profile.
            </p>
          </div>

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
        </main>
      </div>
    </div>
  );
}
