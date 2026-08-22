import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
  Copy,
  Shield,
  Megaphone,
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
  Plug,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import logo from "@/assets/vpa-logo.png";
import { GetNominatedSection } from "@/components/dashboard/GetNominatedSection";
import { ShareSection } from "@/components/dashboard/ShareSection";
import { ConnectorsSection } from "@/components/dashboard/ConnectorsSection";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { WelcomeCelebration } from "@/components/dashboard/WelcomeCelebration";

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
  onboarding_completed: boolean | null;
  podcast_name: string | null;
  podcast_rss: string | null;
  podcast_image_url: string | null;
  podchaser_id: number | null;
  hosting_platform: string | null;
  distribution_platforms: string[] | null;
  military_branch: string | null;
  military_affiliation: string | null;
  selected_categories: string[] | null;
  has_ad_agency: boolean | null;
  interested_in_opportunities: boolean | null;
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
  | "home"
  | "profile"
  | "inbox"
  | "votes"
  | "favorites"
  | "connectors"
  | "contacts"
  | "promotion"
  | "settings";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<NavSection>("home");
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
  const [showWelcome, setShowWelcome] = useState(searchParams.get("welcome") === "1");

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

  // Force light mode on dashboard
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.classList.add("light");
    return () => {
      root.classList.remove("light");
      if (wasDark) root.classList.add("dark");
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (profile.user_type !== "podcaster") return;
    if (profile.onboarding_completed) return;
    // If they completed onboarding this session (even if DB lags), don't loop
    if (user && localStorage.getItem("vpa-onboarding-done") === user.id) return;
    navigate("/onboarding", { replace: true });
  }, [profile, navigate, user]);

  useEffect(() => {
    if (!profile?.podcast_id) {
      setLinkedPodcast(null);
      setFollowerCount(0);
      if (profile?.podcast_rss && !rssUrl) setRssUrl(profile.podcast_rss);
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
        username_slug: profile.username_slug,
        is_public: profile.is_public,
        allow_contact: profile.allow_contact,
        podcast_name: profile.podcast_name,
        podcast_rss: profile.podcast_rss,
        military_branch: profile.military_branch,
        military_affiliation: profile.military_affiliation,
        hosting_platform: profile.hosting_platform,
        selected_categories: profile.selected_categories,
        has_ad_agency: profile.has_ad_agency,
        interested_in_opportunities: profile.interested_in_opportunities,
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
      case "podcaster": return "bg-amber-500 text-white";
      case "voter": return "bg-blue-500 text-white";
      case "fan": return "bg-slate-200 text-slate-700";
      default: return "bg-slate-100 text-slate-500";
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

  type NavItem = { key: NavSection; label: string; icon: typeof User; badge?: number; podcasterOnly?: boolean; group?: string };
  const navItems: NavItem[] = [
    { key: "home", label: "Home", icon: BarChart3 },
    { key: "profile", label: "Profile", icon: User },
    { key: "inbox", label: "Inbox", icon: Inbox, badge: unreadCount },
    { key: "favorites", label: "Favorites", icon: Star },
    { key: "connectors", label: "Connectors", icon: Plug, podcasterOnly: true },
    { key: "contacts", label: "Contacts", icon: Contact, podcasterOnly: true },
    { key: "votes", label: "My Votes", icon: Vote, group: "Podcast Awards" },
    { key: "promotion", label: "Promotion", icon: Megaphone, group: "Podcast Awards" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {showWelcome && (
        <WelcomeCelebration
          userName={profile.full_name || user.email || ""}
          onDismiss={() => {
            setShowWelcome(false);
            setSearchParams({}, { replace: true });
          }}
        />
      )}
      {/* ─── Left Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200 bg-white sticky top-0 h-screen overflow-y-auto">
        <div className="flex-1 flex flex-col px-3 pt-5 pb-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 px-3 mb-6">
            <img src={logo} alt="VPA" className="h-9 w-9" />
            <span className="font-serif text-base font-bold text-slate-900">VPA 2026</span>
          </Link>

          {/* User card */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-50">
            <div className="relative group">
              <Avatar className="w-10 h-10 border border-slate-200">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-sm bg-slate-100 text-slate-600">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-slate-900 truncate">
                {profile.full_name || "Welcome!"}
              </p>
              <p className="text-xs text-slate-500">{getUserTypeLabel()}</p>
            </div>
          </div>

          {isPodcaster && followerCount > 0 && (
            <div className="flex items-center gap-2 px-3 mb-3 text-xs text-slate-500">
              <Heart className="w-3.5 h-3.5 text-amber-500" />
              {followerCount} {followerCount === 1 ? "follower" : "followers"}
            </div>
          )}

          <nav className="space-y-0.5 flex-1">
            {(() => {
              const filtered = navItems.filter((n) => !n.podcasterOnly || isPodcaster);
              let lastGroup: string | undefined;
              return filtered.map((item) => {
                const showHeader = item.group && item.group !== lastGroup;
                lastGroup = item.group;
                return (
                  <div key={item.key}>
                    {showHeader && (
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-3 pt-5 pb-1.5">
                        {item.group}
                      </p>
                    )}
                    <button
                      onClick={() => setActiveSection(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === item.key
                          ? "bg-amber-50 text-amber-700 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <item.icon className={`w-[18px] h-[18px] shrink-0 ${activeSection === item.key ? "text-amber-600" : "text-slate-400"}`} />
                      {item.label}
                      {item.badge ? (
                        <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  </div>
                );
              });
            })()}
          </nav>

          {/* Settings + Logout */}
          <div className="border-t border-slate-100 pt-3 mt-3 space-y-0.5">
            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === "settings"
                  ? "bg-amber-50 text-amber-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <Settings className={`w-[18px] h-[18px] shrink-0 ${activeSection === "settings" ? "text-amber-600" : "text-slate-400"}`} />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0 text-slate-400" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile header ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="VPA" className="h-8 w-8" />
          <span className="font-serif text-sm font-bold text-slate-900">VPA 2026</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {/* ─── Mobile bottom nav ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        {navItems
          .filter((n) => !n.podcasterOnly || isPodcaster)
          .filter((n) => ["home", "profile", "inbox", "votes", "connectors", "promotion", "settings"].includes(n.key))
          .map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors relative ${
                activeSection === item.key ? "text-amber-600 font-semibold" : "text-slate-400"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label.split(" ")[0]}
              {item.badge ? (
                <span className="absolute -top-0.5 right-0 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
      </div>

      {/* ─── Main Content ─── */}
      <main className="flex-1 min-w-0 px-6 lg:px-10 py-8 pb-24 md:pb-8 mt-14 md:mt-0">
          <GetNominatedSection userId={user.id} profile={profile} podcast={linkedPodcast} />

          {/* ═══ Home / Overview ═══ */}
          {activeSection === "home" && (
            <DashboardHome
              userId={user.id}
              userName={profile.full_name || "there"}
              isPodcaster={isPodcaster}
              followerCount={followerCount}
              voteCount={votes.length}
              unreadMessages={unreadCount}
              favoritesCount={favorites.length}
              onNavigate={(section) => setActiveSection(section as NavSection)}
            />
          )}

          {/* ═══ Profile ═══ */}
          {activeSection === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Manage your personal and podcast information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {/* Personal */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" value={profile.full_name || ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input id="website" placeholder="https://yoursite.com" className="pl-10" value={profile.website_url || ""} onChange={(e) => setProfile({ ...profile, website_url: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Military Affiliation */}
                  {isPodcaster && (
                    <div className="border-t border-slate-200 pt-6">
                      <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-600" />
                        Military Affiliation
                      </p>
                      <div className="grid grid-cols-2 gap-4 max-w-lg">
                        <div className="space-y-2">
                          <Label htmlFor="military_affiliation">Affiliation</Label>
                          <select id="military_affiliation" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400" value={profile.military_affiliation || ""} onChange={(e) => setProfile({ ...profile, military_affiliation: e.target.value })}>
                            <option value="">Select...</option>
                            <option value="veteran">Veteran</option>
                            <option value="active_duty">Active Duty</option>
                            <option value="spouse">Military Spouse</option>
                            <option value="supporter">Military Supporter</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="military_branch">Branch</Label>
                          <select id="military_branch" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400" value={profile.military_branch || ""} onChange={(e) => setProfile({ ...profile, military_branch: e.target.value })}>
                            <option value="">Select...</option>
                            {["Army","Navy","Marine Corps","Air Force","Coast Guard","Space Force","National Guard"].map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  <div className="border-t border-slate-200 pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us about yourself..." value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
                    </div>
                  </div>

                  {/* Podcast Details */}
                  {isPodcaster && (
                    <>
                      <div className="border-t border-slate-200 pt-6">
                        <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Mic className="w-4 h-4 text-amber-600" />
                          Podcast Details
                        </p>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="podcast_name">Podcast Name</Label>
                              <Input id="podcast_name" placeholder="Your podcast name" value={profile.podcast_name || linkedPodcast?.title || ""} onChange={(e) => setProfile({ ...profile, podcast_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="hosting_platform">Hosting Platform</Label>
                              <select id="hosting_platform" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400" value={profile.hosting_platform || ""} onChange={(e) => setProfile({ ...profile, hosting_platform: e.target.value })}>
                                <option value="">Select platform...</option>
                                {["Buzzsprout","Libsyn","Podbean","Spotify for Podcasters (Anchor)","Transistor","Captivate","RSS.com","Spreaker","Blubrry","Simplecast","Megaphone","Acast","RedCircle","Castos","iHeartRadio","SoundCloud","Audioboom","Podomatic","Other"].map((p) => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="podcast_rss">RSS Feed</Label>
                            <div className="relative">
                              <Rss className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input id="podcast_rss" placeholder="https://feeds.example.com/your-podcast" className="pl-10" value={profile.podcast_rss || rssUrl} onChange={(e) => { setProfile({ ...profile, podcast_rss: e.target.value }); setRssUrl(e.target.value); }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Award Categories (read-only) */}
                  {isPodcaster && (profile.selected_categories?.length ?? 0) > 0 && (
                    <div className="border-t border-slate-200 pt-6">
                      <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-600" />
                        Award Categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(profile.selected_categories || []).map((catId) => (
                          <Badge key={catId} variant="secondary" className="px-3 py-1.5 text-sm">
                            <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                            {categoryNames[catId] || catId}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">To change your categories, please contact us.</p>
                    </div>
                  )}

                  {/* Public Profile */}
                  <div className="border-t border-slate-200 pt-6">
                    <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600" />
                      Public Profile
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Visible to the public</p>
                          <p className="text-xs text-slate-500">Show your profile at veteranpodcastawards.com/podcaster/{profile.username_slug || "your-name"}</p>
                        </div>
                        <Switch checked={profile.is_public} onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Allow messages</p>
                          <p className="text-xs text-slate-500">Let visitors contact you through your profile</p>
                        </div>
                        <Switch checked={profile.allow_contact} onCheckedChange={(checked) => setProfile({ ...profile, allow_contact: checked })} />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <Label htmlFor="username_slug">Profile URL</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 whitespace-nowrap">veteranpodcastawards.com/podcaster/</span>
                          <Input id="username_slug" placeholder="your-name" value={profile.username_slug || ""} onChange={(e) => setProfile({ ...profile, username_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="gold" size="lg" disabled={isUpdating} className="mt-2">
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
                  <Mail className="w-5 h-5 text-amber-600" />
                  Messages
                </CardTitle>
                <CardDescription>Messages from your public profile visitors</CardDescription>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No Messages Yet</h3>
                    <p className="text-slate-500 text-sm">Messages from your profile visitors will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg border ${msg.is_read ? "bg-slate-50 border-slate-100" : "bg-amber-50 border-amber-100"}`}
                        onClick={() => !msg.is_read && markAsRead(msg.id)}
                        role={msg.is_read ? undefined : "button"}
                        tabIndex={msg.is_read ? undefined : 0}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-slate-900">{msg.sender_name}</p>
                            <p className="text-xs text-slate-500">{msg.sender_email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!msg.is_read && (
                              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">New</span>
                            )}
                            <span className="text-xs text-slate-500">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="font-semibold text-sm text-slate-900 mb-1">{msg.subject}</p>
                        <p className="text-sm text-slate-500">{msg.message}</p>
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
                  <Trophy className="w-5 h-5 text-amber-600" />
                  My Voting History
                </CardTitle>
                <CardDescription>Track all your votes for the Veteran Podcast Awards</CardDescription>
              </CardHeader>
              <CardContent>
                {votes.length === 0 ? (
                  <div className="text-center py-12">
                    <Vote className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No Votes Yet</h3>
                    <p className="text-slate-500 text-sm mb-4">You haven&apos;t voted in any categories yet.</p>
                    <Button variant="gold" onClick={() => navigate("/categories")}>Start Voting</Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {votesByCategory.map(([key, group]) => (
                      <div key={key}>
                        <p className="text-sm font-medium text-slate-900 mb-2">
                          {categoryNames[group[0].category_id] || "Category"} &middot; {group[0].year}
                          <span className="text-slate-400 font-normal ml-2">({group.length}/3 votes used)</span>
                        </p>
                        <div className="space-y-2">
                          {group.map((vote) => (
                            <div key={vote.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                {vote.podcast?.image_url ? (
                                  <img src={vote.podcast.image_url} alt={vote.podcast.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Mic className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">{vote.podcast?.title || "Unknown Podcast"}</p>
                                <p className="text-sm text-slate-500">Vote {vote.vote_slot ?? 1} of 3</p>
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
                  <Star className="w-5 h-5 text-amber-600" />
                  Podcast Favorites
                </CardTitle>
                <CardDescription>Shows you've followed from the Podcast Directory</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No Favorites Yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Follow podcasts from the directory to see them here.</p>
                    <Button variant="outline" onClick={() => navigate("/network")}>Browse Directory</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((fav) => (
                      <div key={fav.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                          {fav.podcast.image_url ? (
                            <img src={fav.podcast.image_url} alt={fav.podcast.title} className="w-full h-full object-cover" />
                          ) : (
                            <Mic className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{fav.podcast.title}</p>
                          {fav.podcast.author && (
                            <p className="text-xs text-slate-500 truncate">{fav.podcast.author}</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{new Date(fav.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ Connectors (Podcasters only) ═══ */}
          {activeSection === "connectors" && isPodcaster && (
            <ConnectorsSection userId={user.id} />
          )}

          {/* ═══ Contacts (Podcasters only) ═══ */}
          {activeSection === "contacts" && isPodcaster && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Contact className="w-5 h-5 text-amber-600" />
                  Follower Contacts
                </CardTitle>
                <CardDescription>
                  Followers who shared their email address with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No Contacts Yet</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      When someone follows your podcast, they'll be prompted to share their email.
                      Contacts who opt in will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((c) => (
                      <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{c.name}</p>
                          <p className="text-xs text-slate-500 truncate">{c.email}</p>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ═══ Promotion ═══ */}
          {activeSection === "promotion" && (
            <ShareSection
              profile={profile}
              linkedPodcast={linkedPodcast}
              copied={copied}
              generateVotingLink={generateVotingLink}
              copyToClipboard={copyToClipboard}
              isPodcaster={isPodcaster}
            />
          )}

          {/* ═══ Settings ═══ */}
          {activeSection === "settings" && (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Choose how the dashboard looks to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "light" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-amber-300"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                        <Sun className="w-6 h-6 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Day</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "dark" ? "border-slate-700 bg-slate-100" : "border-slate-200 hover:border-slate-400"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                        <Moon className="w-6 h-6 text-slate-300" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Night</span>
                    </button>
                    <button
                      onClick={() => setTheme("system")}
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "system" ? "border-amber-500 bg-amber-50" : "border-slate-200 hover:border-amber-300"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-slate-800 border-2 border-slate-200 flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-slate-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Auto</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
      </main>
    </div>
  );
};

export default Dashboard;
