import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/upcoming-features")({
  component: UpcomingFeaturesPage,
});

const features = [
  {
    title: "drag & drop organization",
    description:
      "intuitive drag-and-drop interface for reordering your movie collections",
    status: "current",
    statusText: "in development",
  },
  {
    title: "advanced filtering & search",
    description:
      "filter and sort your collection by genre, year, rating, director, and more",
    status: "upcoming",
  },
  {
    title: "custom collections",
    description:
      'create personalized collections like "favorites", "watch with family", or "award winners"',
    status: "upcoming",
  },
];

function UpcomingFeaturesPage() {
  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="hero-headline text-5xl md:text-7xl lg:text-8xl font-thin leading-none tracking-tight mb-4">
            roadmap
          </h1>
          <p className="hero-subtitle text-lg md:text-xl lg:text-2xl font-normal max-w-md mx-auto leading-relaxed">
            features in development
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border/30"></div>

          <div className="space-y-16">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative flex items-start gap-6"
              >
                <div
                  className={`flex-shrink-0 rounded-full mt-3 ${
                    feature.status === "current"
                      ? "w-4 h-4 bg-primary"
                      : "w-3 h-3 bg-muted-foreground/60"
                  }`}
                ></div>

                <div className="flex-1">
                  <div className="space-y-2">
                    <h3
                      className={`font-thin lowercase tracking-tight text-foreground ${
                        feature.status === "current"
                          ? "text-xl md:text-2xl"
                          : "text-lg md:text-xl"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/70 font-normal leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.statusText && (
                      <p className="text-xs text-muted-foreground/50 font-normal">
                        {feature.statusText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
