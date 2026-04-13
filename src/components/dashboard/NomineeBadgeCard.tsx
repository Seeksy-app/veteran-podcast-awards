import { Award } from "lucide-react";

interface Props {
  podcastTitle: string;
  podcasterName: string;
}

/** Screenshot-friendly “I'm nominated!” card */
export const NomineeBadgeCard = ({ podcastTitle, podcasterName }: Props) => {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg max-w-md mx-auto bg-gradient-to-br from-[#1a1520] via-card to-primary/10">
      <div className="px-6 py-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/40">
          <Award className="w-9 h-9 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Veteran Podcast Awards</p>
          <h3 className="font-serif text-2xl font-bold text-foreground mt-2 leading-tight">I&apos;m nominated!</h3>
        </div>
        <div className="pt-2 border-t border-border/60">
          <p className="font-serif text-lg font-semibold text-foreground">{podcastTitle}</p>
          <p className="text-sm text-muted-foreground mt-1">{podcasterName}</p>
        </div>
        <p className="text-xs text-muted-foreground pt-2">veteranpodcastawards.com</p>
      </div>
    </div>
  );
};
