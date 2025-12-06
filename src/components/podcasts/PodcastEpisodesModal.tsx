import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink, Clock, Calendar } from "lucide-react";
import type { Podcast, Episode } from "@/hooks/usePodcasts";

interface PodcastEpisodesModalProps {
  podcast: Podcast | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PodcastEpisodesModal = ({ podcast, open, onOpenChange }: PodcastEpisodesModalProps) => {
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const handlePlay = (episode: Episode) => {
    if (playingEpisode === episode.audioUrl) {
      audioRef?.pause();
      setPlayingEpisode(null);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      const audio = new Audio(episode.audioUrl);
      audio.play();
      setAudioRef(audio);
      setPlayingEpisode(episode.audioUrl);
      
      audio.onended = () => {
        setPlayingEpisode(null);
      };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  if (!podcast) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && audioRef) {
        audioRef.pause();
        setPlayingEpisode(null);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {podcast.image_url && (
              <img
                src={podcast.image_url}
                alt={podcast.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="font-serif text-xl mb-1">{podcast.title}</DialogTitle>
              {podcast.author && (
                <p className="text-sm text-muted-foreground">by {podcast.author}</p>
              )}
              {podcast.website_url && (
                <a
                  href={podcast.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4">
            {podcast.episodes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No episodes available yet.
              </p>
            ) : (
              podcast.episodes.map((episode, index) => (
                <div
                  key={index}
                  className="bg-secondary/30 rounded-lg p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 mt-1"
                      onClick={() => handlePlay(episode)}
                      disabled={!episode.audioUrl}
                    >
                      {playingEpisode === episode.audioUrl ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground line-clamp-2 mb-1">
                        {episode.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        {episode.pubDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(episode.pubDate)}
                          </span>
                        )}
                        {episode.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {episode.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
