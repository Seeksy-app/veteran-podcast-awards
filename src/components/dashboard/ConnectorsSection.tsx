import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, Plug } from "lucide-react";

// ── Brand SVG icons ──────────────────────────────────────────────────────────
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.52.85-6.374 2.495-8.423C5.845 1.341 8.598.16 12.179.136h.014c2.696.016 5.046.788 6.984 2.295 1.906 1.483 3.24 3.601 3.968 6.296l-2.568.69c-.546-2.042-1.508-3.618-2.858-4.684-1.328-1.047-3.048-1.601-5.117-1.613-2.66.016-4.783.905-6.3 2.641C4.78 7.5 4.018 9.853 4.018 12.068c0 2.21.762 4.562 2.284 6.307 1.517 1.736 3.64 2.625 6.3 2.641 2.025-.011 3.687-.51 4.944-1.484 1.29-.996 2.02-2.42 2.171-4.233a4.527 4.527 0 0 0-1.017-3.213c-.69-.799-1.648-1.253-2.828-1.353-.213 2.19-1.021 3.724-2.404 4.562-1.075.647-2.378.78-3.68.38-1.276-.39-2.244-1.275-2.73-2.49-.342-.862-.376-1.793-.097-2.69.456-1.45 1.603-2.44 3.175-2.763 1.037-.213 2.083-.104 2.932.31.109.054.214.11.314.17.137.081.265.17.384.265-.165-.857-.234-1.752-.213-2.673l2.541.06c-.05 2.121.403 3.896 1.344 5.281.52.766 1.07 1.316 1.638 1.638a5.51 5.51 0 0 0-.194 1.35c-.216 2.59-1.294 4.582-3.204 5.921-1.565 1.094-3.515 1.645-5.799 1.657z" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const GoogleBusinessIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
    <path d="M12 0C5.384 0 0 5.384 0 12s5.384 12 12 12 12-5.384 12-12S18.616 0 12 0zm.003 4.8h.217c.217 0 .433.007.648.022L9.91 7.8l-2.07 3.578-.002.002a3.6 3.6 0 0 0-.538 1.854v.003a3.6 3.6 0 1 0 7.198 0v-.003a3.6 3.6 0 0 0-3.6-3.6h-.014l2.07-3.578L14.99 4.9a7.197 7.197 0 0 1 4.81 6.766c0 3.978-3.221 7.2-7.2 7.2A7.2 7.2 0 1 1 12.003 4.8z" />
  </svg>
);

const PLATFORMS = [
  { id: "x", label: "X / Twitter", Icon: XIcon, color: "bg-black" },
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon, color: "bg-[#1877F2]" },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon, color: "bg-[#0A66C2]" },
  { id: "youtube", label: "YouTube", Icon: YouTubeIcon, color: "bg-[#FF0000]" },
  { id: "tiktok", label: "TikTok", Icon: TikTokIcon, color: "bg-black" },
  { id: "threads", label: "Threads", Icon: ThreadsIcon, color: "bg-zinc-900" },
  { id: "pinterest", label: "Pinterest", Icon: PinterestIcon, color: "bg-[#E60023]" },
  { id: "reddit", label: "Reddit", Icon: RedditIcon, color: "bg-[#FF4500]" },
  { id: "google_business", label: "Google Business", Icon: GoogleBusinessIcon, color: "bg-[#4285F4]" },
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
                <Plug className="w-5 h-5 text-amber-600" />
                Social Media Connectors
              </CardTitle>
              <CardDescription>
                Click any platform below to connect your account
              </CardDescription>
            </div>
            <Button onClick={handleConnect} disabled={isConnecting} variant="gold" size="sm">
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plug className="w-4 h-4 mr-2" />
              )}
              Connect All
            </Button>
          </div>
          {connectedCount > 0 && (
            <p className="text-sm text-slate-500 mt-2">
              {connectedCount} of {PLATFORMS.length} platforms connected
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLATFORMS.map((platform) => {
                const connected = isConnected(platform.id);
                const displayName = getDisplayName(platform.id);
                const { Icon } = platform;

                return (
                  <button
                    key={platform.id}
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      connected
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center shrink-0`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900">{platform.label}</p>
                      {connected && displayName ? (
                        <p className="text-xs text-green-600 truncate">{displayName}</p>
                      ) : (
                        <p className="text-xs text-slate-400">Tap to connect</p>
                      )}
                    </div>
                    {connected && (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">
              Clicking any platform opens a secure connection window. Once linked, your accounts can be used to share your voting link and publish posts directly from the{" "}
              <strong className="text-slate-800">Share</strong> section.
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Social connections are managed by{" "}
              <a
                href="https://uploadpost.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-600"
              >
                Upload Post
              </a>
              , our third-party social media integration partner. VPA does not store your social media credentials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
