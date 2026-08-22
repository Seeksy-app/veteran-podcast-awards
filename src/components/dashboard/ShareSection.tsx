import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  CheckCircle,
  Link as LinkIcon,
  Send,
  Loader2,
  Sparkles,
  Image,
  Megaphone,
  ChevronRight,
  Download,
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
  { id: "x", label: "X", color: "bg-black text-white" },
  { id: "instagram", label: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500 text-white" },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-700 text-white" },
  { id: "facebook", label: "Facebook", color: "bg-blue-600 text-white" },
  { id: "threads", label: "Threads", color: "bg-zinc-800 text-white" },
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
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);

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
      setActiveTemplate(null);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Promotion</h2>
        <p className="text-muted-foreground mt-1">Everything you need to rally votes and grow your audience.</p>
      </div>

      {/* ── Step 1: Voting Link ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Voting Link</h3>
        </div>

        {votingUrl ? (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-primary shrink-0" />
                <span className="flex-1 font-mono text-sm text-foreground truncate">{votingUrl}</span>
                <Button
                  variant="gold"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => copyToClipboard(votingUrl)}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-8">
                Add this to your show notes, social bios, and episode descriptions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <LinkIcon className="w-8 h-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Generate a personalized link your audience can use to vote for you.
              </p>
              <Button onClick={generateVotingLink} variant="gold">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Voting Link
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Step 2: Create a Post ── */}
      {isPodcaster && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Create a Post</h3>
          </div>

          <Card>
            <CardContent className="p-5 space-y-5">
              {/* Templates as compact selectable chips */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Start from a template</p>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setPostText(t.text);
                        setActiveTemplate(i);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        activeTemplate === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compose area */}
              <div>
                <Textarea
                  value={postText}
                  onChange={(e) => {
                    setPostText(e.target.value);
                    setActiveTemplate(null);
                  }}
                  placeholder="Write your post, or pick a template above..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs tabular-nums ${postText.length > 280 ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {postText.length} / 280
                  </span>
                </div>
              </div>

              {/* Platform pills */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Post to</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPlatforms.includes(p.id)
                          ? `${p.color} shadow-sm scale-[1.02]`
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post button */}
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
                    Post{selectedPlatforms.length > 0 ? ` to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? "s" : ""}` : ""}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            Powered by{" "}
            <a href="https://upload-post.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Upload Post
            </a>
            . Connect accounts under{" "}
            <span className="text-foreground font-medium">Connectors</span>.
          </p>
        </div>
      )}

      {/* ── Step 3: Promotional Assets ── */}
      {isPodcaster && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Promotional Assets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Nominee Badge", desc: "Add to your website or show notes", icon: Megaphone },
              { label: "Social Banner", desc: "Cover image for profiles & headers", icon: Image },
              { label: "Story Template", desc: "Ready for Instagram & TikTok", icon: Download },
            ].map((asset) => (
              <Card key={asset.label} className="group hover:border-primary/30 transition-colors">
                <CardContent className="p-5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <asset.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{asset.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{asset.desc}</p>
                  <span className="text-xs text-primary font-medium mt-3">Coming Soon</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
