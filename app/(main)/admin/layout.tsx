import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { auth } from "@clerk/nextjs/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // If completely unauthenticated, redirect to sign-in
  if (!userId) {
    redirect("/admin/sign-in");
  }

  // If authenticated with Clerk, check administrator role & permissions
  const session = await getAdminSession();

  // If authenticated but not authorized as admin, redirect to /unauthorized
  if (!session) {
    redirect("/unauthorized");
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
