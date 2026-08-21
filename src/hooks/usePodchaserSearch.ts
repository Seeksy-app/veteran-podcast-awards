import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PodchaserPodcast {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  webUrl: string | null;
  rssUrl: string | null;
  powerScore: number | null;
  numberOfEpisodes: number;
  language: string;
  status: string;
  categories: { title: string; slug: string }[];
  author: { name: string; email: string | null } | null;
  latestEpisodeDate: string | null;
}

interface PodchaserResponse {
  data: PodchaserPodcast[];
  pagination: {
    page: number;
    per_page: number;
    total_results: number;
    total_pages: number;
    has_more: boolean;
  };
  cached?: boolean;
}

async function callPodchaserProxy(body: Record<string, unknown>): Promise<PodchaserResponse> {
  const { data, error } = await supabase.functions.invoke("podchaser-proxy", {
    body,
  });

  if (error) throw error;
  return data as PodchaserResponse;
}

export const useTopMilitaryPodcasts = (page = 1, enabled = true) => {
  return useQuery({
    queryKey: ["podchaser-top", page],
    queryFn: () => callPodchaserProxy({ action: "top", page, per_page: 25 }),
    enabled,
    staleTime: 1000 * 60 * 60,
  });
};

export const usePodchaserSearch = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["podchaser-search", query, page],
    queryFn: () =>
      callPodchaserProxy({ action: "search", query, page, per_page: 25 }),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 30,
  });
};
