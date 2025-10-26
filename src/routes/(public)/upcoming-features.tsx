import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/upcoming-features")({
  component: UpcomingFeaturesPage,
});

function UpcomingFeaturesPage() {
  return (
    <main className="flex-1">
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
                    intuitive drag-and-drop interface for reordering your movie
                    collections
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
      </div>
    </main>
  );
}
