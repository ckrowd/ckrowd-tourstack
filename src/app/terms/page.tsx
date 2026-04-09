import Link from "next/link";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

export const metadata = { title: "Terms of Service — TourStack by Crowd" };

export default function TermsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 pt-28 pb-20 px-6 md:px-12 max-w-3xl mx-auto w-full">
        <span className="text-[#FF5A30] font-bold uppercase tracking-widest text-xs mb-4 block">
          Legal
        </span>
        <h1 className="font-(family-name:--font-manrope) text-4xl font-extrabold tracking-tight text-on-surface mb-6">
          Terms of Service
        </h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          Last updated: April 2026
        </p>
        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using TourStack by Crowd, you agree to be bound by these Terms of
              Service. If you do not agree, you may not use the platform.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. Platform Use</h2>
            <p>
              TourStack is a B2B platform connecting promoters, service providers, and workforce
              professionals in the Pan-African live events industry. Use of the platform is
              restricted to registered businesses and verified individuals.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Accuracy of Information</h2>
            <p>
              You agree to provide accurate, current, and complete information during registration
              and throughout your use of the platform. Misrepresentation may result in account
              suspension or removal.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Intellectual Property</h2>
            <p>
              All content, branding, and platform design are the property of Ckrowd Africa
              Technologies. Unauthorised reproduction or distribution is prohibited.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Contact</h2>
            <p>
              For terms-related enquiries, visit our{" "}
              <Link href="/contact" className="text-[#FF5A30] font-semibold hover:underline">
                contact page
              </Link>{" "}
              or email <span className="font-semibold">legal@ckrowd.africa</span>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
