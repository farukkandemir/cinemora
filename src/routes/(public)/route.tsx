import { FeedbackModal } from "@/components/FeedbackModal";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { getAuthStatusFn } from "@/fn/auth";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(public)")({
  component: RouteComponent,
  loader: ({ context }) => {
    return context.queryClient.prefetchQuery({
      queryKey: ["auth-status"],
      queryFn: () => getAuthStatusFn(),
    });
  },
});

function RouteComponent() {
  const navigate = useNavigate();

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "bug" | "suggestion";
  }>({
    isOpen: false,
    type: "bug",
  });

  const { data: isAuthenticated } = useQuery({
    queryKey: ["auth-status"],
    queryFn: () => getAuthStatusFn(),
  });

  const goToDashboard = () => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth/sign-in" });
    }
  };

  const goToSignIn = () => {
    navigate({ to: "/auth/sign-in" });
  };

  const openFeedbackModal = (type: "bug" | "suggestion") => {
    setFeedbackModal({ isOpen: true, type });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ isOpen: false, type: "bug" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground lowercase tracking-tight">
            <Link to="/">cinemora</Link>
          </div>
          <div className="flex items-center space-x-8">
            <ModeToggle />
            <span className="text-sm text-muted-foreground/70 font-normal">
              •
            </span>
            <button
              onClick={() => navigate({ to: "/upcoming-features" })}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              upcoming
            </button>
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

      <div className="flex-1 flex items-center justify-center">
        <Outlet />
      </div>

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

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={closeFeedbackModal}
        initialType={feedbackModal.type}
      />
    </div>
  );
}
