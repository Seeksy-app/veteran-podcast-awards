import { useNominatedPodcasts } from "@/hooks/useNominatedPodcasts";
import { Award, ExternalLink } from "lucide-react";

export const NominatedPodcastsSection = () => {
  const { data: nominated, isLoading } = useNominatedPodcasts();

  if (isLoading) {
    return (
      <section className="mb-20">
        <div className="mb-8">
          <div className="h-8 w-64 bg-secondary/50 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-secondary/50 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-secondary/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!nominated?.length) return null;

  return (
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
          <span className="text-gold-gradient">Nominated</span>
          <span className="text-foreground"> Podcasts</span>
        </h2>
        <p className="text-muted-foreground">
          Community-nominated podcasts awaiting registration for the awards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nominated.map((pod) => (
          <div
            key={pod.id}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {pod.podcast_name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Nominated by {pod.name}
              </p>
              {pod.podcast_url && (
                <a
                  href={pod.podcast_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
