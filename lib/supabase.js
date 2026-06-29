import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 1. Public client using ANON KEY (Used on frontend, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Admin client using SERVICE ROLE KEY (Used in API routes only, bypasses RLS)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

