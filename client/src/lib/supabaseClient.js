import { createClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Anon key from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-safe initialization to prevent application crash if environment keys are missing initially
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing! Authentication and generation histories will not persist. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
