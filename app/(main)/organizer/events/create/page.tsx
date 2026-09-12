import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/supabase/queries";
import { CreateEventForm } from "@/components/organizer/CreateEventForm";

export const metadata: Metadata = { title: "Create Event" };

export default async function CreateEventPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("clerk_user_id", userId)
    .single();

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", profile?.id)
    .single();

  if (!organizer) redirect("/organizer");

  const categories = await getCategories();

  return (
    <div className="container-page py-8 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Event</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the details below to create and publish your event.</p>
      </div>
      <CreateEventForm categories={categories} organizerId={organizer.id} />
    </div>
  );
}
