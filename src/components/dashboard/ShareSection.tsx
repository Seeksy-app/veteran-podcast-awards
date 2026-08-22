import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  CheckCircle,
  Link as LinkIcon,
  Send,
  BarChart3,
  Loader2,
  Sparkles,
  Image,
  Megaphone,
} from "lucide-react";

interface LinkedPodcast {
  id: string;
  title: string;
  author: string | null;
  rss_url: string | null;
  image_url: string | null;
}

interface ShareSectionProps {
  profile: {
    full_name: string | null;
    custom_voting_link: string | null;
    user_type: string | null;
  };
  linkedPodcast: LinkedPodcast | null;
  copied: boolean;
  generateVotingLink: () => Promise<void>;
  copyToClipboard: (text: string) => void;
  isPodcaster: boolean;
}

const PLATFORMS = [
  { id: "x", label: "X / Twitter", color: "hover:border-blue-400 hover:bg-blue-400/10" },
  { id: "instagram", label: "Instagram", color: "hover:border-pink-400 hover:bg-pink-400/10" },
  { id: "linkedin", label: "LinkedIn", color: "hover:border-blue-600 hover:bg-blue-600/10" },
  { id: "facebook", label: "Facebook", color: "hover:border-blue-500 hover:bg-blue-500/10" },
  { id: "threads", label: "Threads", color: "hover:border-foreground hover:bg-foreground/10" },
];

function buildTemplates(podcastName: string | null, votingLink: string | null) {
  const name = podcastName || "my podcast";
  const link = votingLink
    ? `${window.location.origin}/vote/${votingLink}`
    : "https://veteranpodcastawards.com";

  return [
    {
      name: "Nomination Announcement",
      emoji: "🎖️",
      text: `Honored to announce that ${name} has been nominated for the 2026 Veteran Podcast Awards! Vote for us and help celebrate the voices of those who served. ${link} #VeteranPodcastAwards #MilitaryPodcast`,
    },
    {
      name: "Call to Vote",
      emoji: "🗳️",
      text: `Voting is OPEN for the 2026 Veteran Podcast Awards! If ${name} has made an impact on you, cast your vote today. Every vote counts! ${link} #VoteNow #VPA2026`,
    },
    {
      name: "Countdown",
      emoji: "🏆",
      text: `The 2026 Veteran Podcast Awards ceremony streams live on Veterans Day, November 11th! Have you voted yet? Support ${name} and the veteran podcast community. ${link} #VeteransDay #PodcastAwards`,
    },
  ];
}

export function ShareSection({
  profile,
  linkedPodcast,
  copied,
  generateVotingLink,
  copyToClipboard,
  isPodcaster,
}: ShareSectionProps) {
  const { toast } = useToast();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postText, setPostText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const templates = buildTemplates(
    linkedPodcast?.title ?? null,
    profile.custom_voting_link
  );

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSendPost = async () => {
    if (!postText.trim()) {
      toast({ title: "Empty Post", description: "Write something to share.", variant: "destructive" });
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast({ title: "No Platforms", description: "Select at least one platform.", variant: "destructive" });
      return;
    }

    setIsSending(true);
    const { data, error } = await supabase.functions.invoke("social-post", {
      body: { title: postText, platforms: selectedPlatforms },
    });

    setIsSending(false);

    if (error) {
      toast({ title: "Post Failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data?.success) {
      toast({ title: "Posted!", description: `Shared to ${selectedPlatforms.join(", ")}.` });
      setPostText("");
      setSelectedPlatforms([]);
    } else {
      toast({
        title: "Partial or Failed",
        description: data?.error || "Check your Upload Post account for connected platforms.",
        variant: "destructive",
      });
    }
  };

  const votingUrl = profile.custom_voting_link
    ? `${window.location.origin}/vote/${profile.custom_voting_link}`
    : null;

  return (
    <div className="grid gap-6">
      {/* Voting Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            Your Voting Link
          </CardTitle>
          <CardDescription>
            Share this unique link so your audience can vote for your podcast
          </CardDescription>
        </CardHeader>
        <CardContent>
          {votingUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 font-mono text-sm text-foreground truncate border border-border">
                  {votingUrl}
                </div>
                <Button
                  variant="gold"
                  size="icon"
                  className="h-[46px] w-[46px] flex-shrink-0"
                  onClick={() => copyToClipboard(votingUrl)}
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add this link to your podcast show notes, social media bio, and episode descriptions.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Generate a personalized voting link to share with your listeners
              </p>
              <Button onClick={generateVotingLink} variant="gold" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Voting Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Campaign */}
      {isPodcaster && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Social Campaign
            </CardTitle>
            <CardDescription>
              Create and share posts across your social accounts via Upload Post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Templates */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Quick Templates</p>
              <div className="grid gap-2">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setPostText(t.text)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      postText === t.text
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <p className="font-medium text-foreground mb-1">
                      <span className="mr-2">{t.emoji}</span>
                      {t.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{t.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or write your own</span>
              </div>
            </div>

            {/* Compose */}
            <div>
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Write your post..."
                rows={4}
                className="resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {postText.length > 280 && (
                    <span className="text-yellow-500 mr-2">May exceed platform limits</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {postText.length} characters
                </p>
              </div>
            </div>

            {/* Platforms */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Post To</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedPlatforms.includes(p.id)
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
                        : `border-border text-muted-foreground ${p.color}`
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSendPost}
              disabled={isSending || !postText.trim() || selectedPlatforms.length === 0}
              variant="gold"
              size="lg"
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post to {selectedPlatforms.length || "..."} Platform
                  {selectedPlatforms.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Powered by Upload Post. Connect your social accounts at{" "}
              <a
                href="https://upload-post.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                upload-post.com
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Promotional Assets */}
      {isPodcaster && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Promotional Assets
            </CardTitle>
            <CardDescription>Download badges and graphics to promote your nomination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Nominee Badge", desc: "Show off your nomination" },
                { label: "Social Banner", desc: "Cover image for profiles" },
                { label: "Story Template", desc: "Instagram & TikTok ready" },
              ].map((asset) => (
                <div
                  key={asset.label}
                  className="aspect-[4/3] bg-secondary/30 rounded-xl flex flex-col items-center justify-center border border-dashed border-border/60 hover:border-primary/30 transition-colors"
                >
                  <BarChart3 className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">{asset.label}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{asset.desc}</p>
                  <p className="text-xs text-primary mt-2">Coming Soon</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
