import { useState } from "react";
import { usePodcasts, Podcast } from "@/hooks/usePodcasts";
import { PodcastEpisodesModal } from "./PodcastEpisodesModal";
import { Mic } from "lucide-react";

export const PodcastGrid = () => {
  const { data: podcasts, isLoading } = usePodcasts();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePodcastClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-secondary/50 rounded-xl mb-3" />
            <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
            <div className="h-3 bg-secondary/50 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!podcasts?.length) {
    return (
      <div className="text-center py-16">
        <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          Coming Soon
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          The Veteran & Military Podcast Network is being curated. 
          Check back soon to discover amazing veteran podcasters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {podcasts.map((podcast) => (
          <button
            key={podcast.id}
            onClick={() => handlePodcastClick(podcast)}
            className="group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl"
          >
            <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-secondary/30 border border-border group-hover:border-primary/50 transition-all group-hover:shadow-lg group-hover:shadow-primary/10">
              {podcast.image_url ? (
                <img
                  src={podcast.image_url}
                  alt={podcast.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Mic className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {podcast.title}
            </h3>
            {podcast.author && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {podcast.author}
              </p>
            )}
          </button>
        ))}
      </div>

      <PodcastEpisodesModal
        podcast={selectedPodcast}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
