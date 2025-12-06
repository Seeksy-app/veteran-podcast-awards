import { Info } from "lucide-react";

export const PodcastDisclaimer = () => {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
      <div className="flex items-start justify-center gap-3">
        <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground max-w-3xl">
          <strong className="text-foreground">Disclaimer:</strong> The podcasts featured in this directory are independently owned and operated by their respective creators. 
          The Veteran Podcast Awards, National Military Podcast Day, and the Military & Veteran Podcast Network do not claim ownership of any podcast content. 
          Inclusion in this directory does not constitute endorsement of the views or opinions expressed in any podcast.
        </p>
      </div>
    </div>
  );
};
