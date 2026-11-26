/*
# Pass email secrets through trigger request body

1. Purpose
- Edge function secrets (RESEND_API_KEY, NOTIFY_EMAIL) cannot be set via
  the Supabase Management API from this environment. Instead, we store
  them in vault and have the trigger function include them in the POST
  body to the edge function. The edge function reads them from the body.

2. Changes
- `public.notify_new_row()` now reads `resend_api_key` and `notify_email`
  from vault.decrypted_secrets and includes them in the JSON body sent to
  the edge function.
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
  resend_key text;
  notify_to text;
BEGIN
  SELECT decrypted_secret INTO edge_url FROM vault.decrypted_secrets WHERE name = 'supabase_url';
  SELECT decrypted_secret INTO api_key FROM vault.decrypted_secrets WHERE name = 'supabase_anon_key';
  SELECT decrypted_secret INTO resend_key FROM vault.decrypted_secrets WHERE name = 'resend_api_key';
  SELECT decrypted_secret INTO notify_to FROM vault.decrypted_secrets WHERE name = 'notify_email';
  IF edge_url IS NULL OR api_key IS NULL OR resend_key IS NULL OR notify_to IS NULL THEN
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
      'record', to_jsonb(NEW),
      'resend_api_key', resend_key,
      'notify_email', notify_to
    )
  );

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_new_row() FROM PUBLIC, anon, authenticated;
