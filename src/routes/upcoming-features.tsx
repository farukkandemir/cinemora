import { createFileRoute } from "@tanstack/react-router";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/upcoming-features")({
  component: UpcomingFeaturesPage,
});

function UpcomingFeaturesPage() {
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate({ to: "/dashboard" });
  };

  const goToHome = () => {
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - ultra minimal */}
      <header className="px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="text-2xl font-bold text-foreground lowercase tracking-tight cursor-pointer"
            onClick={goToHome}
          >
            cinemora
          </div>
          <div className="flex items-center space-x-8">
            <ModeToggle />
            <span className="text-sm text-muted-foreground/70 font-normal">
              •
            </span>
            <button
              onClick={goToDashboard}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              dashboard
            </button>
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

      {/* Main Content - timeline layout */}
      <main className="flex-1 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-thin leading-none tracking-tight mb-4">
              roadmap
            </h1>
            <p className="hero-subtitle text-base md:text-lg font-normal max-w-md mx-auto leading-relaxed">
              features in development
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/30"></div>

            <div className="space-y-16">
              {/* Drag & Drop - Current Focus */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-4 h-4 bg-primary rounded-full mt-3"></div>

                <div className="flex-1">
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-thin lowercase tracking-tight text-foreground">
                      drag & drop organization
                    </h3>
                    <p className="text-sm text-muted-foreground/70 font-normal leading-relaxed">
                      intuitive drag-and-drop interface for reordering your
                      movie collections
                    </p>
                    <p className="text-xs text-muted-foreground/50 font-normal">
                      in development
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-3 h-3 bg-muted-foreground/60 rounded-full mt-3"></div>

                <div className="flex-1">
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-thin lowercase tracking-tight text-foreground">
                      social sharing
                    </h3>
                    <p className="text-sm text-muted-foreground/70 font-normal leading-relaxed">
                      share your collections and recommendations with friends
                    </p>
                  </div>
                </div>
              </div>

              {/* Release Tracking */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-3 h-3 bg-muted-foreground/60 rounded-full mt-3"></div>

                <div className="flex-1">
                  <div className="space-y-2">
                    <h3 className="text-lg md:text-xl font-thin lowercase tracking-tight text-foreground">
                      release tracking
                    </h3>
                    <p className="text-sm text-muted-foreground/70 font-normal leading-relaxed">
                      get notified about upcoming releases from your favorite
                      creators
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <button
              onClick={goToDashboard}
              className="px-8 py-4 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 rounded-lg"
            >
              explore your library
            </button>
          </div>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="py-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-sm font-normal text-muted-foreground/60 lowercase tracking-wide">
            built with care for movie lovers
          </div>
        </div>
      </footer>
    </div>
  );
}
