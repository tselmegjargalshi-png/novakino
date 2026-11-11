import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Anonymous server client. Row Level Security decides what it can read. */
export function createPublicClient(): SupabaseClient {
  if (!url || !anonKey) throw new Error("Supabase is not configured");
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

export function artworkUrl(path: string | null | undefined): string | undefined {
  if (!path || !url) return undefined;
  return `${url}/storage/v1/object/public/artwork/${path.replace(/^\/+/, "")}`;
}
