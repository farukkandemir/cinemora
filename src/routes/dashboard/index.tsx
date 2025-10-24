import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { POSTER_BASE_URL, searchMultiOptions } from "@/services/tmdb";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Star,
  Search,
  X,
  Film,
  Tv,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useDashboardPrefs } from "@/components/context/dashboard-prefs";
import { LibraryItem, useUserLibrary } from "@/hooks/use-user-library";

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Types

interface KanbanColumn {
  id: string;
  title: string;
  items: LibraryItem[];
  color: string;
  count: number;
}

// Components
function KanbanCard({
  item,
  onMove,
  onRemove,
  getPosterUrl,
  getPosterDimensions,
}: {
  item: LibraryItem;
  onMove: (itemId: string, newStatus: LibraryItem["status"]) => void;
  onRemove: (itemId: string, itemTitle: string) => void;
  getPosterUrl: (posterPath: string) => string;
  getPosterDimensions: (context: "search" | "card") => string;
}) {
  const {
    personalRating,
    title,
    name,
    posterPath,
    voteAverage,
    releaseDate,
    firstAirDate,
    mediaType,
  } = item;
  const displayTitle = title || name || "Untitled";
  const finalReleaseDate = releaseDate || firstAirDate;
  const year = finalReleaseDate
    ? new Date(finalReleaseDate).getFullYear()
    : null;

  const menuItems = [
    { status: "to_watch" as const, label: "To Watch", icon: "📋" },
    { status: "watching" as const, label: "Watching", icon: "🎬" },
    { status: "watched" as const, label: "Watched", icon: "✅" },
    { status: "on_hold" as const, label: "On Hold", icon: "⏸️" },
  ];

  return (
    <Card
      className={`relative w-full overflow-hidden bg-card border-border/30 cursor-pointer group ${getPosterDimensions("card")}`}
    >
      {/* Background Poster */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${getPosterUrl(posterPath)})`,
        }}
      />

      {/* Movie-like Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

      {/* Media Type Badge - Top Right Corner */}
      <div className="absolute top-1.5 right-1.5 z-10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {mediaType === "tv" ? "TV" : "MOVIE"}
        </span>
      </div>

      {/* Menu Button - Always visible on left side */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 h-7 w-7 p-0 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 text-white shadow-lg z-10"
            title="Move card"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className="w-44 p-1 bg-popover shadow-md rounded-md border-none"
        >
          {menuItems.map(({ status, label, icon }) => (
            <DropdownMenuItem
              key={status}
              onClick={() => onMove(item.id, status)}
              disabled={item.status === status}
              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}</span>
                {item.status === status && (
                  <span className="ml-auto text-muted-foreground">•</span>
                )}
              </span>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              onRemove(item.id, displayTitle);
            }}
            className="px-2 py-1.5 text-sm cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
          >
            <span className="flex items-center gap-2">
              <span>🗑️</span>
              <span>Remove</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        {/* Left Section - Title & Rating */}
        <div className="flex-1 min-w-0">
          <h4
            className="font-semibold text-sm leading-tight line-clamp-1 mb-1"
            style={{
              textShadow:
                "0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(0,0,0,0.6)",
            }}
          >
            {displayTitle}
          </h4>
          <div
            className="flex items-center gap-2 text-xs text-white/95"
            style={{
              textShadow: "0 1px 2px rgba(0,0,0,0.7)",
            }}
          >
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-yellow-400 drop-shadow-sm" />
              <span className="font-medium">{voteAverage.toFixed(1)}</span>
            </div>
            {personalRating && (
              <>
                <span className="text-white/70">•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-blue-400 drop-shadow-sm" />
                  <span className="font-medium">{personalRating}</span>
                </div>
              </>
            )}
            {year && (
              <>
                <span className="text-white/70">•</span>
                <span>{year}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({
  column,
  onMoveItem,
  onRemoveItem,
  columnClassName = "flex-shrink-0 w-72",
  columnPadding = "p-3",
  getPosterUrl,
  getPosterDimensions,
}: {
  column: KanbanColumn;
  onMoveItem: (itemId: string, newStatus: LibraryItem["status"]) => void;
  onRemoveItem: (itemId: string, itemTitle: string) => void;
  columnClassName?: string;
  columnPadding?: string;
  getPosterUrl: (posterPath: string) => string;
  getPosterDimensions: (context: "search" | "card") => string;
}) {
  return (
    <div className={columnClassName}>
      <div
        className={`bg-card/50 border border-border/50 rounded-lg h-full ${columnPadding}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${column.color}`} />
            <span className="font-medium text-sm text-foreground">
              {column.title}
            </span>
            <span className="text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
              {column.count}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2 min-h-[350px]">
          {column.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-3 text-center group cursor-pointer">
              <div className="relative mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center border border-dashed border-muted-foreground/20 group-hover:border-muted-foreground/40 transition-colors duration-200">
                  <Eye className="h-4 w-4 text-muted-foreground/60 group-hover:text-muted-foreground/80 transition-colors duration-200" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Plus className="h-2 w-2 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors duration-200">
                  Empty {column.title.toLowerCase()}
                </p>
                <p className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-200">
                  Click to add movies or TV shows
                </p>
              </div>
            </div>
          ) : (
            column.items.map((item) => (
              <KanbanCard
                key={item.id}
                item={item}
                onMove={onMoveItem}
                onRemove={onRemoveItem}
                getPosterUrl={getPosterUrl}
                getPosterDimensions={getPosterDimensions}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({
  columns,
  onMoveItem,
  onRemoveItem,
  density,
  getPosterUrl,
  getPosterDimensions,
}: {
  columns: KanbanColumn[];
  onMoveItem: (itemId: string, newStatus: LibraryItem["status"]) => void;
  onRemoveItem: (itemId: string, itemTitle: string) => void;
  density: "compact" | "normal" | "spacious";
  getPosterUrl: (posterPath: string) => string;
  getPosterDimensions: (context: "search" | "card") => string;
}) {
  // Define density-based styles using CSS Grid with responsive minmax
  const densityStyles = {
    compact: {
      container: "grid gap-2 h-full overflow-x-auto pb-2",
      // Small screens: minmax for almost full width, larger screens: fixed width
      gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 288px))",
      column: "w-full", // Full width within grid cell
      columnPadding: "p-2", // Tighter padding
    },
    normal: {
      container: "grid gap-4 h-full",
      // Small screens: minmax for almost full width, larger screens: fixed width
      gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 288px))",
      column: "w-full", // Full width within grid cell
      columnPadding: "p-3", // Normal padding
    },
    spacious: {
      container: "grid gap-6 h-full",
      // Small screens: minmax for almost full width, larger screens: fixed width
      gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 288px))",
      column: "w-full", // Full width within grid cell
      columnPadding: "p-4", // More generous padding
    },
  };

  const currentStyle = densityStyles[density];

  return (
    <div className="h-full">
      <div
        className={currentStyle.container}
        style={{ gridTemplateColumns: currentStyle.gridTemplateColumns }}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onMoveItem={onMoveItem}
            onRemoveItem={onRemoveItem}
            columnClassName={currentStyle.column}
            columnPadding={currentStyle.columnPadding}
            getPosterUrl={getPosterUrl}
            getPosterDimensions={getPosterDimensions}
          />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<
    "all" | "movie" | "tv"
  >("all");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemTitle: string;
  }>({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });

  const [selectedColumn, setSelectedColumn] =
    useState<LibraryItem["status"]>("to_watch");

  const { preferences } = useDashboardPrefs();

  // Helper function to get poster URL - always use high quality
  const getPosterUrl = useCallback((posterPath: string) => {
    return `${POSTER_BASE_URL}/w500${posterPath}`;
  }, []);

  // Helper function to get poster dimensions based on size preference
  const getPosterDimensions = useCallback(
    (context: "search" | "card") => {
      if (context === "search") {
        return {
          small: "w-8 h-14",
          medium: "w-10 h-16",
          large: "w-12 h-18",
        }[preferences.posterSize];
      } else {
        return {
          small: "h-20", // Smaller card height
          medium: "h-24", // Normal card height
          large: "h-28", // Larger card height
        }[preferences.posterSize];
      }
    },
    [preferences.posterSize]
  );
  const {
    items: libraryItems,
    isLoading: libraryLoading,
    addItemToColumn,
    moveItem,
    removeItem,
  } = useUserLibrary();

  // Confirmation dialog handlers
  const openConfirmDialog = (itemId: string, itemTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      itemId,
      itemTitle,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      itemId: null,
      itemTitle: "",
    });
  };

  const handleConfirmRemove = () => {
    if (confirmDialog.itemId) {
      removeItem(confirmDialog.itemId);
      closeConfirmDialog();
    }
  };

  // Use custom debounce hook
  const debouncedQuery = useDebounce(searchQuery, 300);

  // TMDB search query with error handling and security measures
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useQuery(searchMultiOptions(debouncedQuery));

  // Filter and validate search results to only show movies and TV shows with valid data
  const filteredSearchResults = useMemo(() => {
    if (!searchResults || searchError || !debouncedQuery.trim()) return [];

    return searchResults.slice(0, 8); // Limit to 8 results
  }, [searchResults, searchError, debouncedQuery]);

  // Filter library items based on media type
  const filteredLibraryItems = useMemo(() => {
    if (mediaTypeFilter === "all") return libraryItems;
    return libraryItems.filter((item) => item.mediaType === mediaTypeFilter);
  }, [libraryItems, mediaTypeFilter]);

  // Create kanban columns with filtered library items
  const columns: KanbanColumn[] = [
    {
      id: "to_watch",
      title: "To Watch",
      items: filteredLibraryItems.filter((item) => item.status === "to_watch"),
      color: "bg-blue-500",
      count: filteredLibraryItems.filter((item) => item.status === "to_watch")
        .length,
    },
    {
      id: "watching",
      title: "Watching",
      items: filteredLibraryItems.filter((item) => item.status === "watching"),
      color: "bg-yellow-500",
      count: filteredLibraryItems.filter((item) => item.status === "watching")
        .length,
    },
    {
      id: "watched",
      title: "Watched",
      items: filteredLibraryItems.filter((item) => item.status === "watched"),
      color: "bg-green-500",
      count: filteredLibraryItems.filter((item) => item.status === "watched")
        .length,
    },
    {
      id: "on_hold",
      title: "On Hold",
      items: filteredLibraryItems.filter((item) => item.status === "on_hold"),
      color: "bg-gray-500",
      count: filteredLibraryItems.filter((item) => item.status === "on_hold")
        .length,
    },
  ];

  if (libraryLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="p-1.5 flex flex-col h-full gap-3">
        {/* Ultra-Compact Search and Filters Row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search TMDB for movies and TV shows..."
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  const limitedValue = value.substring(0, 100);
                  setSearchQuery(limitedValue);
                  setShowDropdown(limitedValue.length > 0);
                }}
                onFocus={() => searchQuery && setShowDropdown(true)}
                onBlur={() => {
                  setTimeout(() => {
                    if (
                      !document.activeElement?.closest("[data-search-dropdown]")
                    ) {
                      setShowDropdown(false);
                    }
                  }, 200);
                }}
                className="pl-10 pr-10 h-8"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setShowDropdown(false);
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Dropdown Search Results */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div
                data-search-dropdown
                className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
              >
                {/* Column Selection Badges */}
                <div className="p-2 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Add to:
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {
                        libraryItems.filter(
                          (item) => item.status === selectedColumn
                        ).length
                      }{" "}
                      in column
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      {
                        status: "to_watch" as const,
                        label: "To Watch",
                        icon: "📋",
                        bgColor: "bg-blue-500",
                      },
                      {
                        status: "watching" as const,
                        label: "Watching",
                        icon: "🎬",
                        bgColor: "bg-yellow-500",
                      },
                      {
                        status: "watched" as const,
                        label: "Watched",
                        icon: "✅",
                        bgColor: "bg-green-500",
                      },
                      {
                        status: "on_hold" as const,
                        label: "On Hold",
                        icon: "⏸️",
                        bgColor: "bg-gray-500",
                      },
                    ].map(({ status, label, icon, bgColor }) => (
                      <button
                        key={status}
                        className={`flex-1 h-6 px-1.5 text-xs font-medium rounded border transition-colors duration-200 ${
                          selectedColumn === status
                            ? `${bgColor} text-white border-transparent`
                            : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColumn(status);
                        }}
                      >
                        <span className="flex items-center justify-center gap-1">
                          <span>{icon}</span>
                          <span className="hidden sm:inline">{label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {searchLoading ? (
                  <div className="flex items-center justify-center py-4 px-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4 animate-pulse" />
                      Searching TMDB...
                    </div>
                  </div>
                ) : searchError ? (
                  <div className="flex flex-col items-center justify-center py-4 px-3 text-center">
                    <X className="h-6 w-6 text-destructive/60 mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Search temporarily unavailable
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Please try again in a moment
                    </p>
                  </div>
                ) : filteredSearchResults.length > 0 ? (
                  <div className="py-1">
                    {filteredSearchResults.map((result) => (
                      <div
                        key={`${result.media_type}-${result.id}`}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            addItemToColumn(result, selectedColumn);
                            setSearchQuery("");
                            setShowDropdown(false);
                          } catch (error) {
                            console.error(
                              "Failed to add item to library:",
                              error
                            );
                          }
                        }}
                      >
                        <img
                          src={getPosterUrl(result.poster_path)}
                          alt={result.title || result.name}
                          className={`object-cover rounded flex-shrink-0 bg-muted ${getPosterDimensions("search")}`}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-movie.jpg";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {result.title || result.name}
                            </h4>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Add to {selectedColumn.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              <span className="text-xs text-muted-foreground">
                                {result.vote_average.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground capitalize">
                              {result.media_type}
                            </span>
                            {result.release_date && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(result.release_date).getFullYear()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : debouncedQuery && searchQuery.length >= 2 ? (
                  <div className="flex flex-col items-center justify-center py-4 px-3 text-center">
                    <Search className="h-6 w-6 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No results found for "{debouncedQuery}"
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Compact Media Type Filter */}
          <div className="flex items-center gap-1">
            {[
              {
                type: "all" as const,
                label: "all",
                count: libraryItems.length,
                icon: null,
              },
              {
                type: "movie" as const,
                label: "movies",
                count: libraryItems.filter((item) => item.mediaType === "movie")
                  .length,
                icon: Film,
              },
              {
                type: "tv" as const,
                label: "tv",
                count: libraryItems.filter((item) => item.mediaType === "tv")
                  .length,
                icon: Tv,
              },
            ].map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                size="sm"
                variant={mediaTypeFilter === type ? "default" : "ghost"}
                onClick={() => setMediaTypeFilter(type)}
                className={`h-7 px-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  mediaTypeFilter === type
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Kanban Board - Maximum Space */}
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            columns={columns}
            onMoveItem={moveItem}
            onRemoveItem={openConfirmDialog}
            density={preferences.density}
            getPosterUrl={getPosterUrl}
            getPosterDimensions={getPosterDimensions}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={closeConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Library</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{confirmDialog.itemTitle}" from
              your library? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
