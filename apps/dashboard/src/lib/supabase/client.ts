import { createBrowserClient } from "@supabase/ssr";
import { FEATURE_FLAGS } from "../../config";

let cachedClient: any = null;

export function createClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zibtlwmtwpnrxtzfkevm.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key";

  cachedClient = createBrowserClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        if (FEATURE_FLAGS.USE_MOCK_DATA) {
          return Promise.resolve(
            new Response(JSON.stringify({ data: null, user: null, session: null }), {
              status: 200,
              headers: { "Content-Type": "application/json" }
            })
          );
        }
        return fetch(input, init).catch(() => {
          return new Response(JSON.stringify({ data: null, user: null, session: null }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        });
      }
    }
  });

  return cachedClient;
}
