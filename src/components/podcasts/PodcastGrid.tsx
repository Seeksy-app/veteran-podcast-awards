import { useState, useMemo, useRef, useEffect } from "react";
import { usePodcasts, Podcast } from "@/hooks/usePodcasts";
import { useNominatedPodcasts } from "@/hooks/useNominatedPodcasts";
import { useTopMilitaryPodcasts, usePodchaserSearch, type PodchaserPodcast } from "@/hooks/usePodchaserSearch";
import { PodcastEpisodesModal } from "./PodcastEpisodesModal";
import { PodcastChatbot } from "./PodcastChatbot";
import { Mic, Search, Trophy, Users, TrendingUp, Loader2, Plus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SectionHeading({ icon: Icon, title, subtitle, count, tooltip }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  count?: number;
  tooltip?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
        {count != null && count > 0 && (
          <span className="ml-1 text-sm text-muted-foreground">({count})</span>
        )}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function RegisterPlaceholderCards() {
  return (
    <section className="mb-16">
      <SectionHeading
        icon={Trophy}
        title="Featured Podcasts"
        subtitle="Register your podcast to be featured in the 2026 Veteran Podcast Awards"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Link
            key={i}
            to="/auth?mode=signup"
            className="group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl block"
          >
            <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-secondary/30 border-2 border-dashed border-primary/30 group-hover:border-primary transition-all flex flex-col items-center justify-center gap-3 group-hover:shadow-lg group-hover:shadow-primary/10">
              <Plus className="w-10 h-10 text-primary/40 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-primary/60 group-hover:text-primary transition-colors text-center px-4">
                Your Podcast Here
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center group-hover:text-primary transition-colors">
              Add Your Podcast
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PodchaserCard({ podcast }: { podcast: PodchaserPodcast }) {
  return (
    <a
      href={podcast.webUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl block"
    >
      <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-secondary/30 border border-border group-hover:border-primary/50 transition-all group-hover:shadow-lg group-hover:shadow-primary/10">
        {podcast.imageUrl ? (
          <img
            src={podcast.imageUrl}
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
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
      {podcast.author?.name && (
        <p className="text-sm text-muted-foreground line-clamp-1">
          {podcast.author.name}
        </p>
      )}
      {podcast.numberOfEpisodes > 0 && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {podcast.numberOfEpisodes} episodes
        </p>
      )}
    </a>
  );
}

function SearchWithDropdown({
  podcasts,
  searchQuery,
  setSearchQuery,
  activeSearch,
  setActiveSearch,
  searchLoading,
  onSelectPodcast,
}: {
  podcasts: Podcast[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeSearch: string;
  setActiveSearch: (q: string) => void;
  searchLoading: boolean;
  onSelectPodcast: (p: Podcast) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    return podcasts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [podcasts, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setActiveSearch(searchQuery.trim());
      setDropdownOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative max-w-lg mb-10">
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search veteran & military podcasts..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setDropdownOpen(e.target.value.trim().length >= 2);
            if (!e.target.value.trim()) setActiveSearch("");
          }}
          onFocus={() => {
            if (searchQuery.trim().length >= 2) setDropdownOpen(true);
          }}
          className="pl-12 pr-24 h-12 rounded-xl bg-secondary/30 border-border focus:border-primary"
        />
        {searchQuery.trim().length >= 2 && (
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
            disabled={searchLoading}
          >
            {searchLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        )}
      </form>

      {/* Dropdown suggestions from local directory */}
      {dropdownOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((podcast) => (
            <button
              key={podcast.id}
              type="button"
              onClick={() => {
                onSelectPodcast(podcast);
                setDropdownOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
            >
              {podcast.image_url ? (
                <img
                  src={podcast.image_url}
                  alt={podcast.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{podcast.title}</p>
                {podcast.author && (
                  <p className="text-xs text-muted-foreground truncate">{podcast.author}</p>
                )}
              </div>
            </button>
          ))}
          <div className="px-4 py-2 border-t border-border bg-secondary/20">
            <p className="text-xs text-muted-foreground">
              Press Search to find more on Podchaser
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const PodcastGrid = () => {
  const { data: podcasts, isLoading: podcastsLoading } = usePodcasts();
  const { data: nominated } = useNominatedPodcasts();
  const { data: topMilitary, isLoading: topLoading } = useTopMilitaryPodcasts();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const { data: searchResults, isLoading: searchLoading } = usePodchaserSearch(activeSearch);

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

  if (podcastsLoading) {
    return (
      <div className="space-y-8">
        <div className="relative max-w-lg">
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

  return (
    <>
      {/* Search — left-aligned */}
      <SearchWithDropdown
        podcasts={podcasts || []}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSearch={activeSearch}
        setActiveSearch={setActiveSearch}
        searchLoading={searchLoading}
        onSelectPodcast={handlePodcastClick}
      />

      {/* Search results from Podchaser */}
      {activeSearch && searchResults && (
        <section className="mb-16">
          <SectionHeading
            icon={Search}
            title={`Results for "${activeSearch}"`}
            subtitle={`${searchResults.pagination.total_results} podcasts found via Podchaser`}
          />
          {searchResults.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.data.map((podcast) => (
                <PodchaserCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No podcasts found. Try different search terms.
            </p>
          )}
        </section>
      )}

      {/* Tier 1: Register — placeholder cards */}
      {!activeSearch && <RegisterPlaceholderCards />}

      {/* Tier 2: Nominated */}
      {nominated && nominated.length > 0 && !activeSearch && (
        <section className="mb-16">
          <SectionHeading
            icon={Users}
            title="Nominated Podcasts"
            subtitle="Community-nominated shows — nominate a podcast from the directory below"
            count={nominated.length}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {nominated.map((podcast) => (
              <a
                key={podcast.id}
                href={podcast.podcast_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-xl block"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-secondary/30 border border-border group-hover:border-primary/50 transition-all flex items-center justify-center">
                  <Mic className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {podcast.podcast_name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  Nominated by {podcast.name}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tier 3: All Military & Veteran Podcasts */}
      {filteredPodcasts.length > 0 && (
        <section className="mb-16">
          <SectionHeading
            icon={Mic}
            title="All Military & Veteran Podcasts"
            subtitle="Over 4,987 military and veteran podcasts"
            tooltip={
              <p className="text-xs leading-relaxed">
                <strong>Disclaimer:</strong> The podcasts featured in this directory are independently owned and operated by their respective creators. The Veteran Podcast Awards, National Military Podcast Day, and the Military & Veteran Podcast Network do not claim ownership of any podcast content. Inclusion does not constitute endorsement of views or opinions expressed.
              </p>
            }
          />
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
        </section>
      )}

      {/* Tier 4: Discover More from Podchaser */}
      {!activeSearch && (
        <section className="mb-16">
          <SectionHeading
            icon={TrendingUp}
            title="Discover More Podcasts"
            subtitle="Top military & veteran podcasts ranked by Podchaser Power Score"
          />
          {topLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary/50 rounded-xl mb-3" />
                  <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-secondary/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : topMilitary?.data && topMilitary.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {topMilitary.data.map((podcast) => (
                <PodchaserCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Podchaser data is loading — check back shortly.
            </p>
          )}
          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              Powered by <a href="https://www.podchaser.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Podchaser</a>
            </p>
          </div>
        </section>
      )}

      <PodcastEpisodesModal
        podcast={selectedPodcast}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <PodcastChatbot />
    </>
  );
};
