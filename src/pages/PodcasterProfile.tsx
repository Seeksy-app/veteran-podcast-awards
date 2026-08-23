import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import logo from "@/assets/vpa-logo.png";
import {
  Share2,
  Mail,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  ExternalLink,
  Trophy,
  Headphones,
  Calendar,
  Play,
  Shield,
  Copy,
  Link2,
} from "lucide-react";

interface Episode {
  title: string;
  pubDate: string;
  enclosureUrl?: string;
  description?: string;
}

const PodcasterProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Fetch profile by username slug
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["podcaster-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username_slug", username)
        .eq("is_public", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username
  });

  // Fetch linked podcast data
  const { data: podcast } = useQuery({
    queryKey: ["podcaster-podcast", profile?.podcast_id],
    queryFn: async () => {
      if (!profile?.podcast_id) return null;
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", profile.podcast_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.podcast_id
  });

  // Fetch vote count for active awards
  const { data: voteData } = useQuery({
    queryKey: ["podcaster-votes", profile?.podcast_id],
    queryFn: async () => {
      if (!profile?.podcast_id) return null;

      // Get active awards year
      const { data: awardsConfig } = await supabase
        .from("awards_config")
        .select("*")
        .eq("is_active", true)
        .single();

      if (!awardsConfig) return null;

      const { data: votes } = await supabase
        .from("vote_counts")
        .select("vote_count, category_id")
        .eq("podcast_id", profile.podcast_id)
        .eq("year", awardsConfig.year);

      const totalVotes = votes?.reduce((sum, v) => sum + v.vote_count, 0) || 0;
      return { totalVotes, awardsName: awardsConfig.name, year: awardsConfig.year };
    },
    enabled: !!profile?.podcast_id
  });

  // Fetch promotional assets
  const { data: assets } = useQuery({
    queryKey: ["podcaster-assets", profile?.podcast_id],
    queryFn: async () => {
      if (!profile?.podcast_id) return [];
      const { data, error } = await supabase
        .from("promotional_assets")
        .select("*")
        .eq("podcast_id", profile.podcast_id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.podcast_id
  });

  // Send contact message
  const sendMessage = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      if (!profile?.id) throw new Error("Profile not found");

      // Save to database
      const { error: dbError } = await supabase
        .from("podcaster_messages")
        .insert({
          recipient_id: profile.id,
          sender_name: data.name,
          sender_email: data.email,
          subject: data.subject,
          message: data.message
        });

      if (dbError) throw dbError;

      // Send email notification via edge function
      await supabase.functions.invoke("send-podcaster-contact", {
        body: {
          recipientEmail: profile.email,
          recipientName: profile.full_name,
          senderName: data.name,
          senderEmail: data.email,
          subject: data.subject,
          message: data.message,
          podcastName: podcast?.title
        }
      });
    },
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setIsContactOpen(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    }
  });

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: profile?.full_name || "Podcaster", url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const episodes = Array.isArray(podcast?.episodes)
    ? (podcast.episodes as unknown as Episode[])
    : null;

  const firstName = profile?.full_name?.split(" ")[0] || "This Podcaster";
  const coverArt =
    podcast?.image_url || profile?.podcast_image_url || profile?.avatar_url || "";
  const voteLink = profile?.custom_voting_link || "/vote";
  const podcastTitle = podcast?.title || profile?.podcast_name || "";

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This podcaster profile doesn&apos;t exist or isn&apos;t public.
          </p>
          <Button asChild>
            <Link to="/network">Browse Podcast Directory</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <SEO
        title={profile.full_name || "Podcaster Profile"}
        description={
          profile.bio ||
          `Check out ${profile.full_name}'s podcast profile on Veteran Podcast Awards.`
        }
        canonicalUrl={`/podcaster/${username}`}
      />
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[480px] flex items-center"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        {/* Amber radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 65% 50%, rgba(251,191,36,0.10) 0%, transparent 70%)",
          }}
        />
        {/* Subtle top fade for header overlap */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-14">
          <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-center md:items-start">
            {/* LEFT — Cover Art (45%) */}
            <div className="flex-shrink-0 w-full md:w-[45%] flex justify-center md:justify-start">
              <div
                className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  border: "2px solid rgba(251,191,36,0.35)",
                  boxShadow:
                    "0 0 0 1px rgba(251,191,36,0.15), 0 25px 60px rgba(0,0,0,0.6)",
                }}
              >
                {coverArt ? (
                  <img
                    src={coverArt}
                    alt={podcastTitle || profile.full_name || "Podcast Cover"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <Headphones className="w-16 h-16 text-amber-400/40" />
                  </div>
                )}
                {/* Subtle inner glow overlay */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/20" />
              </div>
            </div>

            {/* RIGHT — Identity + CTA (55%) */}
            <div className="flex-1 w-full space-y-5 text-center md:text-left">
              {/* Military badge */}
              {(profile.military_affiliation || profile.military_branch) && (
                <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5">
                  <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-amber-300 text-xs font-semibold tracking-wider uppercase">
                    {[profile.military_affiliation, profile.military_branch]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              )}

              {/* Name */}
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white leading-tight">
                {profile.full_name}
              </h1>

              {/* Podcast title */}
              {podcastTitle && (
                <p className="text-xl text-amber-400 font-medium">{podcastTitle}</p>
              )}

              {/* Bio snippet */}
              {profile.bio && (
                <p className="text-slate-300 text-sm leading-relaxed max-w-lg mx-auto md:mx-0">
                  {profile.bio.slice(0, 200)}
                  {profile.bio.length > 200 ? "…" : ""}
                </p>
              )}

              {/* Vote CTA */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-base font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/25 transition-all hover:scale-105 hover:shadow-amber-400/40"
                    asChild
                  >
                    <a
                      href={voteLink}
                      target={profile.custom_voting_link ? "_blank" : undefined}
                      rel={profile.custom_voting_link ? "noopener noreferrer" : undefined}
                    >
                      <Trophy className="w-5 h-5 mr-2" />
                      Vote for {firstName}
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleShare}
                    className="h-14 px-6 border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-400 transition-all"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  {profile.allow_contact && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setIsContactOpen(true)}
                      className="h-14 px-6 border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-400 transition-all"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  )}
                </div>

                {/* Vote count */}
                {voteData && voteData.totalVotes > 0 && (
                  <p className="text-slate-400 text-sm">
                    <span className="text-amber-400 font-semibold">
                      {voteData.totalVotes.toLocaleString()}
                    </span>{" "}
                    votes and counting
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <main className="bg-slate-50 dark:bg-slate-900 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8">

            {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
            <aside className="space-y-6 order-2 lg:order-1">

              {/* Podcast Details */}
              <Card className="overflow-hidden shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                    The Podcast
                  </h3>

                  {coverArt && (
                    <img
                      src={coverArt}
                      alt={podcastTitle || "Podcast"}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                  )}

                  {podcastTitle && (
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      {podcastTitle}
                    </p>
                  )}

                  {profile.hosting_platform && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Headphones className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{profile.hosting_platform}</span>
                    </div>
                  )}

                  {(podcast?.website_url || profile.website_url) && (
                    <a
                      href={podcast?.website_url || profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Visit website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Social Links */}
              {(profile.website_url ||
                profile.social_twitter ||
                profile.social_instagram ||
                profile.social_linkedin) && (
                <Card className="shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                      Connect
                    </h3>

                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm"
                      >
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4" />
                        </span>
                        Website
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    )}

                    {profile.social_twitter && (
                      <a
                        href={profile.social_twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm"
                      >
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Twitter className="w-4 h-4" />
                        </span>
                        X / Twitter
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    )}

                    {profile.social_instagram && (
                      <a
                        href={profile.social_instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm"
                      >
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Instagram className="w-4 h-4" />
                        </span>
                        Instagram
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    )}

                    {profile.social_linkedin && (
                      <a
                        href={profile.social_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm"
                      >
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <Linkedin className="w-4 h-4" />
                        </span>
                        LinkedIn
                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Award Categories */}
              {profile.selected_categories &&
                Array.isArray(profile.selected_categories) &&
                (profile.selected_categories as string[]).length > 0 && (
                  <Card className="shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                        Award Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(profile.selected_categories as string[]).map((cat) => (
                          <Badge
                            key={cat}
                            className="bg-amber-100 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20 text-xs"
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────────────── */}
            <div className="space-y-8 order-1 lg:order-2">

              {/* About the person */}
              {profile.bio && (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                    About {firstName}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </section>
              )}

              {/* About the podcast */}
              {podcast?.description && (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center">
                      <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </span>
                    About the Podcast
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {podcast.description}
                  </p>
                </section>
              )}

              {/* Recent Episodes */}
              {episodes && episodes.length > 0 && (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-400/10 flex items-center justify-center">
                      <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </span>
                    Recent Episodes
                  </h2>
                  <div className="space-y-4">
                    {episodes.slice(0, 5).map((ep, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-700 overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-amber-400" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm leading-snug">
                                {ep.title}
                              </p>
                              <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {ep.pubDate
                                  ? new Date(ep.pubDate).toLocaleDateString(undefined, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {ep.enclosureUrl && (
                            <audio
                              controls
                              className="w-full h-10"
                              style={{ colorScheme: "dark" }}
                              src={ep.enclosureUrl}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Promotional Assets */}
              {assets && assets.length > 0 && (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
                    Media &amp; Assets
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset) => (
                      <a
                        key={asset.id}
                        href={asset.asset_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors text-center"
                      >
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {asset.asset_type}
                        </p>
                        {asset.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {asset.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────────────────── */}
            <aside className="space-y-6 order-3">

              {/* Big Vote Card */}
              <Card
                className="overflow-hidden shadow-lg border-0"
                style={{
                  background: "linear-gradient(145deg, #b45309 0%, #d97706 60%, #fbbf24 100%)",
                }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <Trophy className="w-10 h-10 text-white mx-auto drop-shadow" />
                  <div>
                    <p className="text-amber-100 text-xs font-semibold tracking-widest uppercase mb-1">
                      {voteData?.awardsName || "VPA 2026"}
                    </p>
                    {voteData && voteData.totalVotes > 0 && (
                      <p className="text-white text-4xl font-bold leading-none">
                        {voteData.totalVotes.toLocaleString()}
                      </p>
                    )}
                    {voteData && voteData.totalVotes > 0 && (
                      <p className="text-amber-100 text-xs mt-1">votes cast</p>
                    )}
                  </div>
                  <Button
                    className="w-full h-12 bg-white text-amber-800 hover:bg-amber-50 font-bold shadow-md transition-all hover:scale-105"
                    asChild
                  >
                    <a
                      href={voteLink}
                      target={profile.custom_voting_link ? "_blank" : undefined}
                      rel={profile.custom_voting_link ? "noopener noreferrer" : undefined}
                    >
                      Cast Your Vote
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Military Service Card */}
              {(profile.military_affiliation || profile.military_branch) && (
                <Card className="shadow-sm">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                      Military Service
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-amber-400" />
                      </span>
                      <div>
                        {profile.military_affiliation && (
                          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {profile.military_affiliation}
                          </p>
                        )}
                        {profile.military_branch && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {profile.military_branch}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Share Card */}
              <Card className="shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                    Share This Profile
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Help {firstName} get more votes — share this page with your network!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-slate-200 dark:border-slate-700"
                    onClick={handleCopyLink}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Link
                  </Button>
                  <div className="flex gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=Vote for ${encodeURIComponent(profile.full_name || firstName)} in the Veteran Podcast Awards!&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-200 dark:border-slate-700"
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-200 dark:border-slate-700"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-slate-200 dark:border-slate-700"
                      onClick={handleShare}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Avatar fallback if no cover art */}
              {!coverArt && (
                <div className="flex justify-center">
                  <Avatar className="w-20 h-20 border-2 border-amber-200 dark:border-amber-700 shadow">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="text-2xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                      {profile.full_name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* ── VPA BRANDING STRIP ─────────────────────────────────── */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="VPA Logo" className="h-8 w-auto" />
              <span className="text-slate-400 text-sm">
                VPA 2026 · Veteran Podcast Awards
              </span>
            </div>
            <a
              href="https://veteranpodcastawards.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              veteranpodcastawards.com
            </a>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── CONTACT DIALOG ─────────────────────────────────────── */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {profile.full_name}</DialogTitle>
            <DialogDescription>
              Send a message to this podcaster. They&apos;ll receive it in their inbox and via
              email.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                !contactForm.name ||
                !contactForm.email ||
                !contactForm.subject ||
                !contactForm.message
              ) {
                toast.error("Please fill in all fields");
                return;
              }
              sendMessage.mutate(contactForm);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Your Email *</Label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder="Collaboration opportunity"
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Hi, I'd love to connect about..."
                rows={5}
              />
            </div>
            <Button type="submit" className="w-full" disabled={sendMessage.isPending}>
              {sendMessage.isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PodcasterProfile;
