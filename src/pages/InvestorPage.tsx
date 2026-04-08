import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestorTechStackPanel } from '@/components/investor/InvestorTechStackPanel';
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { InvestorMetricsPanel } from '@/components/investor/InvestorMetricsPanel';
import { OpportunityContent } from '@/components/investor/OpportunityContent';
import { useInvestorTracking } from '@/hooks/useInvestorTracking';
import { useDeckTracking } from '@/hooks/useDeckTracking';
import { Layers, ShieldCheck, BarChart3, Video, Lock, FileText } from 'lucide-react';
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

/** Persisted verified email for returning visitors (email-only auth). */
const INVESTOR_EMAIL_STORAGE_KEY = 'vpa_investor_email';

async function fetchInvestorAccessByEmail(emailRaw: string): Promise<InvestorAccessRow | null> {
  const email = emailRaw.toLowerCase().trim();
  const nowIso = new Date().toISOString();
  /** Case-insensitive match so stored email casing does not block login. */
  const { data, error } = await supabase
    .from('investor_access')
    .select('*')
    .ilike('email', email)
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

/** HeyGen / embed URLs → iframe; `.mp4` → native video; other https pages → iframe. */
function videoPresentation(url: string): 'iframe' | 'mp4' {
  const t = url.trim();
  const lower = t.toLowerCase();
  const path = lower.split(/[?#]/)[0];
  if (path.endsWith('.mp4')) return 'mp4';
  if (lower.includes('embeds') || lower.includes('heygen')) return 'iframe';
  if (lower.startsWith('http://') || lower.startsWith('https://')) return 'iframe';
  return 'mp4';
}

const InvestorPage = () => {
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessData, setAccessData] = useState<InvestorAccessRow | null>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [notOnList, setNotOnList] = useState(false);
  const hasTrackedDeckView = useRef(false);

  const { trackPageView: trackDeckPageView } = useDeckTracking();

  const trackingContext =
    accessData?.id && accessData.email
      ? {
          email: accessData.email,
          investorAccessId: accessData.id,
        }
      : null;

  const { trackLogin, trackTabView, trackVideoProgress, resetVideoTracking } = useInvestorTracking(trackingContext);

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(INVESTOR_EMAIL_STORAGE_KEY);
    if (!stored?.trim()) {
      setRestoringSession(false);
      return;
    }
    const normalized = stored.toLowerCase().trim();
    void (async () => {
      try {
        const row = await fetchInvestorAccessByEmail(normalized);
        if (cancelled) return;
        if (row) {
          setAccessData(row);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(INVESTOR_EMAIL_STORAGE_KEY);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn('investor session restore failed:', e);
          localStorage.removeItem(INVESTOR_EMAIL_STORAGE_KEY);
        }
      } finally {
        if (!cancelled) setRestoringSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const verifyAccessMutation = useMutation({
    mutationFn: (emailInput: string) => fetchInvestorAccessByEmail(emailInput),
    onSuccess: async (row, emailInput) => {
      if (!row) {
        setNotOnList(true);
        return;
      }
      setNotOnList(false);
      const normalized = emailInput.toLowerCase().trim();
      localStorage.setItem(INVESTOR_EMAIL_STORAGE_KEY, normalized);

      await touchLastAccessedAt(row.id);
      await trackLogin({
        email: row.email,
        investorAccessId: row.id,
      });

      setAccessData(row);
      setIsAuthenticated(true);
      toast.success('Access verified');
    },
    onError: (error: Error) => {
      const msg = error.message || '';
      if (msg.includes('JWT') || msg.includes('Invalid API key')) {
        toast.error(
          'Configuration error: Supabase URL and anon key must be for the same project as this app.',
        );
        return;
      }
      toast.error(msg || 'Unable to verify access. Check your connection and try again.');
    },
  });

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
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Please enter your email address');
      return;
    }
    setNotOnList(false);
    verifyAccessMutation.mutate(trimmed.toLowerCase().trim());
  };

  const handleSignOut = () => {
    resetVideoTracking();
    localStorage.removeItem(INVESTOR_EMAIL_STORAGE_KEY);
    setIsAuthenticated(false);
    setAccessData(null);
    setEmail('');
    hasTrackedDeckView.current = false;
  };

  const shell = 'min-h-screen bg-[#0A1628] text-white';
  const cardSurface =
    'border border-[#F59E0B]/25 bg-[#0F2035] text-white shadow-[0_0_0_1px_rgba(245,158,11,0.08)]';
  const mutedSecondary = 'text-[#94A3B8]';
  const goldText = 'text-[#F59E0B]';

  if (restoringSession) {
    return (
      <div className={`${shell} flex min-h-screen items-center justify-center p-6`}>
        <Card className={`w-full max-w-md ${cardSurface}`}>
          <CardHeader className="space-y-3 text-center">
            <img src={logo} alt="VPA" className="mx-auto h-20 w-20 object-contain" />
            <CardDescription className={`${mutedSecondary} text-base`}>Restoring session…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`${shell} flex min-h-screen flex-col items-center justify-center px-4 py-12`}
      >
        <Card
          className={`w-full max-w-md border-2 border-[#F59E0B]/20 bg-[#0F2035] shadow-[0_24px_80px_rgba(0,0,0,0.45)]`}
        >
          <CardHeader className="space-y-4 pb-2 text-center">
            <img src={logo} alt="Veteran Podcast Awards" className="mx-auto h-24 w-24 object-contain" />
            <p className={`font-serif text-lg leading-snug text-white md:text-xl`}>
              Enter your email to access the investor portal
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="investor-email" className={`${mutedSecondary} text-sm font-medium`}>
                  Email
                </Label>
                <Input
                  id="investor-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 border-[#F59E0B]/35 bg-[#0A1628] text-white ring-offset-[#0A1628] placeholder:text-[#94A3B8]/60 focus-visible:border-[#F59E0B] focus-visible:ring-[#F59E0B]/30"
                />
              </div>
              {notOnList && (
                <p
                  role="alert"
                  className="rounded-lg border border-[#F59E0B]/20 bg-[#0A1628]/80 p-3 text-sm leading-relaxed text-[#94A3B8]"
                >
                  Your email is not on the access list. Contact us at{' '}
                  <a href="mailto:hello@empowerify.io" className={`${goldText} font-medium underline underline-offset-2`}>
                    hello@empowerify.io
                  </a>{' '}
                  to request access.
                </p>
              )}
              <Button
                type="submit"
                className="h-11 w-full bg-[#F59E0B] text-base font-semibold text-[#0A1628] shadow-sm transition-colors hover:bg-[#FBBF24]"
                disabled={verifyAccessMutation.isPending}
              >
                {verifyAccessMutation.isPending ? 'Verifying…' : 'Access Portal'}
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
    <div className={shell}>
      <header className="sticky top-0 z-50 border-b border-[#F59E0B]/40 bg-[#0A1628]/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img src={logo} alt="VPA" className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11" />
            <h1 className="font-serif text-lg font-semibold tracking-tight text-white sm:text-xl">
              Investor Portal
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className={`shrink-0 text-sm font-medium ${goldText} underline-offset-4 transition-colors hover:text-[#FBBF24] hover:underline`}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue={defaultTab}
          className="space-y-6"
          onValueChange={(value) => {
            const tab = TAB_CONFIG.find((t) => t.id === value);
            if (tab && accessData?.allowed_tabs?.includes(value)) {
              void trackTabView(value, tab.label);
            }
          }}
        >
          <TabsList className="flex w-full flex-wrap gap-0 rounded-none border-0 bg-[#0F2035] p-0 shadow-inner">
            {TAB_CONFIG.map((tab) => {
              const isAllowed = accessData?.allowed_tabs?.includes(tab.id);
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={!isAllowed}
                  className={`flex-1 gap-2 rounded-none border-b-2 border-transparent bg-transparent px-3 py-3 text-sm font-medium text-[#94A3B8] transition-colors data-[state=active]:border-[#F59E0B] data-[state=active]:bg-[#0A1628] data-[state=active]:text-[#F59E0B] data-[state=active]:shadow-none sm:flex-none sm:px-5 ${!isAllowed ? 'cursor-not-allowed opacity-35' : 'hover:text-white'}`}
                >
                  {isAllowed ? <Icon className="h-4 w-4 shrink-0" /> : <Lock className="h-4 w-4 shrink-0" />}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="metrics" className="rounded-xl border border-[#F59E0B]/15 bg-[#0A1628] p-4 md:p-6">
            <InvestorMetricsPanel />
          </TabsContent>

          <TabsContent value="tech-stack" className="rounded-xl border border-[#F59E0B]/15 bg-[#0A1628] p-4 md:p-6">
            <InvestorTechStackPanel />
          </TabsContent>

          <TabsContent value="security" className="rounded-xl border border-[#F59E0B]/15 bg-[#0A1628] p-4 md:p-6">
            <SecurityPanel variant="investor" />
          </TabsContent>

          <TabsContent value="video">
            <div className="space-y-6">
              <div>
                <h2 className={`font-serif text-2xl font-bold ${goldText}`}>Platform videos</h2>
                <p className={mutedSecondary}>Watch platform demos and presentations</p>
              </div>
              {!videos?.length ? (
                <Card className={cardSurface}>
                  <CardContent className={`py-12 text-center ${mutedSecondary}`}>
                    <Video className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No videos available at this time</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {videos.map((video) => (
                    <Card key={video.id} className={cardSurface}>
                      <CardHeader>
                        <CardTitle className={`font-serif text-xl ${goldText}`}>{video.title}</CardTitle>
                        {video.description && (
                          <CardDescription className={mutedSecondary}>{video.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {videoPresentation(video.video_url) === 'iframe' ? (
                          <div className="w-full overflow-hidden rounded-lg border border-[#F59E0B]/25 bg-[#0A1628] shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
                            <iframe
                              src={video.video_url}
                              title={video.title}
                              width="100%"
                              height={480}
                              className="block max-h-[480px] min-h-[240px] w-full border-0"
                              allow="encrypted-media; fullscreen"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <video
                            src={video.video_url}
                            controls
                            className="w-full rounded-lg border border-[#F59E0B]/25 bg-black/30"
                            preload="metadata"
                            onTimeUpdate={(e) => {
                              const videoEl = e.currentTarget;
                              if (videoEl.duration > 0) {
                                const percent = Math.floor((videoEl.currentTime / videoEl.duration) * 100);
                                trackVideoProgress(
                                  video.id,
                                  video.title,
                                  percent,
                                  Math.floor(videoEl.duration),
                                );
                              }
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="opportunity" className="rounded-xl border border-[#F59E0B]/15 bg-[#0A1628] p-4 md:p-6">
            <OpportunityContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InvestorPage;
