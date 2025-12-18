import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn("[v0] Supabase environment variables not configured, using localStorage only")
    // Return a mock client that won't work but won't crash
    return null as any
  }

  return createBrowserClient(url, key)
}
