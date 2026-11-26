/*
# Notify on new rows via edge function

1. Purpose
- Whenever a new row is inserted into `contact_messages` or `ios_votes`,
  the database sends an HTTP POST to the `notify-new-row` edge function,
  which emails the site owner a summary of the new submission.

2. New objects
- `public.notify_new_row()` — SECURITY DEFINER trigger function that builds
  a JSON payload `{ table, type, record }` and posts it to the edge function
  URL using `pg_net`. It is SECURITY DEFINER so it can use the service role
  URL/key stored in `vault` to reach the edge function without exposing them
  to the anon/authenticated roles.
- `extensions` schema `pg_net` is enabled (extension already available).

3. Triggers
- `contact_messages_notify_insert` AFTER INSERT ON contact_messages.
- `ios_votes_notify_insert` AFTER INSERT ON ios_votes.

4. Security
- `notify_new_row()` is SECURITY DEFINER, owned by postgres.
- EXECUTE is revoked from PUBLIC and anon so only the trigger (running as
  owner) and postgres can call it. authenticated also has no access.
- Secrets (service role key, notify email) are NOT referenced here; the
  edge function reads its own env secrets. The trigger posts with the
  service role key from `vault` so the edge function receives a request
  with full bypass but only receives the new row's columns.
*/

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_new_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  edge_url text;
  service_key text;
BEGIN
  edge_url := current_setting('app.supabase_url', true) || '/functions/v1/notify-new-row';
  service_key := current_setting('app.supabase_service_role_key', true);

  PERFORM net.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key,
      'apikey', service_key
    ),
    body := jsonb_build_object(
      'table', TG_TABLE_NAME,
      'type', TG_OP,
      'record', to_jsonb(NEW)
    )
  );

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_new_row() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS contact_messages_notify_insert ON public.contact_messages;
CREATE TRIGGER contact_messages_notify_insert
AFTER INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_row();

DROP TRIGGER IF EXISTS ios_votes_notify_insert ON public.ios_votes;
CREATE TRIGGER ios_votes_notify_insert
AFTER INSERT ON public.ios_votes
FOR EACH ROW EXECUTE FUNCTION public.notify_new_row();
