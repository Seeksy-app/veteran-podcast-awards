import { useState } from "react";
import { useTopMilitaryPodcasts, usePodchaserSearch, PodchaserPodcast } from "@/hooks/usePodchaserSearch";
import { useAuth } from "@/hooks/useAuth";
import { Search, TrendingUp, Mic, Lock, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PodchaserCard = ({ podcast }: { podcast: PodchaserPodcast }) => {
  return (
    <div className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
      <div className="aspect-square overflow-hidden bg-secondary/30">
        {podcast.imageUrl ? (
          <img
            src={podcast.imageUrl}
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mic className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {podcast.title}
        </h3>
        {podcast.author?.name && (
          <p className="text-xs text-muted-foreground truncate mb-2">
            {podcast.author.name}
          </p>
        )}
        <div className="flex items-center justify-between">
          {podcast.powerScore != null && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">
                {podcast.powerScore}
              </span>
            </div>
          )}
          {podcast.webUrl && (
            <a
              href={podcast.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const PodchaserGrid = ({ podcasts }: { podcasts: PodchaserPodcast[] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {podcasts.map((podcast) => (
        <PodchaserCard key={podcast.id} podcast={podcast} />
      ))}
    </div>
  );
};

const LoadingSkeleton = () => (
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

export const PodchaserDiscoverSection = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: topPodcasts, isLoading: isLoadingTop, error: topError } = useTopMilitaryPodcasts();
  const { data: searchResults, isLoading: isSearching } = usePodchaserSearch(activeSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActiveSearch(searchQuery);
  };

  const isShowingSearch = activeSearch.trim().length >= 2;
  const displayPodcasts = isShowingSearch ? searchResults?.data : topPodcasts?.data;
  const pagination = isShowingSearch ? searchResults?.pagination : topPodcasts?.pagination;

  if (topError) {
    return (
      <section>
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
            <span className="text-foreground">Discover </span>
            <span className="text-gold-gradient">Military & Veteran Podcasts</span>
          </h2>
          <p className="text-muted-foreground">
            Top podcasts ranked by Podchaser Power Score.
          </p>
        </div>
        <div className="text-center py-12 border border-border rounded-xl bg-card">
          <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Podcast discovery is temporarily unavailable. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
            <span className="text-foreground">Discover </span>
            <span className="text-gold-gradient">Military & Veteran Podcasts</span>
          </h2>
          <p className="text-muted-foreground">
            Top podcasts ranked by Podchaser Power Score.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={user ? "Search podcasts..." : "Sign in to search"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!user}
            className="pl-10 h-10 rounded-lg bg-secondary/30 border-border"
          />
        </form>
      </div>

      {isShowingSearch && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isSearching
              ? "Searching..."
              : `${pagination?.total_results || 0} results for "${activeSearch}"`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveSearch("");
              setSearchQuery("");
            }}
          >
            Clear search
          </Button>
        </div>
      )}

      {isLoadingTop || isSearching ? (
        <LoadingSkeleton />
      ) : displayPodcasts?.length ? (
        <>
          <PodchaserGrid podcasts={displayPodcasts} />
          {pagination && pagination.total_results > 25 && !user && (
            <div className="mt-10 text-center py-8 border border-border rounded-xl bg-card/50">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">
                {pagination.total_results - 25} more podcasts available
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a free account to see more results and search the full directory.
              </p>
              <Link to="/auth?mode=signup">
                <Button variant="gold">Sign Up Free</Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 border border-border rounded-xl bg-card">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {isShowingSearch ? "No podcasts found. Try a different search." : "No podcasts found."}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Podcast data provided by{" "}
        <a
          href="https://www.podchaser.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Podchaser
        </a>
      </p>
    </section>
  );
};
