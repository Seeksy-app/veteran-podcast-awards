import { useState, useMemo } from "react";
import { usePodcasts, Podcast } from "@/hooks/usePodcasts";
import { PodcastEpisodesModal } from "./PodcastEpisodesModal";
import { Mic, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const PodcastGrid = () => {
  const { data: podcasts, isLoading } = usePodcasts();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPodcasts = useMemo(() => {
    if (!podcasts) return [];
    if (!searchQuery.trim()) return podcasts;
    
    const query = searchQuery.toLowerCase();
    return podcasts.filter(
      (podcast) =>
        podcast.title.toLowerCase().includes(query) ||
        podcast.author?.toLowerCase().includes(query) ||
        podcast.description?.toLowerCase().includes(query)
    );
  }, [podcasts, searchQuery]);

  const handlePodcastClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative max-w-md mx-auto">
          <div className="h-12 bg-secondary/50 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-secondary/50 rounded-xl mb-3" />
              <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
              <div className="h-3 bg-secondary/50 rounded w-1/2" />
            </div>
          ))}
        </div>
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
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search podcasts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 rounded-xl bg-secondary/30 border-border focus:border-primary"
        />
      </div>

      {filteredPodcasts.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
            No Results Found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredPodcasts.map((podcast) => (
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
      )}

      <PodcastEpisodesModal
        podcast={selectedPodcast}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};
