import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Share2,
  Loader2,
  CheckCircle,
  ExternalLink,
  Plug,
} from "lucide-react";

const PLATFORMS = [
  { id: "x", label: "X / Twitter", icon: Twitter, color: "bg-black" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-500 to-pink-500" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "bg-red-600" },
  { id: "tiktok", label: "TikTok", icon: Share2, color: "bg-black" },
  { id: "threads", label: "Threads", icon: Share2, color: "bg-zinc-800" },
  { id: "pinterest", label: "Pinterest", icon: Share2, color: "bg-red-700" },
  { id: "reddit", label: "Reddit", icon: Share2, color: "bg-orange-600" },
  { id: "google_business", label: "Google Business", icon: Share2, color: "bg-blue-500" },
];

interface ConnectorsSectionProps {
  userId: string;
}

interface SocialAccount {
  display_name?: string;
  social_images?: string;
  username?: string;
}

export function ConnectorsSection({ userId }: ConnectorsSectionProps) {
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, SocialAccount | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const uploadPostUsername = `vpa-${userId.slice(0, 12)}`;

  useEffect(() => {
    initAndFetch();
  }, [userId]);

  const initAndFetch = async () => {
    setIsLoading(true);

    await supabase.functions.invoke("social-connect", {
      body: { action: "create-user", username: uploadPostUsername },
    });

    const { data } = await supabase.functions.invoke("social-connect", {
      body: { action: "get-user", username: uploadPostUsername },
    });

    if (data?.profile?.social_accounts) {
      setConnectedAccounts(data.profile.social_accounts);
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    setIsConnecting(true);

    const { data, error } = await supabase.functions.invoke("social-connect", {
      body: {
        action: "generate-connect-url",
        username: uploadPostUsername,
        redirectUrl: `${window.location.origin}/dashboard`,
      },
    });

    setIsConnecting(false);

    if (error || !data?.access_url) {
      toast({
        title: "Connection Error",
        description: error?.message || "Could not generate connect link. Try again.",
        variant: "destructive",
      });
      return;
    }

    window.open(data.access_url, "_blank", "noopener,noreferrer");
  };

  const isConnected = (platformId: string): boolean => {
    const account = connectedAccounts[platformId];
    return account !== null && account !== undefined && typeof account === "object" && Object.keys(account).length > 0;
  };

  const getDisplayName = (platformId: string): string | null => {
    const account = connectedAccounts[platformId];
    if (!account || typeof account !== "object") return null;
    return account.display_name || account.username || null;
  };

  const connectedCount = PLATFORMS.filter((p) => isConnected(p.id)).length;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-primary" />
                Social Media Connectors
              </CardTitle>
              <CardDescription>
                Connect your social accounts to post directly from the dashboard
              </CardDescription>
            </div>
            <Button onClick={handleConnect} disabled={isConnecting} variant="gold" size="sm">
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Connect Accounts
            </Button>
          </div>
          {connectedCount > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {connectedCount} of {PLATFORMS.length} platforms connected
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => {
                const connected = isConnected(platform.id);
                const displayName = getDisplayName(platform.id);

                return (
                  <div
                    key={platform.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      connected
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                      <platform.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">{platform.label}</p>
                      {connected && displayName ? (
                        <p className="text-xs text-green-500 truncate">{displayName}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Not connected</p>
                      )}
                    </div>
                    {connected && (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Click <strong>Connect Accounts</strong> to open the Upload Post connection page.
              Link any social account, then return here. Your connected accounts will appear above and
              can be used from the <strong>Share</strong> section to post campaigns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
