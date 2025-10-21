import { useTheme } from "next-themes";
import * as React from "react";
import { Moon, Sun } from "lucide-react";

interface ModeToggleProps {
  variant?: "landing" | "dashboard";
}

export function ModeToggle({ variant = "landing" }: ModeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = React.useCallback(() => {
    const newMode = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newMode);
  }, [resolvedTheme, setTheme]);

  // Show a neutral state until mounted to prevent hydration mismatch
  if (!mounted) {
    if (variant === "dashboard") {
      return (
        <button className="flex items-center justify-center w-6 h-6 opacity-50">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
        </button>
      );
    }
    return (
      <button className="flex items-center justify-center w-6 h-6 opacity-50">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
      </button>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="grid grid-cols-2 gap-1">
        {[
          {
            theme: "light",
            label: "light",
            icon: Sun,
            active: resolvedTheme === "light",
          },
          {
            theme: "dark",
            label: "dark",
            icon: Moon,
            active: resolvedTheme === "dark",
          },
        ].map(({ theme, label, icon: Icon, active }) => (
          <button
            key={theme}
            onClick={() => setTheme(theme)}
            className={`h-7 px-1.5 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center ${
              active
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Icon className="h-3 w-3 mr-2" />
            {label}
          </button>
        ))}
      </div>
    );
  }

  // Landing page variant (original design)
  return (
    <button
      onClick={handleThemeToggle}
      className="text-sm font-light text-muted-foreground hover:text-foreground transition-colors duration-200"
    >
      {resolvedTheme === "dark" ? "light" : "dark"}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
