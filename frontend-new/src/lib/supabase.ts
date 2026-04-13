import { createClient } from '@supabase/supabase-js';

// We will use environment variables in Vite (VITE_ prefixed)
// For local dev, you should create a .env.local file.
// If missing, we'll gracefully fallback or log a warning.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://mock-url.supabase.co', 
  supabaseAnonKey || 'mock-key'
);
