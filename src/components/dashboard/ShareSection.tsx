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
  Twitter,
  Instagram,
  Linkedin,
  Loader2,
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
  { id: "x", label: "X / Twitter", icon: Twitter },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "facebook", label: "Facebook", icon: Share2 },
  { id: "threads", label: "Threads", icon: Share2 },
];

function buildTemplates(podcastName: string | null, votingLink: string | null) {
  const name = podcastName || "my podcast";
  const link = votingLink
    ? `${window.location.origin}/vote/${votingLink}`
    : "https://veteranpodcastawards.com";

  return [
    {
      name: "Nomination Announcement",
      text: `Honored to announce that ${name} has been nominated for the 2026 Veteran Podcast Awards! Vote for us and help celebrate the voices of those who served. ${link} #VeteranPodcastAwards #MilitaryPodcast`,
    },
    {
      name: "Call to Vote",
      text: `Voting is OPEN for the 2026 Veteran Podcast Awards! If ${name} has made an impact on you, cast your vote today. Every vote counts! ${link} #VoteNow #VPA2026`,
    },
    {
      name: "Countdown",
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

  return (
    <div className="grid gap-6">
      {/* Voting Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Custom Voting Link
          </CardTitle>
          <CardDescription>Share your unique link to invite others to vote</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.custom_voting_link ? (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/vote/${profile.custom_voting_link}`}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  copyToClipboard(
                    `${window.location.origin}/vote/${profile.custom_voting_link}`
                  )
                }
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={generateVotingLink} variant="gold">
              <LinkIcon className="w-4 h-4 mr-2" />
              Generate Voting Link
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Social Campaign */}
      {isPodcaster && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Social Campaign
            </CardTitle>
            <CardDescription>
              Post to your social accounts via Upload Post. Select a template or write your own.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Templates */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Quick Templates</p>
              <div className="grid gap-2">
                {templates.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setPostText(t.text)}
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                      postText === t.text
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-foreground mb-1">{t.name}</p>
                    <p className="text-muted-foreground text-xs line-clamp-2">{t.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Compose */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Post Content</p>
              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="Write your post..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {postText.length} characters
              </p>
            </div>

            {/* Platforms */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selectedPlatforms.includes(p.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <p.icon className="w-4 h-4" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSendPost}
              disabled={isSending || !postText.trim() || selectedPlatforms.length === 0}
              variant="gold"
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
              <BarChart3 className="w-5 h-5 text-primary" />
              Promotional Assets
            </CardTitle>
            <CardDescription>Download badges and graphics to promote your nomination</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center border border-dashed border-border"
                >
                  <p className="text-sm text-muted-foreground text-center p-4">Coming Soon</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
