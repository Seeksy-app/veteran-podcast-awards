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
import { 
  Heart, 
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
  Play
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

  const episodes = Array.isArray(podcast?.episodes) ? (podcast.episodes as unknown as Episode[]) : null;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">This podcaster profile doesn't exist or isn't public.</p>
          <Button asChild>
            <Link to="/network">Browse Podcast Network</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={profile.full_name || "Podcaster Profile"}
        description={profile.bio || `Check out ${profile.full_name}'s podcast profile on Veteran Podcast Awards.`}
        canonicalUrl={`/podcaster/${username}`}
      />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 h-32" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.avatar_url || podcast?.image_url || ""} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {profile.full_name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 pt-16 md:pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="font-serif text-3xl font-bold">{profile.full_name}</h1>
                      {podcast && (
                        <p className="text-muted-foreground">{podcast.title}</p>
                      )}
                      {profile.user_type && (
                        <Badge variant="secondary" className="mt-2">{profile.user_type}</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      {profile.allow_contact && (
                        <Button variant="gold" size="sm" onClick={() => setIsContactOpen(true)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Me
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="space-y-6">
              {/* Vote Stats */}
              {voteData && voteData.totalVotes > 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-3xl font-bold text-primary">{voteData.totalVotes}</p>
                    <p className="text-sm text-muted-foreground">Votes for {voteData.awardsName}</p>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold mb-4">Connect</h3>
                  
                  {profile.website_url && (
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  
                  {profile.social_twitter && (
                    <a 
                      href={profile.social_twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  
                  {profile.social_instagram && (
                    <a 
                      href={profile.social_instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                  
                  {profile.social_linkedin && (
                    <a 
                      href={profile.social_linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Custom Voting Link */}
              {profile.custom_voting_link && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium mb-3">Support this podcast!</p>
                    <Button variant="gold" size="sm" asChild className="w-full">
                      <a href={profile.custom_voting_link} target="_blank" rel="noopener noreferrer">
                        Vote Now
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Bio */}
              {profile.bio && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">About</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Podcast Description */}
              {podcast?.description && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      About the Podcast
                    </h3>
                    <p className="text-muted-foreground">{podcast.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Recent Episodes */}
              {episodes && episodes.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Recent Episodes
                    </h3>
                    <div className="space-y-4">
                      {episodes.slice(0, 5).map((ep, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            <Play className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{ep.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ep.pubDate).toLocaleDateString()}
                            </p>
                          </div>
                          {ep.enclosureUrl && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={ep.enclosureUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Promotional Assets */}
              {assets && assets.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Media & Assets</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {assets.map((asset) => (
                        <a 
                          key={asset.id}
                          href={asset.asset_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-center"
                        >
                          <p className="text-sm font-medium">{asset.asset_type}</p>
                          {asset.description && (
                            <p className="text-xs text-muted-foreground">{asset.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {profile.full_name}</DialogTitle>
            <DialogDescription>
              Send a message to this podcaster. They'll receive it in their inbox and via email.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
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
