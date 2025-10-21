import { queryOptions } from "@tanstack/react-query";

// const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

const BASE_URL = "https://api.themoviedb.org/3";
export const POSTER_BASE_URL = "https://image.tmdb.org/t/p";

const headers = {
  accept: "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
};

const fetchApi = async ({
  path,
  method = "GET",
  data,
}: {
  path: string;
  method: string;
  data?: any;
}) => {
  const stringifiedBody = data ? JSON.stringify(data) : undefined;

  const response = await fetch(path, {
    method,
    headers,
    body: stringifiedBody,
  });

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const result = response.json();

  return result;
};

///// TYPES ///////

interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TvSerie {
  backdrop_path: string;
  first_air_date: string;
  genre_ids: number[];
  id: number;
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}

interface TvSerieDetails {
  adult: boolean;
  backdrop_path: string;
  created_by: any[];
  episode_run_time: number[];
  first_air_date: string;
  genres: any[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: any;
  name: string;
  next_episode_to_air: any;
  networks: any[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: any[];
  production_countries: any[];
  seasons: any[];
  spoken_languages: any[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  credits: any;
  images: any;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  season_number: number;
  still_path: string;
  runtime: number;
}

interface TvSeasonDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episodes: Episode[];
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: any;
  budget: number;
  credits: any;
  genres: any;
  homepage: string;
  id: number;
  images: any;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: any;
  production_countries: any;
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: any;
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

///// TMDB API /////

////////////////////////// MOVIES /////////////////////

const getPopularMovies = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/movie/popular?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as Movie[];
};

const getTopRatedMovies = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/movie/top_rated?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as Movie[];
};

const getUpcomingMovies = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/movie/upcoming?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as Movie[];
};

export const getMovieDetails = async (movieId: string) => {
  const response = await fetchApi({
    path: `${BASE_URL}/movie/${movieId}?append_to_response=images%2Ccredits&language=en-US`,
    method: "GET",
  });

  return response as MovieDetails;
};

const getSimilarMovies = async (movieId: string) => {
  const response = await fetchApi({
    path: `${BASE_URL}/movie/${movieId}/similar?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as Movie[];
};

////////////////////////// TV_SERIES /////////////////////

const getPopularTvSeries = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/popular?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as TvSerie[];
};

const getTopRatedTvSeries = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/top_rated?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as TvSerie[];
};

const getOnTheAirTvSeries = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/on_the_air?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as TvSerie[];
};

const getAiringTodayTvSeries = async () => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/airing_today?language=en-US&page=1`,
    method: "GET",
  });

  return response.results as TvSerie[];
};

export const getTvSerieDetails = async (tvId: string) => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/${tvId}?append_to_response=images%2Ccredits&language=en-US`,
    method: "GET",
  });

  return response as TvSerieDetails;
};

const getSimilarTvSeries = async (tvId: string) => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/${tvId}/similar?language=en-US&page=1`,
    method: "GET",
  });

  const filteredResultsWithVotes = response.results.filter(
    (result: TvSerie) => result.vote_average > 1
  );

  return filteredResultsWithVotes as TvSerie[];
};

////////////////////////// SEARCH /////////////////////

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
  overview: string;
}

const searchMulti = async (query: string) => {
  try {
    const response = await fetchApi({
      path: `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&language=en-US&page=1`,
      method: "GET",
    });

    // Validate response structure
    if (!response || !Array.isArray(response.results)) {
      console.warn("TMDB API returned invalid response structure");
      return [];
    }

    // Filter out any malformed results
    const validResults = response.results.filter((result: any) => {
      return (
        result &&
        typeof result === "object" &&
        result.id &&
        (result.title || result.name) &&
        result.poster_path &&
        (result.media_type === "movie" || result.media_type === "tv")
      );
    });

    return validResults as SearchResult[];
  } catch (error) {
    console.error("TMDB search failed:", error);
    throw error;
  }
};

///// REACT QUERY OPTIONS /////

export const getPopularMoviesOptions = () => {
  return queryOptions({
    queryKey: ["popular-movies"],
    queryFn: () => getPopularMovies(),
  });
};

export const getTopRatedMoviesOptions = () => {
  return queryOptions({
    queryKey: ["top-rated-movies"],
    queryFn: () => getTopRatedMovies(),
  });
};

export const getUpcomingMoviesOptions = () => {
  return queryOptions({
    queryKey: ["upcoming-movies"],
    queryFn: () => getUpcomingMovies(),
  });
};

export const getPopularTvSeriesOptions = () => {
  return queryOptions({
    queryKey: ["popular-tv-series"],
    queryFn: () => getPopularTvSeries(),
  });
};

export const getTopRatedTvSeriesOptions = () => {
  return queryOptions({
    queryKey: ["top-rated-tv-series"],
    queryFn: () => getTopRatedTvSeries(),
  });
};

export const getOnTheAirTvSeriesOptions = () => {
  return queryOptions({
    queryKey: ["on-the-air-tv-series"],
    queryFn: () => getOnTheAirTvSeries(),
  });
};

export const getAiringTodayTvSeriesOptions = () => {
  return queryOptions({
    queryKey: ["airing-today-tv-series"],
    queryFn: () => getAiringTodayTvSeries(),
  });
};

export const getTvSerieDetailsOptions = (tvId: string) => {
  return queryOptions({
    queryKey: ["tv-serie-details", tvId],
    queryFn: () => getTvSerieDetails(tvId),
  });
};

export const getSimilarTvSeriesOptions = (tvId: string) => {
  return queryOptions({
    queryKey: ["similar-tv-series", tvId],
    queryFn: () => getSimilarTvSeries(tvId),
  });
};

const getTvSeasonDetails = async (tvId: string, seasonNumber: number) => {
  const response = await fetchApi({
    path: `${BASE_URL}/tv/${tvId}/season/${seasonNumber}?language=en-US`,
    method: "GET",
  });

  return response as TvSeasonDetails;
};

export const getTvSeasonDetailsOptions = (
  tvId: string,
  seasonNumber: number
) => {
  return queryOptions({
    queryKey: ["tv-season-details", tvId, seasonNumber],
    queryFn: () => getTvSeasonDetails(tvId, seasonNumber),
  });
};

export const getMovieDetailsOptions = (movieId: string) => {
  return queryOptions({
    queryKey: ["movie-details", movieId],
    queryFn: () => getMovieDetails(movieId),
  });
};

export const getSimilarMoviesOptions = (movieId: string) => {
  return queryOptions({
    queryKey: ["similar-movies", movieId],
    queryFn: () => getSimilarMovies(movieId),
  });
};

export const searchMultiOptions = (query: string) => {
  const trimmedQuery = query.trim();
  return queryOptions({
    queryKey: ["search-multi", trimmedQuery],
    queryFn: () => searchMulti(trimmedQuery),
    enabled: trimmedQuery.length >= 2 && trimmedQuery.length <= 50, // Reasonable query length limits
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (invalid queries) or client errors
      if (
        error?.status === 404 ||
        (error?.status >= 400 && error?.status < 500)
      ) {
        return false;
      }
      // Retry up to 2 times for server errors or network issues
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });
};

export type { SearchResult };
