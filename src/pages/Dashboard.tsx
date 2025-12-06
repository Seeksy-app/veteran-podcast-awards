import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Eye,
  EyeOff,
  ExternalLink,
  Trash2
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

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
  created_at: string;
  podcast?: {
    title: string;
    image_url: string | null;
  };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [votes, setVotes] = useState<UserVote[]>([]);
  const [messages, setMessages] = useState<PodcasterMessage[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchVotes();
      fetchMessages();
    }
  }, [user]);

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (data) setProfile(data as Profile);
  };

  const fetchVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("votes")
      .select(`
        id,
        category_id,
        nominee_id,
        year,
        created_at
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch podcast info for each vote
      const votesWithPodcasts = await Promise.all(
        data.map(async (vote) => {
          const { data: podcast } = await supabase
            .from("podcasts")
            .select("title, image_url")
            .eq("id", vote.nominee_id)
            .single();
          return { ...vote, podcast: podcast || undefined };
        })
      );
      setVotes(votesWithPodcasts);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setIsUpdating(true);
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
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved.",
      });
    }
    setIsUpdating(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Upload Failed",
        description: uploadError.message,
        variant: "destructive",
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (!updateError) {
      setProfile({ ...profile!, avatar_url: publicUrl });
      toast({
        title: "Avatar Updated",
        description: "Your profile photo has been changed.",
      });
    }
  };

  const generateVotingLink = async () => {
    if (!user) return;
    
    const link = `vote-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
    const { error } = await supabase
      .from("profiles")
      .update({ custom_voting_link: link })
      .eq("id", user.id);

    if (!error) {
      setProfile({ ...profile!, custom_voting_link: link });
      toast({
        title: "Voting Link Generated",
        description: "Your custom voting link is ready to share!",
      });
    }
  };

  const copyVotingLink = () => {
    if (!profile?.custom_voting_link) return;
    const fullUrl = `${window.location.origin}/vote/${profile.custom_voting_link}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link Copied!",
      description: "Share this link with others to vote.",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-secondary">
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {profile.full_name || "Welcome!"}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className={`mt-2 ${getUserTypeColor()}`}>
                {getUserTypeLabel()}
              </Badge>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 md:w-auto md:inline-grid">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="inbox" className="gap-2 relative">
                <Inbox className="w-4 h-4" />
                <span className="hidden sm:inline">Inbox</span>
                {messages.filter(m => !m.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {messages.filter(m => !m.is_read).length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="votes" className="gap-2">
                <Vote className="w-4 h-4" />
                <span className="hidden sm:inline">My Votes</span>
              </TabsTrigger>
              <TabsTrigger value="share" className="gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information and social links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                          <Input
                            id="twitter"
                            placeholder="@username"
                            className="pl-10"
                            value={profile.social_twitter || ""}
                            onChange={(e) => setProfile({ ...profile, social_twitter: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="instagram"
                            placeholder="@username"
                            className="pl-10"
                            value={profile.social_instagram || ""}
                            onChange={(e) => setProfile({ ...profile, social_instagram: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="linkedin"
                            placeholder="username"
                            className="pl-10"
                            value={profile.social_linkedin || ""}
                            onChange={(e) => setProfile({ ...profile, social_linkedin: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inbox Tab */}
            <TabsContent value="inbox">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Messages
                  </CardTitle>
                  <CardDescription>
                    Messages from your public profile visitors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Messages Yet</h3>
                      <p className="text-muted-foreground text-sm">
                        Messages from your profile visitors will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`p-4 rounded-lg border ${msg.is_read ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{msg.sender_name}</p>
                              <p className="text-xs text-muted-foreground">{msg.sender_email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-semibold text-sm mb-1">{msg.subject}</p>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Votes Tab */}
            <TabsContent value="votes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    My Voting History
                  </CardTitle>
                  <CardDescription>
                    Track all your votes for the Veteran Podcast Awards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {votes.length === 0 ? (
                    <div className="text-center py-12">
                      <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No Votes Yet</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        You haven't voted in any categories yet.
                      </p>
                      <Button variant="gold" onClick={() => navigate("/categories")}>
                        Start Voting
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {votes.map((vote) => (
                        <div
                          key={vote.id}
                          className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg"
                        >
                          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                            {vote.podcast?.image_url ? (
                              <img
                                src={vote.podcast.image_url}
                                alt={vote.podcast.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Mic className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {vote.podcast?.title || "Unknown Podcast"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vote.category_id} • {vote.year}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Share Tab */}
            <TabsContent value="share">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-primary" />
                      Custom Voting Link
                    </CardTitle>
                    <CardDescription>
                      Share your unique link to invite others to vote
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.custom_voting_link ? (
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/vote/${profile.custom_voting_link}`}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon" onClick={copyVotingLink}>
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

                {profile.user_type === "podcaster" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Promotional Assets
                      </CardTitle>
                      <CardDescription>
                        Download badges and graphics to promote your nomination
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center border border-dashed border-border">
                          <p className="text-sm text-muted-foreground text-center p-4">
                            Coming Soon
                          </p>
                        </div>
                        <div className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center border border-dashed border-border">
                          <p className="text-sm text-muted-foreground text-center p-4">
                            Coming Soon
                          </p>
                        </div>
                        <div className="aspect-square bg-secondary/50 rounded-lg flex items-center justify-center border border-dashed border-border">
                          <p className="text-sm text-muted-foreground text-center p-4">
                            Coming Soon
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose how the app looks to you
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          theme === "light"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                          <Sun className="w-6 h-6 text-amber-500" />
                        </div>
                        <span className="text-sm font-medium">Day</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          theme === "dark"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                          <Moon className="w-6 h-6 text-slate-300" />
                        </div>
                        <span className="text-sm font-medium">Night</span>
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                          theme === "system"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-slate-800 border-2 border-border flex items-center justify-center">
                          <Monitor className="w-6 h-6 text-foreground" />
                        </div>
                        <span className="text-sm font-medium">Auto</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
