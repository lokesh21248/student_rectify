import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { MOCK_CATEGORIES, MOCK_EVENTS } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Admin Portal — College Event Platform",
};

export default async function AdminPage() {
  // Check admin session cookie
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  // Fetch live Supabase data in parallel
  const [
    eventsRes,
    categoriesRes,
    collegesRes,
    registrationsRes,
    adminCertsRes,
    regularCertsRes,
    bannersRes,
    servicesRes,
  ] = await Promise.all([
    supabase
      .from("events")
      .select(`
        *,
        categories!category_id(id, name, slug, icon, color),
        colleges!college_id(id, name, slug, logo_url)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("colleges").select("*").order("name"),
    supabase.from("event_registrations").select("*, events!event_id(title)").order("created_at", { ascending: false }).limit(50),
    supabase.from("admin_certificates").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("banners").select("*").order("sort_order"),
    supabase.from("services").select("*, categories!category_id(id, name)").order("sort_order"),
  ]);

  // Use live data if present, or provide seamless fallback
  const rawEvents = eventsRes.data && eventsRes.data.length > 0 ? eventsRes.data : MOCK_EVENTS;
  const categories = categoriesRes.data && categoriesRes.data.length > 0 ? categoriesRes.data : MOCK_CATEGORIES;
  const colleges = collegesRes.data && collegesRes.data.length > 0 ? collegesRes.data : [
    { id: "col-1", name: "Indian Institute of Technology Delhi", city: "New Delhi" },
    { id: "col-2", name: "BITS Pilani", city: "Pilani" },
    { id: "col-3", name: "St. Xavier's College, Mumbai", city: "Mumbai" },
    { id: "col-4", name: "IIM Bangalore", city: "Bengaluru" },
  ];
  const registrations = registrationsRes.data || [];
  // Merge admin_certificates (standalone) + relational certificates, prefer admin_certificates
  const certificates = [
    ...(adminCertsRes.data || []),
    ...(regularCertsRes.data || []),
  ];
  const banners = bannersRes.data || [];
  const services = servicesRes.data || [];

  const now = new Date().toISOString();
  const liveCount = rawEvents.filter((e: any) => e.start_at <= now && e.end_at >= now).length;
  const attendanceCount = registrations.filter((r: any) => r.checked_in || r.status === "attended").length;

  const stats = {
    totalEvents: rawEvents.length,
    liveEvents: liveCount,
    registrations: registrations.length,
    attendance: attendanceCount,
    certificates: certificates.length,
    colleges: colleges.length,
    categories: categories.length,
  };

  return (
    <AdminDashboardClient
      stats={stats}
      initialEvents={rawEvents}
      categories={categories}
      colleges={colleges}
      registrations={registrations}
      certificates={certificates}
      banners={banners}
      services={services}
    />
  );
}
