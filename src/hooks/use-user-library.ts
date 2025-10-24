import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

export interface LibraryItem {
  id: string;
  mediaId: number;
  mediaType: "movie" | "tv";
  title?: string;
  name?: string;
  posterPath: string;
  voteAverage: number;
  releaseDate?: string;
  firstAirDate?: string;
  status: "to_watch" | "watching" | "watched" | "on_hold";
  addedAt: Date;
  personalRating?: number;
  notes?: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
}

export function useUserLibrary() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["user-library"],
    queryFn: async (): Promise<LibraryItem[]> => {
      const { data, error } = await supabase
        .from("user_library")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw error;

      return data.map((item) => ({
        id: `${item.media_type}-${item.media_id}`,
        mediaId: item.media_id,
        mediaType: item.media_type,
        title: item.title,
        name: item.name,
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
        releaseDate: item.release_date,
        firstAirDate: item.first_air_date,
        status: item.status,
        addedAt: new Date(item.added_at),
        personalRating: item.personal_rating,
        notes: item.notes,
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const addItemMutation = useMutation({
    mutationFn: async ({
      searchResult,
      status = "to_watch",
    }: {
      searchResult: any;
      status?: LibraryItem["status"];
    }) => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("user_library").insert({
        user_id: user.id, // Explicitly pass user_id
        media_id: searchResult.id,
        media_type: searchResult.media_type,
        title: searchResult.title,
        name: searchResult.name,
        poster_path: searchResult.poster_path,
        vote_average: searchResult.vote_average,
        release_date: searchResult.release_date,
        first_air_date: searchResult.first_air_date,
        status,
        added_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Supabase insert error:", error);
        // Handle duplicate key error (item already exists)
        if (error.code === "23505") {
          throw new Error("This item is already in your library");
        }
        throw new Error(`Database error: ${error.message}`);
      }
    },
    onMutate: async ({ searchResult, status }) => {
      await queryClient.cancelQueries({ queryKey: ["user-library"] });

      const previousItems = queryClient.getQueryData<LibraryItem[]>([
        "user-library",
      ]);

      const optimisticItem: LibraryItem = {
        id: `${searchResult.media_type}-${searchResult.id}`,
        mediaId: searchResult.id,
        mediaType: searchResult.media_type,
        title: searchResult.title,
        name: searchResult.name,
        posterPath: searchResult.poster_path,
        voteAverage: searchResult.vote_average,
        releaseDate: searchResult.release_date,
        firstAirDate: searchResult.first_air_date,
        status: status || "to_watch",
        addedAt: new Date(),
        personalRating: undefined,
        notes: undefined,
      };

      queryClient.setQueryData<LibraryItem[]>(["user-library"], (old = []) => {
        // Check if item already exists (prevent duplicates)
        const exists = old.some((item) => item.id === optimisticItem.id);
        return exists ? old : [...old, optimisticItem];
      });

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Item added to your library!");
    },
    onError: (error, _, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData<LibraryItem[]>(
          ["user-library"],
          context.previousItems
        );
      }
      toast.error(`Failed to add item: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Partial<
        Pick<LibraryItem, "status" | "personalRating" | "notes">
      >;
    }) => {
      // Add user authentication check
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const [mediaType, mediaId] = itemId.split("-");

      const { error } = await supabase
        .from("user_library")
        .update({
          ...updates,
          personal_rating: updates.personalRating,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id) // Make sure we're filtering by user_id
        .eq("media_id", parseInt(mediaId))
        .eq("media_type", mediaType);

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
    },
    onMutate: async ({ itemId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["user-library"] });

      const previousItems = queryClient.getQueryData<LibraryItem[]>([
        "user-library",
      ]);

      // Optimistically update the item
      queryClient.setQueryData<LibraryItem[]>(["user-library"], (old = []) =>
        old.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
      );

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Item status updated!");
    },
    onError: (error, _, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["user-library"], context.previousItems);
      }
      toast.error(`Failed to update item: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const [mediaType, mediaId] = itemId.split("-");

      const { error } = await supabase
        .from("user_library")
        .delete()
        .eq("media_id", parseInt(mediaId))
        .eq("media_type", mediaType);

      if (error) throw error;
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["user-library"] });

      const previousItems = queryClient.getQueryData<LibraryItem[]>([
        "user-library",
      ]);

      // Optimistically remove the item
      queryClient.setQueryData<LibraryItem[]>(["user-library"], (old = []) =>
        old.filter((item) => item.id !== itemId)
      );

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Movie removed from library");
    },
    onError: (error, _, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["user-library"], context.previousItems);
      }
      toast.error(`Failed to remove movie: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
    },
  });

  const clearLibraryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_library").delete();

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user-library"] });

      const previousItems = queryClient.getQueryData<LibraryItem[]>([
        "user-library",
      ]);

      // Optimistically clear all items
      queryClient.setQueryData<LibraryItem[]>(["user-library"], []);

      return { previousItems };
    },
    onError: (error, _, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["user-library"], context.previousItems);
      }
      toast.error(`Failed to clear library: ${error.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
    },
  });

  const addItemToColumn = (
    searchResult: any,
    status: LibraryItem["status"] = "to_watch"
  ) => {
    addItemMutation.mutate({ searchResult, status });
  };

  const moveItem = (itemId: string, newStatus: LibraryItem["status"]) => {
    updateItemMutation.mutate({ itemId, updates: { status: newStatus } });
  };

  const removeItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const clearLibrary = () => {
    clearLibraryMutation.mutate();
  };

  return {
    items,
    isLoading,
    addItemToColumn,
    moveItem,
    removeItem,
    clearLibrary,

    //loading states
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingLibrary: clearLibraryMutation.isPending,
  };
}
