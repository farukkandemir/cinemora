import { getSupabaseServerClient } from "@/lib/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const exchangeCodeFn = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(data.code);

    if (error) {
      throw redirect({ to: "/auth/sign-in" });
    }

    // throw redirect({ to: "/dashboard" });
    return { success: true };
  });

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || "",
    };
  },
  beforeLoad: async ({ search }) => {
    if (!search.code) {
      throw redirect({ to: "/auth/sign-in" });
    }

    const { success } = await exchangeCodeFn({ data: { code: search.code } });

    if (success) {
      throw redirect({ to: "/dashboard", replace: true, search: {} });
    }

    throw redirect({ to: "/auth/sign-in" });
  },
});
