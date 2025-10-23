import { getSupabaseServerClient } from "@/lib/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const exchangeCodeFn = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    console.log("🔄 CALLBACK ROUTE HIT - Processing OAuth code");
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(data.code);

    if (error) {
      console.error("❌ Code exchange failed:", error);
      throw redirect({ to: "/auth/sign-in" });
    }

    console.log("✅ Code exchanged successfully");
    throw redirect({ to: "/dashboard" });
  });

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => {
    console.log("🔍 Callback route search params:", search);
    return {
      code: (search.code as string) || "",
    };
  },
  beforeLoad: async ({ search }) => {
    console.log("📝 Callback beforeLoad - checking for code");
    if (!search.code) {
      console.warn("⚠️ No code parameter found");
      throw redirect({ to: "/auth/sign-in" });
    }

    console.log(
      "🔄 Calling exchangeCodeFn with code:",
      search.code.substring(0, 20) + "..."
    );
    await exchangeCodeFn({ data: { code: search.code } });
  },
});
