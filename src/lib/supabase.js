import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Thiếu VITE_SUPABASE_URL trong file .env.local'
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    'Thiếu VITE_SUPABASE_PUBLISHABLE_KEY trong file .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);