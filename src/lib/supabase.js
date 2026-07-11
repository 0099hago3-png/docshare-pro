import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Thiếu VITE_SUPABASE_URL trong file .env.local hoặc Vercel.');
}

if (!supabaseKey) {
  throw new Error('Thiếu VITE_SUPABASE_PUBLISHABLE_KEY trong file .env.local hoặc Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
