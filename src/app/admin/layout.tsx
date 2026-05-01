import TopNav from "@/components/TopNav";
import AdminSideNav from "@/components/AdminSideNav";
import Footer from "@/components/Footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface">
      <TopNav />

      <div className="flex pt-16 h-screen">
        <AdminSideNav />

        <main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
          {children}
          <div className="mt-16">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
