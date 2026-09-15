import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  EventWithStatus,
  EventFilters,
  PaginatedResponse,
  Category,
  Certificate,
  EventRegistration,
  Notification,
} from '@/types';
import { MOCK_CATEGORIES, MOCK_EVENTS } from '@/lib/mock-data';

const DEFAULT_LIMIT = 12;

function filterMockEvents(filters: EventFilters): PaginatedResponse<EventWithStatus> {
  let list = [...MOCK_EVENTS];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.short_description && e.short_description.toLowerCase().includes(q))
    );
  }
  if (filters.category) {
    list = list.filter((e) => e.category_slug === filters.category);
  }
  if (filters.mode) {
    list = list.filter((e) => e.mode === filters.mode);
  }
  if (filters.status) {
    list = list.filter((e) => e.computed_status.toLowerCase() === filters.status?.toLowerCase());
  }
  const page = filters.page || 1;
  const limit = filters.limit || DEFAULT_LIMIT;
  const from = (page - 1) * limit;
  const paged = list.slice(from, from + limit);
  return {
    data: paged,
    total: list.length,
    page,
    limit,
    hasMore: from + limit < list.length,
  };
}

/**
 * Get featured/hero events (featured and published).
 */
export async function getFeaturedEvents(): Promise<EventWithStatus[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('events_with_status')
      .select('*')
      .eq('status', 'published')
      .eq('approved', true)
      .eq('featured', true)
      .in('computed_status', ['UPCOMING', 'LIVE'])
      .order('start_at', { ascending: true })
      .limit(6);

    if (error || !data || data.length === 0) {
      return MOCK_EVENTS.filter((e) => e.featured);
    }
    return data;
  } catch {
    return MOCK_EVENTS.filter((e) => e.featured);
  }
}

/**
 * Get currently live events.
 */
export async function getLiveEvents(): Promise<EventWithStatus[]> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('events_with_status')
      .select('*')
      .eq('status', 'published')
      .eq('approved', true)
      .lte('start_at', now)
      .gte('end_at', now)
      .order('start_at', { ascending: false })
      .limit(6);

    if (error || !data || data.length === 0) {
      return MOCK_EVENTS.filter((e) => e.computed_status === 'LIVE');
    }

    return (data || []).map(transformEvent);
  } catch {
    return MOCK_EVENTS.filter((e) => e.computed_status === 'LIVE');
  }
}

/**
 * Get upcoming events.
 */
export async function getUpcomingEvents(limit = 9): Promise<EventWithStatus[]> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('events_with_status')
      .select('*')
      .eq('status', 'published')
      .eq('approved', true)
      .gt('start_at', now)
      .order('start_at', { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return MOCK_EVENTS.filter((e) => e.computed_status === 'UPCOMING').slice(0, limit);
    }

    return (data || []).map(transformEvent);
  } catch {
    return MOCK_EVENTS.filter((e) => e.computed_status === 'UPCOMING').slice(0, limit);
  }
}

/**
 * Get latest (recently published) events.
 */
export async function getLatestEvents(limit = 8): Promise<EventWithStatus[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('events_with_status')
      .select('*')
      .eq('status', 'published')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return MOCK_EVENTS.slice(0, limit);
    }

    return (data || []).map(transformEvent);
  } catch {
    return MOCK_EVENTS.slice(0, limit);
  }
}

/**
 * Get completed events.
 */
export async function getCompletedEvents(limit = 6): Promise<EventWithStatus[]> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('events_with_status')
      .select('*')
      .eq('status', 'published')
      .eq('approved', true)
      .lt('end_at', now)
      .order('end_at', { ascending: false })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return MOCK_EVENTS.filter((e) => e.computed_status === 'COMPLETED').slice(0, limit);
    }

    return (data || []).map(transformEvent);
  } catch {
    return MOCK_EVENTS.filter((e) => e.computed_status === 'COMPLETED').slice(0, limit);
  }
}

/**
 * Main event listing query with rich filters and pagination.
 */
export async function getEvents(
  filters: EventFilters = {}
): Promise<PaginatedResponse<EventWithStatus>> {
  const {
    search,
    category,
    subcategory,
    college,
    mode,
    status,
    sort = 'newest',
    page = 1,
    limit = DEFAULT_LIMIT,
  } = filters;

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const now = new Date().toISOString();

  try {
    const supabase = await createClient();

    let query = supabase
      .from('events_with_status')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .eq('approved', true);

    if (search) query = query.ilike('title', `%${search}%`);
    if (category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single();
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (college) {
      const { data: col } = await supabase.from('colleges').select('id').eq('slug', college).single();
      if (col) query = query.eq('college_id', col.id);
    }
    if (mode) query = query.eq('mode', mode);
    if (status === 'upcoming') query = query.gt('start_at', now);
    else if (status === 'live') query = query.lte('start_at', now).gte('end_at', now);
    else if (status === 'completed') query = query.lt('end_at', now);

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'date') query = query.order('start_at', { ascending: true });
    else query = query.order('start_at', { ascending: true });

    const { data, count, error } = await query.range(from, to);

    if (error || !data || data.length === 0) {
      return filterMockEvents(filters);
    }

    const total = count ?? 0;
    const transformed = (data || []).map(transformEvent);

    return {
      data: transformed,
      total,
      page,
      limit,
      hasMore: from + limit < total,
    };
  } catch {
    return filterMockEvents(filters);
  }
}

/**
 * Get event by slug with full details.
 */
export async function getEventBySlug(slug: string) {
  try {
    const supabase = await createClient();

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        categories!category_id(id, name, slug, icon, color),
        colleges!college_id(id, name, slug, logo_url, city, state, website),
        organizers!organizer_id(id, name, photo_url, organization_name, college_name, designation, email, phone, website, linkedin, instagram, description)
      `)
      .eq('slug', slug)
      .single();

    if (!error && event) {
      const { data: schedule } = await supabase
        .from('event_schedule')
        .select('*')
        .eq('event_id', event.id)
        .order('sort_order');

      const { data: images } = await supabase
        .from('event_images')
        .select('*')
        .eq('event_id', event.id)
        .order('sort_order');

      const [registrationRes, interestRes] = await Promise.all([
        supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('event_id', event.id).in('status', ['registered', 'attended', 'confirmed']),
        supabase.from('event_interests').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
      ]);

      const { count: attendanceCount } = await supabase
        .from('event_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .or('checked_in.eq.true,status.eq.attended');

      const { data: results } = await supabase
        .from('event_results')
        .select('*, profiles!user_id(name, avatar_url)')
        .eq('event_id', event.id)
        .order('position');

      return {
        ...transformEvent(event),
        schedule: schedule || [],
        images: images || [],
        results: results || [],
        registration_count: registrationRes.count ?? 0,
        interest_count: interestRes.count ?? 0,
        attendance_count: attendanceCount ?? 0,
      };
    }
  } catch (err) {
    console.error('getEventBySlug error:', err);
  }

  // Fallback to mock event
  const mock = MOCK_EVENTS.find((e) => e.slug === slug);
  if (mock) {
    return {
      ...mock,
      schedule: [
        { id: 'sch-1', event_id: mock.id, day_number: 1, title: 'Check-in & Kit Distribution', description: 'Participant verification, security badges, and welcome kits.', start_time: '09:00:00', end_time: '10:30:00', venue_room: 'Main Atrium', speaker_name: 'Organizing Committee', sort_order: 1 },
        { id: 'sch-2', event_id: mock.id, day_number: 1, title: 'Keynote & Problem Statements Release', description: 'Opening address and track problem statement disclosure.', start_time: '11:00:00', end_time: '12:30:00', venue_room: 'Grand Auditorium', speaker_name: 'Dr. Ramesh Sharma', sort_order: 2 },
        { id: 'sch-3', event_id: mock.id, day_number: 1, title: 'Mentorship & Checkpoint 1', description: 'Industry mentors review initial project architecture and provide guidance.', start_time: '14:00:00', end_time: '19:00:00', venue_room: 'Lab Complex B', speaker_name: 'Mentorship Panel', sort_order: 3 },
        { id: 'sch-4', event_id: mock.id, day_number: 2, title: 'Final Demonstrations & Award Ceremony', description: 'Top finalist pitches before VC judges and cash prize distribution.', start_time: '15:00:00', end_time: '18:00:00', venue_room: 'Grand Auditorium', speaker_name: 'Jury Panel', sort_order: 4 },
      ],
      images: [
        { id: 'img-1', event_id: mock.id, image_url: mock.banner_url || '', caption: 'Main stage arena', sort_order: 1 },
      ],
      results: [],
      registration_count: mock.registration_count,
      interest_count: mock.interest_count,
      attendance_count: mock.attendance_count,
    };
  }

  return null;
}

/**
 * Get all categories with event counts.
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return MOCK_CATEGORIES;
    }

    const categoriesWithCounts = await Promise.all(
      data.map(async (cat) => {
        const { count } = await supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', cat.id)
          .eq('status', 'published')
          .eq('approved', true);
        return { ...cat, event_count: count ?? 0 };
      })
    );

    return categoriesWithCounts;
  } catch {
    return MOCK_CATEGORIES;
  }
}

/**
 * Get user's registrations.
 */
export async function getUserRegistrations(clerkUserId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) return [];

  const { data } = await supabase
    .from('event_registrations')
    .select(`
      *,
      events(*, categories!category_id(name, slug, icon, color), colleges!college_id(name))
    `)
    .eq('user_id', profile.id)
    .order('registered_at', { ascending: false });

  return data || [];
}

/**
 * Get user's certificates.
 */
export async function getUserCertificates(clerkUserId: string): Promise<Certificate[]> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) return [];

  const { data } = await supabase
    .from('certificates')
    .select(`
      *,
      events(title, slug, start_at, banner_url, colleges!college_id(name))
    `)
    .eq('user_id', profile.id)
    .order('issued_at', { ascending: false });

  return (data || []) as Certificate[];
}

/**
 * Get certificate by number for verification.
 */
export async function getCertificateByNumber(certificateNumber: string) {
  const supabase = createAdminClient();

  // 1. Try relational query
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        events(title, slug, start_at, end_at, colleges!college_id(name))
      `)
      .eq('certificate_number', certificateNumber)
      .single();

    if (!error && data) {
      return data;
    }
  } catch {}

  // 2. Try simple select
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_number', certificateNumber)
      .single();

    if (!error && data) {
      return data;
    }
  } catch {}

  // 3. Fallback demo data for verification demo
  if (
    certificateNumber === 'CERT-2026-HACK9981' || 
    certificateNumber === 'CERT-2026-000001' || 
    certificateNumber.toUpperCase().startsWith('CERT-DEMO')
  ) {
    return {
      id: 'cert-demo-hackindia',
      certificate_number: certificateNumber,
      recipient_name: 'Aarav Sharma',
      recipient_email: 'aarav.sharma@example.com',
      event_title: 'HackIndia 2026: National Collegiate Hackathon',
      college_name: 'IIT Delhi',
      issue_date: '2026-03-22',
      issued_at: '2026-03-22T10:00:00Z',
      verified_count: 5,
      events: {
        title: 'HackIndia 2026: National Collegiate Hackathon',
        slug: 'hackindia-2026',
        start_at: '2026-03-20T09:00:00Z',
        end_at: '2026-03-22T18:00:00Z',
        colleges: { name: 'IIT Delhi' },
        organizers: { display_name: 'Tech Council IITD' }
      },
      profiles: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com'
      }
    };
  }

  return null;
}

/**
 * Check if a user is registered for an event.
 */
export async function checkUserRegistration(eventId: string, clerkUserId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) return null;

  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', profile.id)
    .single();

  return data;
}

/**
 * Check if a user has marked interest in an event.
 */
export async function checkUserInterest(eventId: string, visitorId: string | null) {
  if (!visitorId) return false;

  const supabase = createAdminClient();

  const { data } = await supabase
    .from('event_interests')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_email', visitorId)
    .single();

  return !!data;
}

// ============================================================
// Helpers
// ============================================================

function transformEvent(event: any): EventWithStatus {
  const cats = event.categories as Record<string, string> | null;
  const college = event.colleges as Record<string, string> | null;
  const org = event.organizers as Record<string, string> | null;

  const now = new Date();
  const start = new Date(event.start_at as string);
  const end = new Date(event.end_at as string);

  let computed_status: string = event.computed_status;
  if (!computed_status) {
    if (event.status === 'cancelled') computed_status = 'CANCELLED';
    else if (event.status === 'draft') computed_status = 'DRAFT';
    else if (!event.approved) computed_status = 'PENDING';
    else if (now < start) computed_status = 'UPCOMING';
    else if (now >= start && now <= end) computed_status = 'LIVE';
    else computed_status = 'COMPLETED';
  }

  return {
    ...(event as unknown as EventWithStatus),
    category_name: event.category_name ?? cats?.name ?? null,
    category_slug: event.category_slug ?? cats?.slug ?? null,
    category_icon: event.category_icon ?? cats?.icon ?? null,
    category_color: event.category_color ?? cats?.color ?? null,
    college_name: event.college_name ?? college?.name ?? null,
    college_slug: event.college_slug ?? college?.slug ?? null,
    college_logo_url: event.college_logo_url ?? college?.logo_url ?? null,
    organizer: event.organizers ?? null,
    organizer_name: event.organizer_name_real ?? event.organizer_name ?? org?.name ?? org?.display_name ?? null,
    organizer_avatar_url: event.organizer_avatar_url ?? org?.photo_url ?? org?.avatar_url ?? null,
    computed_status: computed_status as EventWithStatus['computed_status'],
    registration_count: event.registration_count ?? 0,
    interest_count: event.interest_count ?? 0,
    attendance_count: event.attendance_count ?? 0,
  };
}

/**
 * Get the set of event IDs that the current visitor is interested in.
 */
export async function getUserInterestedEventIds(visitorId: string | null): Promise<Set<string>> {
  if (!visitorId) return new Set();

  try {
    const supabase = createAdminClient();

    const { data } = await supabase
      .from('event_interests')
      .select('event_id')
      .eq('user_email', visitorId);

    if (!data) return new Set();

    return new Set(data.map((d: any) => d.event_id));
  } catch (err) {
    console.error('Error fetching visitor interests:', err);
    return new Set();
  }
}
