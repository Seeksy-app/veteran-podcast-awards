import { ExternalLink, Play, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NomineeCardProps {
  name: string;
  podcastName: string;
  category: string;
  imageUrl: string;
  description: string;
  episodeCount?: number;
  voteCount?: number;
  onVote?: () => void;
  onPlay?: () => void;
}

export const NomineeCard = ({
  name,
  podcastName,
  category,
  imageUrl,
  description,
  episodeCount = 0,
  voteCount = 0,
  onVote,
  onPlay,
}: NomineeCardProps) => {
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:glow-gold-sm transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={podcastName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Play Button Overlay */}
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center glow-gold">
            <Play className="w-8 h-8 text-primary-foreground ml-1" />
          </div>
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium bg-primary/90 text-primary-foreground px-3 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1 truncate">
          {podcastName}
        </h3>
        <p className="text-sm text-primary mb-3">by {name}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <span>{episodeCount} Episodes</span>
          <span>•</span>
          <span className="text-primary font-medium">{voteCount} Votes</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="gold"
            size="sm"
            className="flex-1"
            onClick={onVote}
          >
            <Vote className="w-4 h-4" />
            Vote
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
