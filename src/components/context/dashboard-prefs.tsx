import { createContext, useContext, useCallback, ReactNode } from "react";
import useLocalStorage from "@/hooks/use-local-storage";

export type CardDensity = "compact" | "normal" | "spacious";
export type PosterSize = "small" | "medium" | "large";

interface DashboardPreferences {
  density: CardDensity;
  posterSize: PosterSize;
}

interface DashboardPrefsContextValue {
  preferences: DashboardPreferences;
  setDensity: (density: CardDensity) => void;
  setPosterSize: (posterSize: PosterSize) => void;
  resetPreferences: () => void;
}

const DashboardPrefsContext = createContext<DashboardPrefsContextValue | null>(
  null
);

const defaultPreferences: DashboardPreferences = {
  density: "normal",
  posterSize: "medium",
};

const STORAGE_KEY = "cinemora_dashboard_prefs";

interface DashboardPrefsProviderProps {
  children: ReactNode;
}

export function DashboardPrefsProvider({
  children,
}: DashboardPrefsProviderProps) {
  const [preferences, setPreferences, removePreferences] =
    useLocalStorage<DashboardPreferences>(STORAGE_KEY, defaultPreferences);

  const setDensity = useCallback(
    (density: CardDensity) => {
      setPreferences((prev) => ({ ...prev, density }));
    },
    [setPreferences]
  );

  const setPosterSize = useCallback(
    (posterSize: PosterSize) => {
      setPreferences((prev) => ({ ...prev, posterSize }));
    },
    [setPreferences]
  );

  const resetPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  const contextValue: DashboardPrefsContextValue = {
    preferences,
    setDensity,
    setPosterSize,
    resetPreferences,
  };

  return (
    <DashboardPrefsContext.Provider value={contextValue}>
      {children}
    </DashboardPrefsContext.Provider>
  );
}

export function useDashboardPrefs() {
  const context = useContext(DashboardPrefsContext);
  if (!context) {
    throw new Error(
      "useDashboardPrefs must be used within a DashboardPrefsProvider"
    );
  }
  return context;
}
