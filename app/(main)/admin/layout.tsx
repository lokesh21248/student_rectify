import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/sign-in");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar userRole={session.role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader session={session} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
