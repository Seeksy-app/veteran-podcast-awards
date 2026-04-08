import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSelector } from '@/components/theme/ThemeToggle';
import { TechStackPanel } from '@/components/admin/TechStackPanel';
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { InvestorMetricsPanel } from '@/components/investor/InvestorMetricsPanel';
import { OpportunityContent } from '@/components/investor/OpportunityContent';
import { useInvestorTracking } from '@/hooks/useInvestorTracking';
import { useDeckTracking } from '@/hooks/useDeckTracking';
import { Layers, ShieldCheck, BarChart3, Video, Lock, LogIn, FileText } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/vpa-logo.png';

type InvestorAccessRow = Tables<'investor_access'>;

interface InvestorVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
}

const TAB_CONFIG = [
  { id: 'video', label: 'Video', icon: Video },
  { id: 'opportunity', label: 'Opportunity', icon: FileText },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'tech-stack', label: 'Tech stack', icon: Layers },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

function normalizeAccessCode(raw: string) {
  return raw.trim().toUpperCase();
}

/** Direct table lookup (requires RLS policies + URL/key for the same Supabase project as the data). */
async function fetchInvestorAccessByCode(codeRaw: string) {
  const code = normalizeAccessCode(codeRaw);
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('investor_access')
    .select('*')
    .eq('access_code', code)
    .eq('is_active', true)
    .gt('expires_at', nowIso)
    .maybeSingle();

  if (error) throw error;
  return data as InvestorAccessRow | null;
}

async function fetchInvestorAccessByEmailAndCode(emailRaw: string, codeRaw: string) {
  const email = emailRaw.toLowerCase().trim();
  const code = normalizeAccessCode(codeRaw);
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('investor_access')
    .select('*')
    .eq('email', email)
    .eq('access_code', code)
    .eq('is_active', true)
    .gt('expires_at', nowIso)
    .maybeSingle();

  if (error) throw error;
  return data as InvestorAccessRow | null;
}

async function touchLastAccessedAt(id: string) {
  const { error } = await supabase
    .from('investor_access')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) console.warn('investor_access last_accessed_at update failed:', error.message);
}

const InvestorPage = () => {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code')?.trim() ?? '';
  const [accessCode, setAccessCode] = useState(searchParams.get('code') || '');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessData, setAccessData] = useState<InvestorAccessRow | null>(null);
  const hasTrackedOpen = useRef(false);
  const hasTrackedDeckView = useRef(false);
  const urlAuthApplied = useRef(false);

  const { trackPageView: trackDeckPageView } = useDeckTracking();

  const trackingContext =
    accessData?.id && accessData.email
      ? {
          email: accessData.email,
          investorAccessId: accessData.id,
        }
      : null;

  const { trackPortalOpen, trackTabClick, trackVideoProgress } = useInvestorTracking(trackingContext);

  const urlAccessQuery = useQuery({
    queryKey: ['investor-access-by-code', codeFromUrl],
    queryFn: () => fetchInvestorAccessByCode(codeFromUrl),
    enabled: Boolean(codeFromUrl) && !isAuthenticated,
    retry: false,
  });

  const verifyAccessMutation = useMutation({
    mutationFn: async ({ email: em, code }: { email: string; code: string }) => {
      const row = await fetchInvestorAccessByEmailAndCode(em, code);
      if (!row) {
        throw new Error('Invalid email or access code, or access has expired.');
      }
      return row;
    },
    onSuccess: async (data) => {
      await touchLastAccessedAt(data.id);
      setAccessData(data);
      setIsAuthenticated(true);
      toast.success('Access verified');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    const row = urlAccessQuery.data;
    if (row === undefined || row === null || isAuthenticated || urlAuthApplied.current) return;
    urlAuthApplied.current = true;
    void (async () => {
      await touchLastAccessedAt(row.id);
      setAccessData(row);
      setIsAuthenticated(true);
    })();
  }, [urlAccessQuery.data, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && accessData?.id && accessData?.email && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      trackPortalOpen();
    }
  }, [isAuthenticated, accessData, trackPortalOpen]);

  useEffect(() => {
    if (!isAuthenticated || !accessData?.id || hasTrackedDeckView.current) return;
    hasTrackedDeckView.current = true;
    trackDeckPageView();
  }, [isAuthenticated, accessData?.id, trackDeckPageView]);

  const { data: videos } = useQuery({
    queryKey: ['investor-videos-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_videos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as InvestorVideo[];
    },
    enabled: isAuthenticated && Boolean(accessData?.allowed_tabs?.includes('video')),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !accessCode) {
      toast.error('Please enter both email and access code');
      return;
    }
    verifyAccessMutation.mutate({ email, code: accessCode });
  };

  useEffect(() => {
    const c = searchParams.get('code');
    if (c) setAccessCode(c);
  }, [searchParams]);

  const urlDeniedNoRow =
    Boolean(codeFromUrl) &&
    !isAuthenticated &&
    urlAccessQuery.isSuccess &&
    urlAccessQuery.data === null;

  const urlVerifyFailed =
    Boolean(codeFromUrl) &&
    !isAuthenticated &&
    (urlAccessQuery.isError || urlDeniedNoRow);

  const shell = 'min-h-screen bg-[hsl(222_47%_11%)] text-[hsl(45_20%_96%)]';
  const cardSurface = 'border-[hsl(43_72%_45%/0.35)] bg-[hsl(222_35%_16%)] text-[hsl(45_20%_96%)]';
  const mutedOnNavy = 'text-[hsl(45_15%_72%)]';
  const goldText = 'text-[hsl(43_72%_52%)]';

  if (Boolean(codeFromUrl) && !isAuthenticated && urlAccessQuery.isPending) {
    return (
      <div className={`${shell} flex items-center justify-center p-4`}>
        <Card className={`w-full max-w-md ${cardSurface}`}>
          <CardHeader className="text-center">
            <img src={logo} alt="VPA Logo" className="w-16 h-16 mx-auto mb-4" />
            <CardTitle className={`font-serif text-2xl ${goldText}`}>Verifying access…</CardTitle>
            <CardDescription className={mutedOnNavy}>Please wait while we validate your link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (urlVerifyFailed) {
    let detail = 'Invalid or expired access code.';
    if (urlAccessQuery.isError) {
      const err = urlAccessQuery.error as Error & { message?: string };
      detail =
        err?.message?.includes('JWT') || err?.message?.includes('Invalid API key')
          ? 'Configuration error: Supabase URL and anon key must be for the same project (VPA: zkruwrpkfxehbwxtjhdz).'
          : err?.message || 'Unable to verify access. Check your connection or try again.';
    }

    return (
      <div className={`${shell} flex items-center justify-center p-4`}>
        <Card className={`w-full max-w-md ${cardSurface}`}>
          <CardHeader className="text-center">
            <img src={logo} alt="VPA Logo" className="w-16 h-16 mx-auto mb-4" />
            <CardTitle className={`font-serif text-2xl ${goldText}`}>Access denied</CardTitle>
            <CardDescription className={mutedOnNavy}>{detail}</CardDescription>
          </CardHeader>
          <CardContent className={`text-center text-sm ${mutedOnNavy}`}>
            <p>
              If you have an email and code, open{' '}
              <a href="/investor" className={`${goldText} underline`}>
                /investor
              </a>{' '}
              and sign in manually.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`${shell} flex items-center justify-center p-4`}>
        <Card className={`w-full max-w-md ${cardSurface}`}>
          <CardHeader className="text-center">
            <img src={logo} alt="VPA Logo" className="w-16 h-16 mx-auto mb-4" />
            <CardTitle className={`font-serif text-2xl ${goldText}`}>Investor portal</CardTitle>
            <CardDescription className={mutedOnNavy}>
              Enter your email and access code to view platform information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={mutedOnNavy}>
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[hsl(222_40%_12%)] border-[hsl(43_72%_45%/0.35)] text-[hsl(45_20%_96%)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className={mutedOnNavy}>
                  Access code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="XXXXXXXX"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-wider bg-[hsl(222_40%_12%)] border-[hsl(43_72%_45%/0.35)] text-[hsl(45_20%_96%)]"
                  maxLength={8}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[hsl(43_72%_45%)] text-[hsl(222_47%_11%)] hover:bg-[hsl(43_72%_52%)]"
                disabled={verifyAccessMutation.isPending}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {verifyAccessMutation.isPending ? 'Verifying...' : 'Access portal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allowedTabs = TAB_CONFIG.filter((tab) => accessData?.allowed_tabs?.includes(tab.id));
  const defaultTab = allowedTabs[0]?.id || 'metrics';

  return (
    <div className={`${shell}`}>
      <header className="sticky top-0 z-50 border-b border-[hsl(43_72%_45%/0.25)] bg-[hsl(222_40%_14%)]/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="VPA Logo" className="w-10 h-10" />
            <div>
              <h1 className={`font-serif text-lg font-bold ${goldText}`}>Investor portal</h1>
              <p className={`text-xs ${mutedOnNavy}`}>Veteran Podcast Awards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector showLabels={false} />
            <span className={`text-sm ${mutedOnNavy} hidden md:block`}>{accessData?.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue={defaultTab}
          className="space-y-6"
          onValueChange={(value) => {
            const tab = TAB_CONFIG.find((t) => t.id === value);
            if (tab && accessData?.allowed_tabs?.includes(value)) {
              trackTabClick(value, tab.label);
            }
          }}
        >
          <TabsList className="inline-flex bg-[hsl(222_35%_18%)] border border-[hsl(43_72%_45%/0.25)]">
            {TAB_CONFIG.map((tab) => {
              const isAllowed = accessData?.allowed_tabs?.includes(tab.id);
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={!isAllowed}
                  className={`gap-2 data-[state=active]:bg-[hsl(43_72%_45%/0.2)] data-[state=active]:text-[hsl(43_72%_58%)] ${!isAllowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {isAllowed ? <Icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="metrics" className="rounded-lg border border-[hsl(43_72%_45%/0.2)] bg-[hsl(222_35%_14%)]/50 p-4">
            <InvestorMetricsPanel />
          </TabsContent>

          <TabsContent value="tech-stack" className="rounded-lg border border-[hsl(43_72%_45%/0.2)] bg-[hsl(222_35%_14%)]/50 p-4">
            <TechStackPanel />
          </TabsContent>

          <TabsContent value="security" className="rounded-lg border border-[hsl(43_72%_45%/0.2)] bg-[hsl(222_35%_14%)]/50 p-4">
            <SecurityPanel />
          </TabsContent>

          <TabsContent value="video">
            <div className="space-y-6">
              <div>
                <h2 className={`font-serif text-2xl font-bold ${goldText}`}>Platform videos</h2>
                <p className={mutedOnNavy}>Watch platform demos and presentations</p>
              </div>
              {!videos?.length ? (
                <Card className={cardSurface}>
                  <CardContent className={`py-12 text-center ${mutedOnNavy}`}>
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No videos available at this time</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {videos.map((video) => (
                    <Card key={video.id} className={cardSurface}>
                      <CardHeader>
                        <CardTitle className={goldText}>{video.title}</CardTitle>
                        {video.description && (
                          <CardDescription className={mutedOnNavy}>{video.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <video
                          src={video.video_url}
                          controls
                          className="w-full rounded-lg border border-[hsl(43_72%_45%/0.2)]"
                          preload="metadata"
                          onTimeUpdate={(e) => {
                            const videoEl = e.currentTarget;
                            if (videoEl.duration > 0) {
                              const percent = Math.floor((videoEl.currentTime / videoEl.duration) * 100);
                              trackVideoProgress(
                                video.id,
                                video.title,
                                percent,
                                Math.floor(videoEl.duration)
                              );
                            }
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="opportunity" className="rounded-lg border border-[hsl(43_72%_45%/0.2)] bg-[hsl(222_35%_14%)]/50 p-4">
            <OpportunityContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InvestorPage;
