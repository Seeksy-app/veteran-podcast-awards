import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  Mail,
  Trophy,
  Share2,
  Plug,
  Mic,
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
    { label: "Followers", value: followerCount, icon: Heart, color: "text-pink-500", bg: "bg-slate-100", show: isPodcaster },
    { label: "Connected", value: connectedCount, icon: Plug, color: "text-emerald-500", bg: "bg-slate-100", show: isPodcaster },
    { label: "Votes Cast", value: voteCount, icon: Vote, color: "text-amber-600", bg: "bg-slate-100", show: true },
    { label: "Unread", value: unreadMessages, icon: Mail, color: "text-blue-500", bg: "bg-slate-100", show: true },
    { label: "Favorites", value: favoritesCount, icon: Heart, color: "text-orange-500", bg: "bg-slate-100", show: true },
  ].filter((s) => s.show);

  const quickActions = [
    { label: "Share Voting Link", desc: "Get your unique link to share", icon: Share2, section: "promotion", show: true },
    { label: "Create Post", desc: "Publish to your social accounts", icon: Mic, section: "promotion", show: isPodcaster },
    { label: "Connect Accounts", desc: "Link your social media", icon: Plug, section: "connectors", show: isPodcaster },
    { label: "View My Votes", desc: "See your voting history", icon: Trophy, section: "votes", show: true },
  ].filter((a) => a.show);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting()}, {userName.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Connect Social Prompt */}
      {isPodcaster && connectedList.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
            <Plug className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">Connect your social accounts</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Link at least one platform to share your voting link and create posts.
            </p>
          </div>
          <Button
            variant="gold"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => onNavigate("connectors")}
          >
            <Plug className="w-4 h-4" />
            Connect
          </Button>
        </div>
      )}

      {/* Connected Accounts Bar */}
      {isPodcaster && connectedList.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connected Accounts</h2>
            <button
              onClick={() => onNavigate("connectors")}
              className="text-xs text-amber-600 hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {connectedList.map(([platformId, account]) => {
              const meta = PLATFORM_META[platformId];
              if (!meta || !account) return null;
              const Icon = meta.icon;
              const avatarUrl = account.social_images;
              return (
                <div
                  key={platformId}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 min-w-[200px] shrink-0 shadow-sm"
                >
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={account.display_name || platformId}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${meta.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${meta.color} flex items-center justify-center ring-2 ring-white`}>
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {account.display_name || account.username || platformId}
                    </p>
                    <p className="text-xs text-slate-400 capitalize truncate">
                      {account.username ? `@${account.username.replace(/^@/, "")}` : platformId.replace("_", " ")}
                    </p>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => onNavigate("connectors")}
              className="flex items-center gap-2 bg-white border border-dashed border-slate-300 rounded-xl px-5 py-3 min-w-[140px] shrink-0 hover:border-slate-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Add more</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.section)}
              className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-slate-300 hover:shadow-md transition-all group shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                <action.icon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Key Dates */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Upcoming</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
              <Vote className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Voting Opens</p>
              <p className="text-sm text-slate-500">October 5, 2026 &middot; National Military Podcast Day</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Awards Ceremony</p>
              <p className="text-sm text-slate-500">November 11, 2026 &middot; Veterans Day &middot; 6 PM ET</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
