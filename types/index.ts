// Database Types for College Event Platform

export type EventMode = 'online' | 'offline' | 'hybrid';
export type EventStatus = 'draft' | 'published' | 'cancelled';
export type EventComputedStatus = 'DRAFT' | 'PENDING' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type RegistrationStatus = 'registered' | 'cancelled' | 'waitlisted';
export type UserRole = 'student' | 'organizer' | 'college_admin' | 'super_admin';
export type NotificationType =
  | 'registration_success'
  | 'event_reminder'
  | 'event_cancelled'
  | 'event_updated'
  | 'certificate_ready'
  | 'event_starting_soon';

export interface College {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  city: string | null;
  state: string | null;
  country: string;
  website: string | null;
  email: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  college_id: string | null;
  role: UserRole;
  events_registered: number;
  events_attended: number;
  certificates_earned: number;
  created_at: string;
  updated_at: string;
  college?: College;
}

export interface Organizer {
  id: string;
  user_id: string;
  college_id: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  social_links: Record<string, string>;
  approved: boolean;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  college?: College;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string | null;
  sort_order: number;
  is_active?: boolean;
  created_at: string;
  event_count?: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
  category?: Category;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  college_id: string | null;
  organizer_id: string | null;
  banner_url: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  mode: EventMode;
  meeting_url: string | null;
  start_at: string;
  end_at: string;
  registration_deadline: string | null;
  max_participants: number | null;
  eligibility: string | null;
  rules: string | null;
  prize_info: string | null;
  has_certificate: boolean;
  status: EventStatus;
  approved: boolean;
  featured: boolean;
  tags: string[];
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventWithStatus extends Event {
  category_name: string | null;
  category_slug: string | null;
  category_icon: string | null;
  category_color: string | null;
  college_name: string | null;
  college_slug: string | null;
  college_logo_url: string | null;
  organizer_name: string | null;
  organizer_avatar_url: string | null;
  computed_status: EventComputedStatus;
  registration_count: number;
  interest_count: number;
  attendance_count: number;
}

export interface EventImage {
  id: string;
  event_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
  is_banner: boolean;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface EventScheduleItem {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  type: string;
  sort_order: number;
  created_at: string;
}

export interface EventInterest {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_number: string;
  qr_code: string;
  status: RegistrationStatus;
  registered_at: string;
  cancelled_at: string | null;
  notes: string | null;
  profile?: Profile;
  event?: EventWithStatus;
}

export interface EventAttendance {
  id: string;
  event_id: string;
  user_id: string;
  registration_id: string;
  checked_in_at: string;
  checked_in_by: string | null;
  notes: string | null;
}

export interface EventResult {
  id: string;
  event_id: string;
  position: number;
  user_id: string | null;
  team_name: string | null;
  prize: string | null;
  description: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Certificate {
  id: string;
  event_id: string;
  user_id: string;
  registration_id: string;
  certificate_number: string;
  issued_at: string;
  pdf_url: string | null;
  verified_count: number;
  event?: EventWithStatus;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: NotificationType | null;
  read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// API / Form types
export interface CreateEventInput {
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  category_id: string;
  college_id?: string;
  banner_url?: string;
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  mode: EventMode;
  meeting_url?: string;
  start_at: string;
  end_at: string;
  registration_deadline?: string;
  max_participants?: number;
  eligibility?: string;
  rules?: string;
  prize_info?: string;
  has_certificate: boolean;
  tags?: string[];
}

export interface EventFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  college?: string;
  mode?: EventMode;
  status?: 'upcoming' | 'live' | 'completed';
  sort?: 'newest' | 'popular' | 'date';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Dashboard stats types
export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  liveEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  certificatesIssued: number;
}

export interface AdminStats {
  totalUsers: number;
  totalColleges: number;
  totalOrganizers: number;
  totalEvents: number;
  liveEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  totalCertificates: number;
}
