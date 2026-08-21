import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  Mail,
  Trophy,
  Share2,
  Plug,
  Mic,
  TrendingUp,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  ExternalLink,
  Vote,
  ArrowRight,
} from "lucide-react";

const PLATFORM_META: Record<string, { icon: typeof Twitter; color: string }> = {
  x: { icon: Twitter, color: "bg-black" },
  instagram: { icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  facebook: { icon: Facebook, color: "bg-blue-600" },
  linkedin: { icon: Linkedin, color: "bg-blue-700" },
  youtube: { icon: Youtube, color: "bg-red-600" },
  tiktok: { icon: Share2, color: "bg-black" },
  threads: { icon: Share2, color: "bg-zinc-800" },
  pinterest: { icon: Share2, color: "bg-red-700" },
  reddit: { icon: Share2, color: "bg-orange-600" },
  google_business: { icon: Share2, color: "bg-blue-500" },
};

interface SocialAccount {
  display_name?: string;
  social_images?: string;
  username?: string;
}

interface DashboardHomeProps {
  userId: string;
  userName: string;
  isPodcaster: boolean;
  followerCount: number;
  voteCount: number;
  unreadMessages: number;
  favoritesCount: number;
  onNavigate: (section: string) => void;
}

export function DashboardHome({
  userId,
  userName,
  isPodcaster,
  followerCount,
  voteCount,
  unreadMessages,
  favoritesCount,
  onNavigate,
}: DashboardHomeProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, SocialAccount | null>>({});
  const [connectedCount, setConnectedCount] = useState(0);

  useEffect(() => {
    if (isPodcaster) fetchSocialAccounts();
  }, [userId, isPodcaster]);

  const fetchSocialAccounts = async () => {
    const username = `vpa-${userId.slice(0, 12)}`;
    const { data } = await supabase.functions.invoke("social-connect", {
      body: { action: "get-user", username },
    });
    if (data?.profile?.social_accounts) {
      setConnectedAccounts(data.profile.social_accounts);
      const count = Object.values(data.profile.social_accounts).filter(
        (a: any) => a !== null && typeof a === "object" && Object.keys(a).length > 0
      ).length;
      setConnectedCount(count);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const connectedList = Object.entries(connectedAccounts).filter(
    ([, a]) => a !== null && typeof a === "object" && Object.keys(a as object).length > 0
  );

  const stats = [
    { label: "Followers", value: followerCount, icon: Heart, color: "text-pink-500", show: isPodcaster },
    { label: "Connected", value: connectedCount, icon: Plug, color: "text-green-500", show: isPodcaster },
    { label: "Votes Cast", value: voteCount, icon: Vote, color: "text-primary", show: true },
    { label: "Unread", value: unreadMessages, icon: Mail, color: "text-blue-500", show: true },
    { label: "Favorites", value: favoritesCount, icon: Heart, color: "text-amber-500", show: true },
  ].filter((s) => s.show);

  const quickActions = [
    { label: "Share Voting Link", desc: "Get your unique link to share", icon: Share2, section: "share", show: true },
    { label: "Create Post", desc: "Publish to your social accounts", icon: Mic, section: "share", show: isPodcaster },
    { label: "Connect Accounts", desc: "Link your social media", icon: Plug, section: "connectors", show: isPodcaster },
    { label: "View My Votes", desc: "See your voting history", icon: Trophy, section: "votes", show: true },
  ].filter((a) => a.show);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8">
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">Your Dashboard</p>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
          {greeting()}, {userName.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-2">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Connected Accounts Bar (podcasters) */}
      {isPodcaster && connectedList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Connected Accounts</h2>
            <button
              onClick={() => onNavigate("connectors")}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {connectedList.map(([platformId, account]) => {
              const meta = PLATFORM_META[platformId];
              if (!meta || !account) return null;
              const Icon = meta.icon;
              return (
                <div
                  key={platformId}
                  className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 min-w-[180px] shrink-0"
                >
                  <div className={`w-9 h-9 rounded-lg ${meta.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {account.display_name || account.username || platformId}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{platformId.replace("_", " ")}</p>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => onNavigate("connectors")}
              className="flex items-center gap-2 bg-secondary/50 border border-dashed border-border rounded-xl px-5 py-3 min-w-[140px] shrink-0 hover:border-primary/50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add more</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.section)}
              className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:bg-primary/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Key Dates */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Upcoming</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Vote className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Voting Opens</p>
                <p className="text-sm text-muted-foreground">October 5, 2026 &middot; National Military Podcast Day</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Awards Ceremony</p>
                <p className="text-sm text-muted-foreground">November 11, 2026 &middot; Veterans Day &middot; 6 PM ET</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
