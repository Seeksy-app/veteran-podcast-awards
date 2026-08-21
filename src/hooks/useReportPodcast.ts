import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useReportPodcast() {
  const [reporting, setReporting] = useState<string | null>(null);

  const report = async (podcastId: string, podcastTitle: string, source: "directory" | "podchaser") => {
    setReporting(podcastId);
    try {
      await supabase.from("podcast_reports" as any).insert({
        podcast_id: podcastId,
        podcast_title: podcastTitle,
        source,
      });
    } finally {
      setReporting(null);
    }
  };

  return { report, reporting };
}
