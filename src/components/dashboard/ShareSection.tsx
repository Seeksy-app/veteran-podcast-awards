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
    ? `${window.location.origin}/vote/${votingLink}?ref=share`
    : "https://veteranpodcastawards.com";

  return [
    {
      name: "Nomination Announcement",
      emoji: "🎙️",
      text: `Honored to share that ${name} has been nominated for the 2026 Veteran Podcast Awards! These awards celebrate the voices of those who served. Cast your vote and help us represent the military podcast community. ${link} #VeteranPodcastAwards #MilitaryPodcast`,
    },
    {
      name: "Call to Vote",
      emoji: "🗳️",
      text: `Voting is OPEN for the 2026 Veteran Podcast Awards! If ${name} has made an impact on your life, cast your vote today — every vote matters. Takes 30 seconds! ${link} #VoteNow #VPA2026`,
    },
    {
      name: "Personal Story",
      emoji: "❤️",
      text: `I started ${name} because I believe veteran and military stories deserve to be heard. If this podcast has meant something to you, please take a moment to vote for us in the 2026 VPA. It means the world. ${link} #VeteranVoices #MilPodcast`,
    },
    {
      name: "1 Week Left",
      emoji: "⏰",
      text: `ONE WEEK LEFT to vote in the 2026 Veteran Podcast Awards! ${name} is nominated and we need your support. Don't miss your chance to make your voice heard — vote now! ${link} #VPA2026 #VeteranPodcast`,
    },
    {
      name: "Final Push",
      emoji: "🔥",
      text: `Last chance! Voting for the 2026 Veteran Podcast Awards closes soon. If you believe ${name} belongs in the winner's circle, vote NOW before it's too late. ${link} #LastChance #VPA2026 #MilitaryPodcast`,
    },
    {
      name: "Thank Your Audience",
      emoji: "🙏",
      text: `Grateful beyond words for all the support you've shown ${name} and the 2026 Veteran Podcast Awards nomination. This community is why we do what we do. Still time to vote: ${link} #Grateful #VPA2026`,
    },
    {
      name: "Watch Party — Nov 11",
      emoji: "🎖️",
      text: `Join us for the 2026 Veteran Podcast Awards ceremony streaming LIVE on Veterans Day, November 11th at 6 PM ET! ${name} is nominated — let's celebrate together. Set a reminder now! ${link} #VeteransDay #VPA2026 #LiveStream`,
    },
    {
      name: "Episode Promo",
      emoji: "📻",
      text: `New episode of ${name} is out now! While you're listening, did you know we're nominated for a 2026 Veteran Podcast Award? Show your support with a vote — it only takes a moment! ${link} #NewEpisode #VPA2026`,
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
        <h2 className="font-serif text-2xl font-bold text-slate-900">Promotion</h2>
        <p className="text-slate-500 mt-1">Everything you need to rally votes and grow your audience.</p>
      </div>

      {/* ── Step 1: Voting Link ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">1</div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Your Voting Link</h3>
        </div>

        {votingUrl ? (
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="flex-1 font-mono text-sm text-slate-800 truncate">{votingUrl}</span>
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
              <p className="text-xs text-slate-500 mt-2 ml-8">
                Add this to your show notes, social bios, and episode descriptions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <LinkIcon className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 mb-4">
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
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">2</div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Create a Post</h3>
          </div>

          <Card>
            <CardContent className="p-5 space-y-5">
              {/* 8 campaign templates */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Choose a campaign template</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {templates.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => {
                        setPostText(t.text);
                        setActiveTemplate(i);
                      }}
                      className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg text-left text-sm border transition-all ${
                        activeTemplate === i
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                    >
                      <span className="text-base leading-none">{t.emoji}</span>
                      <span className="font-medium text-xs leading-tight">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compose area */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your post</p>
                <Textarea
                  value={postText}
                  onChange={(e) => {
                    setPostText(e.target.value);
                    setActiveTemplate(null);
                  }}
                  placeholder="Write your post, or pick a template above..."
                  rows={5}
                  className="resize-none border-slate-200 focus:border-amber-400 focus:ring-amber-400"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs tabular-nums ${postText.length > 280 ? "text-amber-600 font-medium" : "text-slate-400"}`}>
                    {postText.length} / 280
                  </span>
                </div>
              </div>

              {/* Platform pills */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Post to</p>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPlatforms.includes(p.id)
                          ? `${p.color} shadow-sm scale-[1.02]`
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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

          <p className="text-xs text-slate-400 text-center">
            Powered by{" "}
            <a href="https://upload-post.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              Upload Post
            </a>
            . Connect accounts under{" "}
            <span className="text-slate-600 font-medium">Connectors</span>.
          </p>
        </div>
      )}

      {/* ── Step 3: Promotional Assets ── */}
      {isPodcaster && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">3</div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Promotional Assets</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Nominee Badge",
                desc: "Add to your website, show notes, or email signature",
                size: "400 × 400 px",
                icon: Megaphone,
                bg: "bg-amber-50",
              },
              {
                label: "Social Banner",
                desc: "Cover image sized for Twitter, Facebook & LinkedIn headers",
                size: "1500 × 500 px",
                icon: Image,
                bg: "bg-blue-50",
              },
              {
                label: "Story Template",
                desc: "Vertical graphic ready for Instagram & TikTok stories",
                size: "1080 × 1920 px",
                icon: Download,
                bg: "bg-purple-50",
              },
            ].map((asset) => (
              <Card key={asset.label} className="group hover:border-slate-300 transition-colors overflow-hidden">
                <div className={`${asset.bg} h-24 flex items-center justify-center`}>
                  <asset.icon className="w-8 h-8 text-slate-400" />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-slate-900">{asset.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{asset.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{asset.size}</p>
                  <span className="inline-block text-xs text-amber-600 font-medium mt-3 bg-amber-50 px-2 py-0.5 rounded-full">Coming Soon</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
