import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { config } from "dotenv";

// Server-side client for TanStack Start (official way)
export function getSupabaseServerClient() {
  // Ensure environment variables are loaded
  config();

  return createServerClient(
    process.env.SUPABASE_URL!, // Note: server-side env vars
    process.env.SUPABASE_ANON_KEY!, // Note: server-side env vars
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value);
          });
        },
      },
    }
  );
}
