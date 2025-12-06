import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Episode {
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
}

export interface Podcast {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  rss_url: string;
  website_url: string | null;
  author: string | null;
  episodes: Episode[];
  is_active: boolean;
  display_order: number;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export const usePodcasts = () => {
  return useQuery({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      
      // Parse episodes from JSONB
      return (data || []).map((podcast) => ({
        ...podcast,
        episodes: Array.isArray(podcast.episodes) 
          ? (podcast.episodes as unknown as Episode[]) 
          : [],
      })) as Podcast[];
    },
  });
};

export const parseRSSFeed = async (rssUrl: string, podcastId?: string) => {
  const { data, error } = await supabase.functions.invoke("parse-rss", {
    body: { rssUrl, podcastId },
  });

  if (error) throw error;
  return data;
};
