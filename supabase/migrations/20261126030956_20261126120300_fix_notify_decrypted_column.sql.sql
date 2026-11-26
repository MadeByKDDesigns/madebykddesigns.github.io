/*
# Fix notify_new_row to use decrypted_secret column

1. Purpose
- The trigger was reading `secret` (the encrypted ciphertext) instead of
  `decrypted_secret` (the plaintext) from vault.decrypted_secrets, causing
  the edge-function URL to be garbage. This migration fixes the column name.

2. Changes
- `public.notify_new_row()` now selects `decrypted_secret` from
  vault.decrypted_secrets.
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
  SELECT decrypted_secret INTO edge_url FROM vault.decrypted_secrets WHERE name = 'supabase_url';
  SELECT decrypted_secret INTO api_key FROM vault.decrypted_secrets WHERE name = 'supabase_anon_key';
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
