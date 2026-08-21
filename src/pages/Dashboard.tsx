import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Vote,
  Share2,
  Trophy,
  Camera,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Linkedin,
  Copy,
  CheckCircle,
  BarChart3,
  Mic,
  Settings,
  Sun,
  Moon,
  Monitor,
  Mail,
  Inbox,
  Heart,
  Rss,
  Globe,
  Users,
  Star,
  Contact,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { GetNominatedSection } from "@/components/dashboard/GetNominatedSection";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  user_type: string | null;
  website_url: string | null;
  custom_voting_link: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  username_slug: string | null;
  is_public: boolean;
  allow_contact: boolean;
  podcast_id: string | null;
}

interface PodcasterMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UserVote {
  id: string;
  category_id: string;
  nominee_id: string;
  year: number;
  vote_slot: number;
  created_at: string;
  podcast?: { title: string; image_url: string | null };
}

interface LinkedPodcast {
  id: string;
  title: string;
  author: string | null;
  rss_url: string | null;
  image_url: string | null;
}

interface FavoritePodcast {
  id: string;
  podcast_id: string;
  created_at: string;
  podcast: { title: string; image_url: string | null; author: string | null };
}

interface FollowerContact {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

type NavSection =
  | "profile"
  | "inbox"
  | "votes"
  | "favorites"
  | "contacts"
  | "share"
  | "settings";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<NavSection>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [votes, setVotes] = useState<UserVote[]>([]);
  const [messages, setMessages] = useState<PodcasterMessage[]>([]);
  const [favorites, setFavorites] = useState<FavoritePodcast[]>([]);
  const [contacts, setContacts] = useState<FollowerContact[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkedPodcast, setLinkedPodcast] = useState<LinkedPodcast | null>(null);
  const [rssUrl, setRssUrl] = useState("");
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchVotes();
      fetchMessages();
      fetchFavorites();
      fetchCategoryNames();
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    if (!profile?.podcast_id) {
      setLinkedPodcast(null);
      setFollowerCount(0);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("podcasts")
        .select("id, title, author, rss_url, image_url")
        .eq("id", profile.podcast_id!)
        .maybeSingle();
      if (data) {
        setLinkedPodcast(data);
        setRssUrl(data.rss_url || "");
      }
      const { count } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("podcast_id", profile.podcast_id!);
      setFollowerCount(count || 0);
    })();
  }, [profile?.podcast_id]);

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("podcaster_messages")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMessages(data as PodcasterMessage[]);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data as Profile);
  };

  const fetchVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("votes")
      .select("id, category_id, nominee_id, year, vote_slot, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      const withPodcasts = await Promise.all(
        data.map(async (vote) => {
          const { data: podcast } = await supabase
            .from("podcasts")
            .select("title, image_url")
            .eq("id", vote.nominee_id)
            .single();
          return { ...vote, podcast: podcast || undefined };
        })
      );
      setVotes(withPodcasts);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("id, podcast_id, created_at, podcasts(title, image_url, author)" as any)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setFavorites(
        (data as any[]).map((f) => ({
          id: f.id,
          podcast_id: f.podcast_id,
          created_at: f.created_at,
          podcast: f.podcasts || { title: "Unknown", image_url: null, author: null },
        }))
      );
    }
  };

  const fetchContacts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("podcast_contacts" as any)
      .select("id, email, name, created_at")
      .eq("source" as any, "Follower Share")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setContacts(data as FollowerContact[]);
  };

  const fetchCategoryNames = async () => {
    const { data } = await supabase.from("award_categories").select("id, name");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((c) => { map[c.id] = c.name; });
      setCategoryNames(map);
    }
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!profile || !user) return;
    setIsUpdating(true);

    if (linkedPodcast && rssUrl !== (linkedPodcast.rss_url || "")) {
      await supabase.from("podcasts").update({ rss_url: rssUrl }).eq("id", linkedPodcast.id);
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        bio: profile.bio,
        website_url: profile.website_url,
        social_twitter: profile.social_twitter,
        social_instagram: profile.social_instagram,
        social_linkedin: profile.social_linkedin,
        username_slug: profile.username_slug,
        is_public: profile.is_public,
        allow_contact: profile.allow_contact,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
    }
    setIsUpdating(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload Failed", description: uploadError.message, variant: "destructive" });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    if (!updateError) {
      setProfile({ ...profile!, avatar_url: publicUrl });
      toast({ title: "Avatar Updated", description: "Your profile photo has been changed." });
    }
  };

  const generateVotingLink = async () => {
    if (!user) return;
    const link = `vote-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const { error } = await supabase.from("profiles").update({ custom_voting_link: link }).eq("id", user.id);
    if (!error) {
      setProfile({ ...profile!, custom_voting_link: link });
      toast({ title: "Voting Link Generated", description: "Your custom voting link is ready to share!" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link Copied!", description: "Share this link with others." });
  };

  const markAsRead = async (msgId: string) => {
    await supabase.from("podcaster_messages").update({ is_read: true } as any).eq("id", msgId);
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, is_read: true } : m));
  };

  const getUserTypeLabel = () => {
    switch (profile?.user_type) {
      case "podcaster": return "Podcaster";
      case "voter": return "Verified Voter";
      case "fan": return "Fan";
      default: return "Member";
    }
  };

  const getUserTypeColor = () => {
    switch (profile?.user_type) {
      case "podcaster": return "bg-primary text-primary-foreground";
      case "voter": return "bg-blue-500 text-white";
      case "fan": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const votesByCategory = useMemo(() => {
    const m = new Map<string, UserVote[]>();
    for (const v of votes) {
      const key = `${v.category_id}::${v.year}`;
      m.set(key, [...(m.get(key) ?? []), v]);
    }
    return Array.from(m.entries());
  }, [votes]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const isPodcaster = profile?.user_type === "podcaster";

  const navItems: { key: NavSection; label: string; icon: typeof User; badge?: number; podcasterOnly?: boolean }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "inbox", label: "Inbox", icon: Inbox, badge: unreadCount },
    { key: "votes", label: "My Votes", icon: Vote },
    { key: "favorites", label: "Podcast Favorites", icon: Star },
    { key: "contacts", label: "Contacts", icon: Contact, podcasterOnly: true },
    { key: "share", label: "Share", icon: Share2 },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex pt-16">
        {/* ─── Left Sidebar ─── */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border bg-card/50 pt-8 pb-6 px-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Profile mini */}
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="relative group">
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-sm bg-secondary">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-foreground truncate">
                {profile.full_name || "Welcome!"}
              </p>
              <Badge className={`${getUserTypeColor()} text-[10px] px-1.5 py-0`}>{getUserTypeLabel()}</Badge>
            </div>
          </div>

          {isPodcaster && followerCount > 0 && (
            <div className="flex items-center gap-2 px-2 mb-4 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary" />
              {followerCount} {followerCount === 1 ? "follower" : "followers"}
            </div>
          )}

          <nav className="space-y-1 flex-1">
            {navItems
              .filter((n) => !n.podcasterOnly || isPodcaster)
              .map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === item.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.badge ? (
                    <span className="ml-auto w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
          </nav>
        </aside>

        {/* ─── Mobile nav ─── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 py-1.5 flex justify-around">
          {navItems
            .filter((n) => !n.podcasterOnly || isPodcaster)
            .filter((n) => ["profile", "inbox", "votes", "favorites", "share", "settings"].includes(n.key))
            .map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors relative ${
                  activeSection === item.key ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label.split(" ")[0]}
                {item.badge ? (
                  <span className="absolute -top-0.5 right-0 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
        </div>

        {/* ─── Main Content ─── */}
        <main className="flex-1 min-w-0 px-6 lg:px-10 py-8 pb-24 md:pb-8">
          <GetNominatedSection userId={user.id} profile={profile} podcast={linkedPodcast} />

          {/* ═══ Profile ═══ */}
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information and social links</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="website"
                          placeholder="https://yoursite.com"
                          className="pl-10"
                          value={profile.website_url || ""}
                          onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {isPodcaster && (
                    <div className="space-y-2">
                      <Label htmlFor="rss_url">Podcast RSS Feed</Label>
                      <div className="relative">
                        <Rss className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="rss_url"
                          placeholder="https://feeds.example.com/your-podcast"
                          className="pl-10"
                          value={rssUrl}
                          onChange={(e) => setRssUrl(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your RSS feed URL is essential for syncing episodes and enabling discovery.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="twitter" placeholder="@username" className="pl-10" value={profile.social_twitter || ""} onChange={(e) => setProfile({ ...profile, social_twitter: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="instagram" placeholder="@username" className="pl-10" value={profile.social_instagram || ""} onChange={(e) => setProfile({ ...profile, social_instagram: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="linkedin" placeholder="username" className="pl-10" value={profile.social_linkedin || ""} onChange={(e) => setProfile({ ...profile, social_linkedin: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* ═══ Inbox ═══ */}
          {activeSection === "inbox" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Messages
                </CardTitle>
                <CardDescription>Messages from your public profile visitors</CardDescription>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Messages Yet</h3>
                    <p className="text-muted-foreground text-sm">Messages from your profile visitors will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg border ${msg.is_read ? "bg-muted/30" : "bg-primary/5 border-primary/20"}`}
                        onClick={() => !msg.is_read && markAsRead(msg.id)}
                        role={msg.is_read ? undefined : "button"}
                        tabIndex={msg.is_read ? undefined : 0}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{msg.sender_name}</p>
                            <p className="text-xs text-muted-foreground">{msg.sender_email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!msg.is_read && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">New</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="font-semibold text-sm mb-1">{msg.subject}</p>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ My Votes ═══ */}
          {activeSection === "votes" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  My Voting History
                </CardTitle>
                <CardDescription>Track all your votes for the Veteran Podcast Awards</CardDescription>
              </CardHeader>
              <CardContent>
                {votes.length === 0 ? (
                  <div className="text-center py-12">
                    <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Votes Yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">You haven&apos;t voted in any categories yet.</p>
                    <Button variant="gold" onClick={() => navigate("/categories")}>Start Voting</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {votesByCategory.map(([key, group]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-foreground mb-2">
                          {categoryNames[group[0].category_id] || "Category"} &middot; {group[0].year}
                          <span className="text-muted-foreground font-normal ml-2">({group.length}/3 votes used)</span>
                        </p>
                        <div className="space-y-2">
                          {group.map((vote) => (
                            <div key={vote.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg">
                              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                                {vote.podcast?.image_url ? (
                                  <img src={vote.podcast.image_url} alt={vote.podcast.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Mic className="w-6 h-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{vote.podcast?.title || "Unknown Podcast"}</p>
                                <p className="text-sm text-muted-foreground">Vote {vote.vote_slot ?? 1} of 3</p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ Podcast Favorites ═══ */}
          {activeSection === "favorites" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Podcast Favorites
                </CardTitle>
                <CardDescription>Shows you've followed from the Podcast Directory</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Favorites Yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">Follow podcasts from the directory to see them here.</p>
                    <Button variant="outline" onClick={() => navigate("/network")}>Browse Directory</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                          {fav.podcast.image_url ? (
                            <img src={fav.podcast.image_url} alt={fav.podcast.title} className="w-full h-full object-cover" />
                          ) : (
                            <Mic className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{fav.podcast.title}</p>
                          {fav.podcast.author && (
                            <p className="text-xs text-muted-foreground truncate">{fav.podcast.author}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(fav.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ Contacts (Podcasters only) ═══ */}
          {activeSection === "contacts" && isPodcaster && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="w-5 h-5 text-primary" />
                  Follower Contacts
                </CardTitle>
                <CardDescription>
                  Followers who shared their email address with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No Contacts Yet</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      When someone follows your podcast, they'll be prompted to share their email.
                      Contacts who opt in will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((c) => (
                      <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ Share ═══ */}
          {activeSection === "share" && (
            <div className="grid gap-6">
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
                      <Input readOnly value={`${window.location.origin}/vote/${profile.custom_voting_link}`} className="flex-1" />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${window.location.origin}/vote/${profile.custom_voting_link}`)}>
                        {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
                        <div key={i} className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center border border-dashed border-border">
                          <p className="text-sm text-muted-foreground text-center p-4">Coming Soon</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ═══ Settings ═══ */}
          {activeSection === "settings" && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>Control your public profile and how people find you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your profile visible at veteranpodcastawards.com/podcaster/{profile.username_slug || "your-name"}
                      </p>
                    </div>
                    <Switch checked={profile.is_public} onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Messages</Label>
                      <p className="text-sm text-muted-foreground">Let visitors send you messages through your public profile</p>
                    </div>
                    <Switch checked={profile.allow_contact} onCheckedChange={(checked) => setProfile({ ...profile, allow_contact: checked })} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username_slug">Profile URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">veteranpodcastawards.com/podcaster/</span>
                      <Input
                        id="username_slug"
                        placeholder="your-name"
                        value={profile.username_slug || ""}
                        onChange={(e) => setProfile({ ...profile, username_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleUpdateProfile()} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Settings"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Appearance
                  </CardTitle>
                  <CardDescription>Choose how the app looks to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "light" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                        <Sun className="w-6 h-6 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium">Day</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                        <Moon className="w-6 h-6 text-slate-300" />
                      </div>
                      <span className="text-sm font-medium">Night</span>
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "system" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-slate-800 border-2 border-border flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-foreground" />
                      </div>
                      <span className="text-sm font-medium">Auto</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
