-- =================================================================
-- COLLEGE EVENT PLATFORM (Event_manger) — COMPLETE SUPABASE SQL
-- Copy and paste this entire script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/etwlozgtxkvuptkacrbg/sql/new
-- Then click "Run" (or press Ctrl + Enter)
-- =================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop old conflicting tables if you want a fresh setup (Optional safety)
DROP TABLE IF EXISTS certificate_verifications CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS event_attendance CASCADE;
DROP TABLE IF EXISTS event_interests CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS event_results CASCADE;
DROP TABLE IF EXISTS event_images CASCADE;
DROP TABLE IF EXISTS event_schedule CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;
DROP TABLE IF EXISTS organizers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP VIEW IF EXISTS events_with_status CASCADE;

-- 3. COLLEGES TABLE
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  website TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT 'code-2',
  color TEXT NOT NULL DEFAULT '#6366F1',
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTS TABLE (Matches all frontend fields)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  organizer_name TEXT DEFAULT 'Event Organizing Committee',
  banner_url TEXT,
  venue TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  mode TEXT NOT NULL DEFAULT 'offline' CHECK (mode IN ('online', 'offline', 'hybrid')),
  meeting_url TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  max_participants INT DEFAULT 500,
  eligibility TEXT DEFAULT 'Open to all college students',
  rules TEXT,
  prize_info TEXT,
  has_certificate BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'cancelled')),
  approved BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EVENT SCHEDULE TABLE
CREATE TABLE event_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  day_number INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME,
  venue_room TEXT,
  speaker_name TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVENT REGISTRATIONS TABLE (Public customer registration - no login needed)
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college_name TEXT,
  year_of_study TEXT,
  branch TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, email)
);

-- 8. EVENT INTERESTS TABLE (Bookmarks / likes)
CREATE TABLE event_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_email)
);

-- 9. CERTIFICATES TABLE
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_number TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES event_registrations(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  event_title TEXT NOT NULL,
  college_name TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  qr_code_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADMIN USERS TABLE (Only admin has login!)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. VIEW: events_with_status (Computes LIVE, UPCOMING, COMPLETED and counts)
CREATE OR REPLACE VIEW events_with_status AS
SELECT
  e.*,
  c.name AS category_name,
  c.slug AS category_slug,
  c.icon AS category_icon,
  c.color AS category_color,
  col.name AS college_name,
  col.slug AS college_slug,
  col.logo_url AS college_logo_url,
  CASE
    WHEN e.status = 'cancelled' THEN 'CANCELLED'
    WHEN e.status = 'draft' THEN 'DRAFT'
    WHEN e.approved = FALSE THEN 'PENDING'
    WHEN NOW() < e.start_at THEN 'UPCOMING'
    WHEN NOW() >= e.start_at AND NOW() <= e.end_at THEN 'LIVE'
    ELSE 'COMPLETED'
  END AS computed_status,
  COALESCE(r.registration_count, 0) AS registration_count,
  COALESCE(i.interest_count, 0) AS interest_count,
  COALESCE(r.attendance_count, 0) AS attendance_count
FROM events e
LEFT JOIN categories c ON c.id = e.category_id
LEFT JOIN colleges col ON col.id = e.college_id
LEFT JOIN (
  SELECT
    event_id,
    COUNT(*) AS registration_count,
    COUNT(*) FILTER (WHERE checked_in = TRUE OR status = 'attended') AS attendance_count
  FROM event_registrations
  WHERE status IN ('registered', 'attended')
  GROUP BY event_id
) r ON r.event_id = e.id
LEFT JOIN (
  SELECT event_id, COUNT(*) AS interest_count
  FROM event_interests
  GROUP BY event_id
) i ON i.event_id = e.id;

-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow open reading for visitors
CREATE POLICY "Public read colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read schedule" ON event_schedule FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);

-- Allow public customer event registration
CREATE POLICY "Public insert registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read registrations" ON event_registrations FOR SELECT USING (true);
CREATE POLICY "Public insert interests" ON event_interests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read interests" ON event_interests FOR SELECT USING (true);

-- Allow full access to Service Role (for Admin Operations & APIs)
CREATE POLICY "Service role full access colleges" ON colleges FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access categories" ON categories FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access events" ON events FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access schedule" ON event_schedule FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access registrations" ON event_registrations FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access certificates" ON certificates FOR ALL TO service_role USING (true);
CREATE POLICY "Service role full access admin_users" ON admin_users FOR ALL TO service_role USING (true);

-- Also allow anon insert/update for demo
CREATE POLICY "Anon full access events" ON events FOR ALL TO anon USING (true);
CREATE POLICY "Anon full access registrations" ON event_registrations FOR ALL TO anon USING (true);
CREATE POLICY "Anon full access schedule" ON event_schedule FOR ALL TO anon USING (true);
CREATE POLICY "Anon full access certificates" ON certificates FOR ALL TO anon USING (true);

-- =================================================================
-- SEED DATA: POPULATE REAL CATEGORIES, COLLEGES, AND EVENTS
-- =================================================================

-- Categories
INSERT INTO categories (name, slug, icon, color, description, sort_order)
VALUES
  ('Technical & Coding', 'technical', 'code-2', '#6366F1', 'Hackathons, competitive programming, AI/ML, and dev conferences', 1),
  ('Cultural & Arts', 'cultural', 'music', '#EC4899', 'Music battles, dance fests, drama, and fine arts festivals', 2),
  ('Management & B-Plan', 'management', 'briefcase', '#F59E0B', 'Case studies, startup pitches, marketing and consulting summits', 3),
  ('Gaming & Esports', 'gaming', 'trophy', '#8B5CF6', 'LAN tournaments, battle royale leagues, and speedrunning', 4),
  ('Workshops & Bootcamps', 'workshops', 'presentation', '#10B981', 'Hands-on masterclasses with verified industry certificates', 5),
  ('Sports & Athletics', 'sports', 'award', '#EF4444', 'Inter-collegiate cricket, football, basketball, and track', 6),
  ('Design & Media', 'design', 'cpu', '#06B6D4', 'UI/UX sprints, filmmaking, photography, and graphic battles', 7),
  ('Entrepreneurship', 'entrepreneurship', 'star', '#F97316', 'E-Cell summits, investor meetups, and incubator demo days', 8)
ON CONFLICT (slug) DO NOTHING;

-- Colleges
INSERT INTO colleges (name, slug, logo_url, city, state, country, website, verified)
VALUES
  ('Indian Institute of Technology Delhi', 'iit-delhi', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&h=120&q=80', 'New Delhi', 'Delhi', 'India', 'https://iitd.ac.in', TRUE),
  ('BITS Pilani', 'bits-pilani', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=120&h=120&q=80', 'Pilani', 'Rajasthan', 'India', 'https://bits-pilani.ac.in', TRUE),
  ('St. Xavier''s College, Mumbai', 'st-xaviers-mumbai', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=120&h=120&q=80', 'Mumbai', 'Maharashtra', 'India', 'https://xaviers.edu', TRUE),
  ('IIM Bangalore', 'iim-bangalore', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&h=120&q=80', 'Bengaluru', 'Karnataka', 'India', 'https://iimb.ac.in', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Seed Admin
INSERT INTO admin_users (email, name, role)
VALUES ('admin@eduevents.in', 'Chief Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Seed Events
DO $$
DECLARE
  v_iitd_id UUID;
  v_bits_id UUID;
  v_xaviers_id UUID;
  v_iimb_id UUID;
  v_cat_tech UUID;
  v_cat_cult UUID;
  v_cat_mgmt UUID;
  v_cat_work UUID;
  v_cat_game UUID;
  v_evt_1 UUID;
  v_evt_2 UUID;
  v_evt_3 UUID;
  v_evt_4 UUID;
  v_evt_5 UUID;
BEGIN
  SELECT id INTO v_iitd_id FROM colleges WHERE slug = 'iit-delhi' LIMIT 1;
  SELECT id INTO v_bits_id FROM colleges WHERE slug = 'bits-pilani' LIMIT 1;
  SELECT id INTO v_xaviers_id FROM colleges WHERE slug = 'st-xaviers-mumbai' LIMIT 1;
  SELECT id INTO v_iimb_id FROM colleges WHERE slug = 'iim-bangalore' LIMIT 1;

  SELECT id INTO v_cat_tech FROM categories WHERE slug = 'technical' LIMIT 1;
  SELECT id INTO v_cat_cult FROM categories WHERE slug = 'cultural' LIMIT 1;
  SELECT id INTO v_cat_mgmt FROM categories WHERE slug = 'management' LIMIT 1;
  SELECT id INTO v_cat_work FROM categories WHERE slug = 'workshops' LIMIT 1;
  SELECT id INTO v_cat_game FROM categories WHERE slug = 'gaming' LIMIT 1;

  -- 1. LIVE NOW Event
  INSERT INTO events (
    slug, title, short_description, description, category_id, college_id, organizer_name,
    banner_url, venue, address, city, state, mode, start_at, end_at,
    max_participants, eligibility, rules, prize_info, has_certificate, status, approved, featured, tags
  ) VALUES (
    'hackindia-national-hackathon-2026',
    'HackIndia 2026: The National AI & Web3 Hackathon',
    '36 hours of non-stop innovation, cutting-edge AI architectures, and decentralized apps with mentors from top tech giants.',
    'HackIndia 2026 brings together over 1,500 elite collegiate developers, designers, and innovators across India for an intense 36-hour sprint.\n\nTracks include Generative AI Agents, Zero-Knowledge Cryptography, Autonomous Robotics, and Sustainable Climate Tech. Mentorship from senior engineering leads at Google, Microsoft, and leading Web3 foundations.\n\nTop teams will pitch on the grand stage before venture capital partners and win from a ₹5,00,000 cash prize pool!',
    v_cat_tech, v_iitd_id, 'IITD Computer Science Society',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'Main Auditorium & Computing Complex', 'Hauz Khas, New Delhi', 'New Delhi', 'Delhi', 'hybrid',
    NOW() - INTERVAL '2 hours', NOW() + INTERVAL '34 hours',
    500, 'Open to all enrolled undergraduate and graduate students with a valid college ID.',
    'Teams of 2 to 4 members. Pre-written code is strictly prohibited. All projects must be committed to public GitHub repositories created at kickoff.',
    '₹2,50,000 First Place · ₹1,50,000 Second Place · ₹1,00,000 Track Winners + Direct Interview Waivers',
    TRUE, 'published', TRUE, TRUE, ARRAY['Hackathon', 'AI/ML', 'Web3', 'Cash Prize', 'Certificate']
  ) RETURNING id INTO v_evt_1;

  -- 2. Upcoming Tech Symposium
  INSERT INTO events (
    slug, title, short_description, description, category_id, college_id, organizer_name,
    banner_url, venue, address, city, state, mode, start_at, end_at,
    max_participants, eligibility, rules, prize_info, has_certificate, status, approved, featured, tags
  ) VALUES (
    'technosphere-annual-tech-symposium-2026',
    'Technosphere 2026: Annual Tech Symposium',
    'Three action-packed days of competitive robotics, quantum computing keynotes, and drone racing leagues.',
    'Technosphere is Central India premier annual technical festival. Featuring 25+ flagship events spanning robotics combat, autonomous drone challenges, algorithm design championships, and keynote talks by pioneering scientists.',
    v_cat_tech, v_bits_id, 'Robotics & Innovation Club',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    'BITS Pilani Campus Ground', 'Pilani, Rajasthan', 'Pilani', 'Rajasthan', 'offline',
    NOW() + INTERVAL '3 days', NOW() + INTERVAL '5 days',
    1200, 'Engineering and technology students from recognized institutions.',
    'Participants must carry safety gear for robotics arenas. Decisions of the technical committee are final.',
    '₹3,00,000 Grand Prize Pool across 12 competitive tracks.',
    TRUE, 'published', TRUE, TRUE, ARRAY['Robotics', 'Drones', 'Competitive', 'Symposium']
  ) RETURNING id INTO v_evt_2;

  -- 3. Cultural Battle of the Bands
  INSERT INTO events (
    slug, title, short_description, description, category_id, college_id, organizer_name,
    banner_url, venue, address, city, state, mode, start_at, end_at,
    max_participants, eligibility, rules, prize_info, has_certificate, status, approved, featured, tags
  ) VALUES (
    'rhythm-and-beats-battle-of-bands-2026',
    'Rhythm & Beats: National Inter-College Battle of Bands',
    'Electrifying live performances, rock fusion faceoffs, and acoustic showdowns judged by celebrity musicians.',
    'Get ready for high-octane rock, jazz, classical fusion, and indie anthems! 16 finalist bands battle on the illuminated open-air amphitheater with professional lighting and sound rigs.',
    v_cat_cult, v_xaviers_id, 'Xavier Music Circle',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'St. Xavier Amphitheatre', '5 Mahapalika Marg, Mumbai', 'Mumbai', 'Maharashtra', 'offline',
    NOW() + INTERVAL '6 days', NOW() + INTERVAL '8 days',
    800, 'College bands with minimum 3 and maximum 8 members.',
    'Original compositions receive bonus points. Performance time limit is 20 minutes including sound check.',
    '₹1,50,000 + Studio Recording Contract with SoundScape Records.',
    TRUE, 'published', TRUE, TRUE, ARRAY['Music', 'Live Band', 'Battle of the Bands', 'Rock']
  ) RETURNING id INTO v_evt_3;

  -- 4. B-Plan Summit
  INSERT INTO events (
    slug, title, short_description, description, category_id, college_id, organizer_name,
    banner_url, venue, address, city, state, mode, start_at, end_at,
    max_participants, eligibility, rules, prize_info, has_certificate, status, approved, featured, tags
  ) VALUES (
    'venture-forge-national-bplan-challenge',
    'VentureForge: National Startup B-Plan Summit',
    'Pitch your venture to top angel syndicates, receive term sheet evaluations, and unlock seed grants.',
    'VentureForge is India most prestigious collegiate entrepreneurship summit. More than 40 leading angel investors and venture capitalists assemble to hear high-growth pitches in fintech, healthtech, climatetech, and SaaS.',
    v_cat_mgmt, v_iimb_id, 'E-Cell IIMB',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
    'IIM Bangalore Executive Conference Hall', 'Bannerghatta Main Rd, Bengaluru', 'Bengaluru', 'Karnataka', 'hybrid',
    NOW() + INTERVAL '9 days', NOW() + INTERVAL '11 days',
    300, 'Student-founded startups with minimum viable prototype or pilot data.',
    '5-minute pitch followed by 5 minutes of Q&A with the jury panel.',
    '₹10,00,000 Seed Grant Pool + Incubation at NSRCEL',
    TRUE, 'published', TRUE, TRUE, ARRAY['Startup', 'Pitch', 'Funding', 'Entrepreneurship']
  ) RETURNING id INTO v_evt_4;

  -- 5. AI Workshop
  INSERT INTO events (
    slug, title, short_description, description, category_id, college_id, organizer_name,
    banner_url, venue, address, city, state, mode, start_at, end_at,
    max_participants, eligibility, rules, prize_info, has_certificate, status, approved, featured, tags
  ) VALUES (
    'fullstack-ai-agents-hands-on-masterclass',
    'Building Autonomous AI Agents with LangChain & Next.js',
    'Interactive full-day masterclass covering multi-agent orchestration, RAG vector pipelines, and production deployments.',
    'Step-by-step masterclass with hands-on labs. Build and deploy production-ready AI agents capable of reasoning, utilizing external tools, and executing complex workflows. All attendees receive verified credentials.',
    v_cat_work, v_iitd_id, 'IITD Computer Science Society',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'Online Webinar + Discord Lab Room', NULL, NULL, NULL, 'online',
    NOW() + INTERVAL '13 days', NOW() + INTERVAL '14 days',
    1000, 'Familiarity with JavaScript/TypeScript or Python recommended.',
    'Lab exercises must be submitted before deadline to qualify for certificate.',
    'Exclusive API credits from cloud sponsors + Certificate of Completion.',
    TRUE, 'published', TRUE, FALSE, ARRAY['AI Agents', 'Workshop', 'LangChain', 'Certificate', 'Online']
  ) RETURNING id INTO v_evt_5;

  -- Schedules
  IF v_evt_1 IS NOT NULL THEN
    INSERT INTO event_schedule (event_id, day_number, title, description, start_time, end_time, venue_room, speaker_name, sort_order)
    VALUES
      (v_evt_1, 1, 'Check-in & Kit Distribution', 'Participant badge verification and welcome swags.', '09:00:00', '10:30:00', 'Main Atrium', 'Organizing Committee', 1),
      (v_evt_1, 1, 'Keynote & Problem Statements Release', 'Opening address and track problem statement disclosure.', '11:00:00', '12:30:00', 'Grand Auditorium', 'Dr. Ramesh Sharma', 2),
      (v_evt_1, 1, 'Mentorship & Checkpoint 1', 'Industry mentors review initial project architecture and provide guidance.', '14:00:00', '19:00:00', 'Lab Complex B', 'Mentorship Panel', 3),
      (v_evt_1, 2, 'Final Demonstrations & Award Ceremony', 'Top finalist pitches before VC judges and cash prize distribution.', '15:00:00', '18:00:00', 'Grand Auditorium', 'Jury Panel', 4);
  END IF;

  -- Sample Registrations for HackIndia
  IF v_evt_1 IS NOT NULL THEN
    INSERT INTO event_registrations (event_id, registration_number, name, email, phone, college_name, status, checked_in)
    VALUES
      (v_evt_1, 'EVT-26-HACK01', 'Aarav Sharma', 'aarav@iitd.ac.in', '+91 9876543210', 'IIT Delhi', 'attended', TRUE),
      (v_evt_1, 'EVT-26-HACK02', 'Priya Patel', 'priya.p@bits-pilani.ac.in', '+91 9876543211', 'BITS Pilani', 'attended', TRUE),
      (v_evt_1, 'EVT-26-HACK03', 'Rohan Verma', 'rohan@xaviers.edu', '+91 9876543212', 'St. Xavier Mumbai', 'registered', FALSE),
      (v_evt_1, 'EVT-26-HACK04', 'Sneha Kulkarni', 'sneha@iimb.ac.in', '+91 9876543213', 'IIM Bangalore', 'registered', FALSE);
  END IF;

  -- Sample Certificate for Aarav
  IF v_evt_1 IS NOT NULL THEN
    INSERT INTO certificates (certificate_number, event_id, recipient_name, recipient_email, event_title, college_name, issue_date)
    VALUES
      ('CERT-2026-HACK9981', v_evt_1, 'Aarav Sharma', 'aarav@iitd.ac.in', 'HackIndia 2026: The National AI & Web3 Hackathon', 'Indian Institute of Technology Delhi', CURRENT_DATE);
  END IF;

END $$;
