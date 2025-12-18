import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSelector } from '@/components/theme/ThemeToggle';
import { TechStackPanel } from '@/components/admin/TechStackPanel';
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { BusinessMetricsPanel } from '@/components/admin/BusinessMetricsPanel';
import { OpportunityContent } from '@/components/investor/OpportunityContent';
import { useInvestorTracking } from '@/hooks/useInvestorTracking';
import { Shield, Layers, ShieldCheck, BarChart3, Video, Lock, LogIn, FileText } from 'lucide-react';
import { isAfter } from 'date-fns';
import { toast } from 'sonner';
import logo from '@/assets/vpa-logo.png';

interface InvestorAccess {
  id: string;
  email: string;
  allowed_tabs: string[];
  expires_at: string;
  is_active: boolean;
  status: string;
}

interface InvestorVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
}

const TAB_CONFIG = [
  { id: 'video', label: 'Video', icon: Video },
  { id: 'opportunity', label: 'Opportunity', icon: FileText },
  { id: 'metrics', label: 'Business Metrics', icon: BarChart3 },
  { id: 'tech-stack', label: 'Tech Stack', icon: Layers },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

const InvestorPortal = () => {
  const [searchParams] = useSearchParams();
  const [accessCode, setAccessCode] = useState(searchParams.get('code') || '');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessData, setAccessData] = useState<InvestorAccess | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const hasTrackedOpen = useRef(false);

  const trackingContext = accessData ? {
    email: accessData.email,
    investorAccessId: accessData.id,
  } : null;

  const { trackPortalOpen, trackTabClick, trackVideoProgress } = useInvestorTracking(trackingContext);

  const verifyAccessMutation = useMutation({
    mutationFn: async ({ email, code }: { email: string; code: string }) => {
      // Use secure RPC function instead of direct table query
      const { data, error } = await supabase
        .rpc('verify_investor_access', {
          p_email: email.toLowerCase().trim(),
          p_access_code: code.toUpperCase().trim()
        });

      if (error) throw new Error('Unable to verify access. Please try again.');
      if (!data || data.length === 0) throw new Error('Unable to verify access. Please try again.');

      const access = data[0] as InvestorAccess;
      
      // Handle different status responses
      if (access.status === 'not_found') {
        throw new Error('Invalid email or access code. Please check your credentials.');
      }
      if (access.status === 'disabled') {
        throw new Error('This access code has been disabled. Please contact the administrator.');
      }
      if (access.status === 'expired') {
        throw new Error('This access code has expired. Please contact the administrator for a new code.');
      }
      
      return access;
    },
    onSuccess: (data) => {
      setAccessData(data);
      setIsAuthenticated(true);
      toast.success('Access verified');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Track portal open after successful authentication
  useEffect(() => {
    if (isAuthenticated && accessData && !hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      trackPortalOpen();
    }
  }, [isAuthenticated, accessData, trackPortalOpen]);

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
    enabled: isAuthenticated && accessData?.allowed_tabs.includes('video'),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !accessCode) {
      toast.error('Please enter both email and access code');
      return;
    }
    verifyAccessMutation.mutate({ email, code: accessCode });
  };

  // Auto-verify if code is in URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setAccessCode(codeFromUrl);
    }
  }, [searchParams]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={logo} alt="VPA Logo" className="w-16 h-16 mx-auto mb-4" />
            <CardTitle className="font-serif text-2xl">Opportunity Portal</CardTitle>
            <CardDescription>
              Enter your email and access code to view platform information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Access Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="XXXXXXXX"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="font-mono tracking-wider"
                  maxLength={8}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={verifyAccessMutation.isPending}>
                <LogIn className="w-4 h-4 mr-2" />
                {verifyAccessMutation.isPending ? 'Verifying...' : 'Access Portal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allowedTabs = TAB_CONFIG.filter((tab) => accessData?.allowed_tabs.includes(tab.id));
  const defaultTab = allowedTabs[0]?.id || 'metrics';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="VPA Logo" className="w-10 h-10" />
            <div>
              <h1 className="font-serif text-lg font-bold text-foreground">Opportunity Portal</h1>
              <p className="text-xs text-muted-foreground">Veteran Podcast Awards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector showLabels={false} />
            <span className="text-sm text-muted-foreground hidden md:block">{accessData?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs 
          defaultValue={defaultTab} 
          className="space-y-6"
          onValueChange={(value) => {
            setActiveTab(value);
            const tab = TAB_CONFIG.find(t => t.id === value);
            if (tab && accessData?.allowed_tabs.includes(value)) {
              trackTabClick(value, tab.label);
            }
          }}
        >
          <TabsList className="inline-flex">
            {TAB_CONFIG.map((tab) => {
              const isAllowed = accessData?.allowed_tabs.includes(tab.id);
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  disabled={!isAllowed}
                  className={`gap-2 ${!isAllowed ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {isAllowed ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="metrics">
            <BusinessMetricsPanel />
          </TabsContent>

          <TabsContent value="tech-stack">
            <TechStackPanel />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPanel />
          </TabsContent>

          <TabsContent value="video">
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Platform Videos</h2>
                <p className="text-muted-foreground">Watch platform demos and presentations</p>
              </div>
              {!videos?.length ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No videos available at this time</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {videos.map((video) => (
                    <Card key={video.id}>
                      <CardHeader>
                        <CardTitle>{video.title}</CardTitle>
                        {video.description && (
                          <CardDescription>{video.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <video
                          src={video.video_url}
                          controls
                          className="w-full rounded-lg"
                          preload="metadata"
                          onTimeUpdate={(e) => {
                            const videoEl = e.currentTarget;
                            if (videoEl.duration > 0) {
                              const percent = Math.floor((videoEl.currentTime / videoEl.duration) * 100);
                              trackVideoProgress(video.id, video.title, percent, Math.floor(videoEl.duration));
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

          <TabsContent value="opportunity">
            <OpportunityContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InvestorPortal;
