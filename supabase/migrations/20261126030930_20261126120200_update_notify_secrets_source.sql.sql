/*
# Update notify_new_row to read secrets from vault

1. Purpose
- The notify_new_row trigger function now reads the project URL and anon
  key from `vault.decrypted_secrets` instead of custom GUC settings (which
  the database owner role cannot set in this environment).

2. Changes
- `public.notify_new_row()` updated to query vault for the edge-function
  URL and API key, then POST the new row to `notify-new-row`.

3. Security
- SECURITY DEFINER, search_path locked to public, extensions.
- EXECUTE revoked from PUBLIC, anon, authenticated.
*/

CREATE OR REPLACE FUNCTION public.notify_new_row()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, vault
AS $$
DECLARE
  edge_url text;
  api_key text;
BEGIN
  SELECT secret INTO api_key FROM vault.decrypted_secrets WHERE name = 'supabase_anon_key';
  SELECT secret INTO edge_url FROM vault.decrypted_secrets WHERE name = 'supabase_url';
  IF edge_url IS NULL OR api_key IS NULL THEN
    RETURN NEW;
  END IF;

  edge_url := edge_url || '/functions/v1/notify-new-row';

  PERFORM net.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || api_key,
      'apikey', api_key
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
