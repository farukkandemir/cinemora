import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ultra-minimal header - following landing page pattern */}
      <header className="px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-semibold text-foreground lowercase tracking-tight">
            cinemora
          </div>
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-light text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              back home
            </Link>
            <span className="text-sm text-muted-foreground/60 font-light">
              •
            </span>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Centered auth content - following landing page spacing */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full  space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </main>

      {/* Minimal footer - matching landing page approach */}
      <footer className="px-8 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-xs font-light text-muted-foreground/60 animate-in fade-in-0 duration-700 delay-300">
            secure authentication
          </div>
        </div>
      </footer>
    </div>
  );
}
