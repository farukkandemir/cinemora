import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { FeedbackModal } from "@/components/FeedbackModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useLocalStorage from "@/hooks/use-local-storage";

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

  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage(
    "hasSeenWelcome",
    false
  );
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const goToDashboard = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth/sign-in" });
    }
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

  useEffect(() => {
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome]);

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    setHasSeenWelcome(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ultra-minimal header */}
      <header className="px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground lowercase tracking-tight">
            cinemora
          </div>
          <div className="flex items-center space-x-8">
            <ModeToggle />
            <span className="text-sm text-muted-foreground/70 font-normal">
              •
            </span>
            {isAuthenticated ? (
              <button
                onClick={goToDashboard}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                dashboard
              </button>
            ) : (
              <button
                onClick={goToSignIn}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
              >
                sign in
              </button>
            )}
            <span className="text-sm text-muted-foreground/70 font-normal">
              •
            </span>
            <div className="text-sm text-muted-foreground/80 font-medium">
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
            <p className="hero-subtitle text-xl md:text-2xl lg:text-3xl font-normal max-w-2xl mx-auto leading-relaxed">
              perfectly organized
            </p>
          </div>

          {/* Enhanced CTA Section */}
          <div className="space-y-8">
            <button
              onClick={goToDashboard}
              className="group relative px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 rounded-lg border border-primary/20 overflow-hidden shadow-md hover:shadow-lg hover:scale-105"
            >
              <span className="relative z-10">start organizing</span>
              {/* Smooth slider reveal effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/10 via-primary-foreground/5 to-primary-foreground/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
              <div className="absolute bottom-0 left-0 h-0.5 bg-primary-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform duration-600 delay-200 origin-left ease-in-out"></div>
            </button>

            {/* Benefit indicators */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-6 text-sm font-normal text-muted-foreground/70">
                <span className="text-muted-foreground/80">
                  personal collections
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-muted-foreground/80">watching lists</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-muted-foreground/80">
                  smart organization
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6 w-24 mx-auto" />

          {/* Enhanced tagline */}
          <div className="space-y-2">
            <p className="text-sm font-normal text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
              Transform your movie-watching experience with{" "}
              <span className="text-muted-foreground/80 font-normal">
                intelligent organization
              </span>{" "}
              and beautiful design.
            </p>
          </div>
        </div>
      </main>

      {/* Footer with feedback */}
      <footer className="px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm font-medium text-muted-foreground/80">
            <button
              onClick={() => openFeedbackModal("bug")}
              className="hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              report bug
            </button>
            <span className="text-muted-foreground/60">•</span>
            <button
              onClick={() => openFeedbackModal("suggestion")}
              className="hover:text-primary transition-colors duration-200 cursor-pointer"
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

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <Dialog open={showWelcomeModal} onOpenChange={handleWelcomeClose}>
          <DialogContent className="sm:max-w-[500px] md:max-w-[550px] bg-background border-border/50 p-0">
            <div className="p-8 pb-6">
              <DialogHeader className="space-y-1 mb-6">
                <DialogTitle className="text-2xl font-normal text-foreground lowercase tracking-tight text-center mb-0">
                  welcome to cinemora
                </DialogTitle>
                <DialogDescription className="text-base font-normal text-muted-foreground text-center">
                  your movie collection organizer is ready
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 dark:text-amber-400 text-lg">
                        ⚡
                      </span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-base font-medium text-amber-800 dark:text-amber-200">
                        Beta Version
                      </h3>
                      <p className="text-sm font-normal text-amber-700 dark:text-amber-300 leading-relaxed">
                        Cinemora is in active development. You may encounter
                        occasional updates, new features appearing, or temporary
                        issues as we improve the experience.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                  <div className="text-sm font-normal text-muted-foreground text-center leading-relaxed">
                    <p className="mb-2">
                      Your feedback helps us build the best movie organizer
                      possible.
                    </p>
                    <p className="text-xs opacity-80">
                      Use the "suggest improvement" link in the footer if you
                      have ideas!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8">
              <div className="flex justify-center">
                <Button
                  onClick={handleWelcomeClose}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  got it, let's go!
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
