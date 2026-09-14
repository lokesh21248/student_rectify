import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEventBySlug, getUserInterestedEventIds } from "@/lib/supabase/queries";
import { EventDetailClient } from "./EventDetailClient";
import { auth } from "@clerk/nextjs/server";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };

  return {
    title: event.title,
    description: event.meta_description || event.short_description || event.description?.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.meta_description || event.short_description || undefined,
      images: event.banner_url ? [{ url: event.banner_url, width: 1200, height: 630 }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.meta_description || event.short_description || undefined,
      images: event.banner_url ? [event.banner_url] : undefined,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  // Fetch auth
  const { userId: clerkUserId } = await auth();
  
  let isInterested = false;
  if (clerkUserId) {
    const interestedEventIds = await getUserInterestedEventIds(clerkUserId);
    isInterested = interestedEventIds.has(event.id);
  }

  // Also pass it inside event for generic components if needed
  event.is_interested = isInterested;

  const isRegistered = false; // TODO: Implement if needed
  const registrationData = null;

  return (
    <EventDetailClient
      event={event}
      isRegistered={isRegistered}
      isInterested={isInterested}
      registrationData={registrationData}
      userId={clerkUserId}
    />
  );
}
