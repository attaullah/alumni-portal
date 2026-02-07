import { createBrowserClient } from '@supabase/ssr'

// Use these for client-side interactions (Forms, Search, Photo Uploads)
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Export a singleton instance for easier use in existing components
export const supabase = createClient()