-- ============================================================
-- GALLERY ECOSYSTEM MIGRATION SCRIPT
-- ============================================================

-- 1. Create Galleries table
CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  college_id UUID REFERENCES colleges(id) ON DELETE SET NULL,
  gallery_date TIMESTAMPTZ,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Gallery Media table
CREATE TABLE gallery_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'photo' or 'video'
  title TEXT,
  description TEXT,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  media_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_media ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Public can read published galleries
CREATE POLICY "Public read published galleries" ON galleries FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published gallery media" ON gallery_media FOR SELECT USING (
  gallery_id IN (SELECT id FROM galleries WHERE status = 'published')
);

-- Admins can do everything (Assuming anon full access or authenticated admin policies based on existing project)
CREATE POLICY "Admin full access galleries" ON galleries FOR ALL USING (true);
CREATE POLICY "Admin full access gallery media" ON gallery_media FOR ALL USING (true);

-- 5. Drop the existing view first because we are adding columns
DROP VIEW IF EXISTS events_with_status;

-- 6. Recreate the view including gallery_media_count and organizers
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
  o.name AS organizer_name_real,
  o.photo_url AS organizer_avatar_url,
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
  COALESCE(r.attendance_count, 0) AS attendance_count,
  COALESCE(gm.gallery_media_count, 0) AS gallery_media_count
FROM events e
LEFT JOIN categories c ON c.id = e.category_id
LEFT JOIN colleges col ON col.id = e.college_id
LEFT JOIN organizers o ON o.id = e.organizer_id
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
) i ON i.event_id = e.id
LEFT JOIN (
  SELECT g.event_id, COUNT(gm.id) AS gallery_media_count
  FROM galleries g
  LEFT JOIN gallery_media gm ON gm.gallery_id = g.id
  WHERE g.status = 'published'
  GROUP BY g.event_id
) gm ON gm.event_id = e.id;
