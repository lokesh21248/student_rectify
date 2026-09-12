import { Navigation } from "@/components/navigation/Navigation";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Footer } from "@/components/navigation/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <div className="flex-1">
        {children}
      </div>
      
      <Footer />
      <MobileNav />
      {/* Mobile bottom nav spacing — only on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
