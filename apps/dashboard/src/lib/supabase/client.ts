import { createBrowserClient } from "@supabase/ssr";

let cachedClient: any = null;

export function createClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zibtlwmtwpnrxtzfkevm.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

  cachedClient = createBrowserClient(url, key, {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return cachedClient;
}
