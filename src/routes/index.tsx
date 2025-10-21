import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { FeedbackModal } from "@/components/FeedbackModal";

import { Separator } from "@/components/ui/separator";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase";

const getAuthStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      isAuthenticated: false,
    };
  }

  return {
    isAuthenticated: true,
  };
});

export const Route = createFileRoute("/")({
  component: LandingPage,
  beforeLoad: () => getAuthStatusFn(),
  loader: ({ context }) => {
    return context.isAuthenticated;
  },
});

function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = Route.useLoaderData();

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "bug" | "suggestion";
  }>({
    isOpen: false,
    type: "bug",
  });

  const goToDashboard = () => {
    navigate({ to: "/dashboard" });
  };

  const goToSignIn = () => {
    return navigate({ to: "/auth/sign-in" });
  };

  const openFeedbackModal = (type: "bug" | "suggestion") => {
    setFeedbackModal({ isOpen: true, type });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, type: "bug" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ultra-minimal header */}
      <header className="px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-semibold text-foreground lowercase tracking-tight">
            cinemora
          </div>
          <div className="flex items-center space-x-8">
            <ModeToggle />
            <span className="text-sm text-muted-foreground/60 font-light">
              •
            </span>
            {isAuthenticated ? (
              <button
                onClick={goToDashboard}
                className="text-sm font-light text-foreground hover:text-muted-foreground transition-colors duration-200 cursor-pointer"
              >
                dashboard
              </button>
            ) : (
              <button
                onClick={goToSignIn}
                className="text-sm font-light text-foreground hover:text-muted-foreground transition-colors duration-200 cursor-pointer"
              >
                sign in
              </button>
            )}
            <span className="text-sm text-muted-foreground/60 font-light">
              •
            </span>
            <div className="text-sm text-muted-foreground font-light">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Centered hero - the only content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Massive headline */}
          <div className="space-y-4">
            <h1 className="hero-headline text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-thin leading-none tracking-tight">
              your movies
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle text-xl md:text-2xl lg:text-3xl font-light max-w-2xl mx-auto leading-relaxed">
              perfectly organized
            </p>
          </div>

          {/* Enhanced CTA Section */}
          <div className="space-y-8">
            <button
              onClick={goToDashboard}
              className="group relative px-8 py-4 text-lg font-light bg-primary text-primary-foreground transition-all duration-300 tracking-wide rounded-lg border border-primary/20 overflow-hidden"
            >
              <span className="relative z-10">start organizing</span>
              {/* Smooth slider reveal effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/10 via-primary-foreground/5 to-primary-foreground/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
              <div className="absolute bottom-0 left-0 h-0.5 bg-primary-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform duration-600 delay-200 origin-left ease-in-out"></div>
            </button>

            {/* Benefit indicators */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-8 text-sm font-light text-muted-foreground/90">
                <span>personal collections</span>
                <span>•</span>
                <span>watching lists</span>
                <span>•</span>
                <span>smart organization</span>
              </div>
            </div>
          </div>

          <Separator className="my-6 w-24 mx-auto" />

          {/* Enhanced tagline */}
          <div className="space-y-2">
            <p className="text-sm font-light text-muted-foreground/75 max-w-lg mx-auto leading-relaxed">
              Transform your movie-watching experience with intelligent
              organization and beautiful design.
            </p>
          </div>
        </div>
      </main>

      {/* Footer with feedback */}
      <footer className="px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-8 text-sm font-light text-muted-foreground">
            <button
              onClick={() => openFeedbackModal("bug")}
              className="hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              report bug
            </button>
            <span className="text-muted-foreground/60">•</span>
            <button
              onClick={() => openFeedbackModal("suggestion")}
              className="hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              suggest improvement
            </button>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={closeFeedbackModal}
        initialType={feedbackModal.type}
      />
    </div>
  );
}
