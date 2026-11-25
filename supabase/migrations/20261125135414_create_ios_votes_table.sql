/*
# Create ios_votes table for iOS launch votes and email signups

1. New Tables
- `ios_votes`
  - `id` (uuid, primary key)
  - `app_name` (text, not null) — which app the user voted to bring to iOS
  - `email` (text, nullable) — optional email for launch notification
  - `wants_email_notification` (boolean, default false) — whether the user opted into the email list
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `ios_votes`.
- Grant INSERT to `anon` + `authenticated` so visitors can submit votes without signing in.
- Grant SELECT to `service_role` only — the site owner reads votes server-side; visitors cannot read other people's votes or emails.
- No UPDATE or DELETE grants for anon/authenticated — votes are immutable once cast.
- INSERT policy: `TO anon, authenticated WITH CHECK (true)` — any visitor can cast a vote. This is intentionally public write-only data.
*/

CREATE TABLE IF NOT EXISTS ios_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL,
  email text,
  wants_email_notification boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ios_votes ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON ios_votes TO anon, authenticated;
GRANT SELECT ON ios_votes TO service_role;

DROP POLICY IF EXISTS "anon_insert_ios_votes" ON ios_votes;
CREATE POLICY "anon_insert_ios_votes"
ON ios_votes FOR INSERT
TO anon, authenticated
WITH CHECK (true);
