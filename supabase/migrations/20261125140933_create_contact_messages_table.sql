/*
# Create contact_messages table for contact form submissions

1. New Tables
- `contact_messages`
  - `id` (uuid, primary key)
  - `name` (text, not null) — sender's name
  - `email` (text, not null) — sender's email for replies
  - `organization` (text, nullable) — optional organization name
  - `mission` (text, not null) — the message about their mission/project
  - `created_at` (timestamptz, default now()) — when the message was sent

2. Security
- Enable RLS on `contact_messages`.
- Grant INSERT to `anon` + `authenticated` so visitors can submit messages without signing in.
- Grant SELECT to `service_role` only — only the site owner can read messages; visitors cannot see other people's submissions.
- No UPDATE or DELETE grants for anon/authenticated — messages are immutable once sent.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  mission text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT SELECT ON contact_messages TO service_role;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages"
ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);
