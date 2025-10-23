import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  Link,
} from "@tanstack/react-router";
import {
  Grid3X3,
  Image,
  Palette,
  User,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDashboardPrefs,
  CardDensity,
  PosterSize,
  DashboardPrefsProvider,
} from "@/components/context/dashboard-prefs";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase";

const authMiddleware = createMiddleware().server(async ({ next }) => {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw redirect({ to: "/" });
  }

  return await next({
    context: {
      user: user,
    },
  });
});

const getUserFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context?.user,
    };
  });

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: () => getUserFn({} as any),
  loader: ({ context }) => {
    return context.user;
  },
});

function AppSidebar() {
  const user = Route.useLoaderData();
  const navigate = useNavigate();
  const { preferences, setDensity, setPosterSize } = useDashboardPrefs();

  return (
    <div>
      <Sidebar variant="inset">
        <SidebarHeader>
          <Link to="/" className="block">
            <span className="text-2xl font-semibold text-foreground lowercase tracking-tight">
              cinemora
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-4 px-2 py-4">
            {/* Board Density Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Grid3X3 className="h-3 w-3" />
                <span className="font-medium">Density</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "compact", value: "compact" as CardDensity },
                  { label: "normal", value: "normal" as CardDensity },
                  { label: "wide", value: "spacious" as CardDensity },
                ].map(({ label, value }) => (
                  <Button
                    key={label}
                    size="sm"
                    variant="ghost"
                    onClick={() => setDensity(value)}
                    className={`h-7 px-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      preferences.density === value
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Poster Size Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Image className="h-3 w-3" />
                <span className="font-medium">Posters</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: "small", value: "small" as PosterSize },
                  { label: "medium", value: "medium" as PosterSize },
                  { label: "large", value: "large" as PosterSize },
                ].map(({ label, value }) => (
                  <Button
                    key={label}
                    size="sm"
                    variant="ghost"
                    onClick={() => setPosterSize(value)}
                    className={`h-7 px-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      preferences.posterSize === value
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Palette className="h-3 w-3" />
                <span className="font-medium">Theme</span>
              </div>
              <div className="flex justify-center">
                <ModeToggle variant="dashboard" />
              </div>
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="pb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-10 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md transition-all duration-200"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
                      <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                        {user.user_metadata.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-sm font-medium truncate">
                        {user.user_metadata.email}
                      </p>
                    </div>
                  </div>
                  <ChevronUp className="h-3 w-3 opacity-60 flex-shrink-0 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-44 mb-1">
                <DropdownMenuItem
                  className="text-sm h-9 text-muted-foreground cursor-not-allowed opacity-60"
                  disabled
                >
                  <User className="h-3 w-3 mr-2" />
                  Profile
                  <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px] font-medium">
                    Soon
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-sm h-9 text-muted-foreground cursor-not-allowed opacity-60"
                  disabled
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Settings
                  <span className="ml-auto text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-[10px] font-medium">
                    Soon
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-sm h-9 text-destructive focus:text-destructive"
                  onClick={() => navigate({ to: "/logout" })}
                >
                  <LogOut className="h-3 w-3 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

function RouteComponent() {
  return (
    <DashboardPrefsProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "200px",
            "--sidebar-width-mobile": "100px",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="rounded-2xl">
          <header className="flex h-16 shrink-0 items-center gap-2 justify-between">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              {/* <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              /> */}
              {/* <PathBreadcrumbs /> */}
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardPrefsProvider>
  );
}
