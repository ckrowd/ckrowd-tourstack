import Link from "next/link";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy — TourStack by Crowd" };

export default function PrivacyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-3xl mx-auto w-full">
        <span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
          Legal
        </span>
        <h1 className="font-(family-name:--font-manrope) text-4xl font-extrabold tracking-tight text-on-surface mb-6">
          Privacy Policy
        </h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          Last updated: April 2026
        </p>
        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Information We Collect</h2>
            <p>
              TourStack by Crowd collects information you provide when registering an account,
              submitting an Expression of Interest, or onboarding as a stakeholder. This includes
              your name, email address, phone number, company details, and venue information.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to facilitate tour bookings, verify stakeholder credentials,
              process EOI applications, and communicate platform updates. We do not sell your
              personal data to third parties.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely. For this platform version, certain preferences are
              stored locally in your browser via localStorage. Server-side data is protected
              through industry-standard encryption.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Contact</h2>
            <p>
              For privacy-related enquiries, contact us at{" "}
              <Link href="/contact" className="text-[#FF5A30] font-semibold hover:underline">
                our contact page
              </Link>{" "}
              or email <span className="font-semibold">privacy@ckrowd.africa</span>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
