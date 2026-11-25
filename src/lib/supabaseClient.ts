import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjmofzcuxrnqjvwmhiwg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbW9memN1eHJucWp2d21oaXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2MDc3MDYsImV4cCI6MjExMTE4MzcwNn0.tMJevxXXbXAJXBDCWEa6ghrsxBbS1nmXNiAfQn483xE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
