import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NominatedPodcast {
  id: string;
  podcast_name: string | null;
  podcast_url: string | null;
  name: string;
  notes: string | null;
}

export const useNominatedPodcasts = () => {
  return useQuery({
    queryKey: ["nominated-podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcast_contacts")
        .select("id, podcast_name, podcast_url, name, notes")
        .contains("lists", ["Nominated Podcasts"])
        .not("podcast_name", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as NominatedPodcast[];
    },
  });
};
