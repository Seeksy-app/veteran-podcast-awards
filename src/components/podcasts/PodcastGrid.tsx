import { useState, useMemo } from "react";
import { usePodcasts, Podcast } from "@/hooks/usePodcasts";
import { PodcastEpisodesModal } from "./PodcastEpisodesModal";
import { PodcastChatbot } from "./PodcastChatbot";
import { Mic, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const PodcastGrid = () => {
  const { data: podcasts, isLoading } = usePodcasts();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

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

  const searchSuggestions = useMemo(() => {
    if (!podcasts || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return podcasts
      .filter(
        (podcast) =>
          podcast.title.toLowerCase().includes(query) ||
          podcast.author?.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [podcasts, searchQuery]);

  const handlePodcastClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsModalOpen(true);
  };

  const handleSelectSuggestion = (podcast: Podcast) => {
    setSearchQuery(podcast.title);
    setSearchOpen(false);
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
        <PodcastChatbot />
      </div>
    );
  }

  return (
    <>
      {/* Search Bar with Autocomplete */}
      <div className="relative max-w-md mx-auto mb-10">
        <Popover open={searchOpen && searchSuggestions.length > 0} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search podcasts by title, host, or topic..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setSearchOpen(true);
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim() && searchSuggestions.length > 0) {
                    setSearchOpen(true);
                  }
                }}
                className="pl-12 h-12 rounded-xl bg-secondary/30 border-border focus:border-primary"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="center" onOpenAutoFocus={(e) => e.preventDefault()}>
            <Command>
              <CommandList>
                <CommandEmpty>No podcasts found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  {searchSuggestions.map((podcast) => (
                    <CommandItem
                      key={podcast.id}
                      value={podcast.id}
                      onSelect={() => handleSelectSuggestion(podcast)}
                      className="flex items-center gap-3 py-2 cursor-pointer"
                    >
                      {podcast.image_url ? (
                        <img
                          src={podcast.image_url}
                          alt={podcast.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                          <Mic className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{podcast.title}</p>
                        {podcast.author && (
                          <p className="text-xs text-muted-foreground truncate">by {podcast.author}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {searchQuery && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Showing {filteredPodcasts.length} of {podcasts.length} podcasts
          </p>
        )}
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

      {/* AI Chatbot */}
      <PodcastChatbot />
    </>
  );
};
