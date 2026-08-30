import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { SponsorList } from '@/components/admin/SponsorList';
import { SponsorTiersManager } from '@/components/admin/SponsorTiersManager';
import { PodcastManager } from '@/components/admin/PodcastManager';
import { UserManager } from '@/components/admin/UserManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { TechStackPanel } from '@/components/admin/TechStackPanel';
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { BusinessMetricsPanel } from '@/components/admin/BusinessMetricsPanel';
import { InvestorAccessManager } from '@/components/admin/InvestorAccessManager';
import { ShareLinkManager } from '@/components/admin/ShareLinkManager';
import { InvestorVideoManager } from '@/components/admin/InvestorVideoManager';
import { InvestorEngagementPanel } from '@/components/admin/InvestorEngagementPanel';
import { DeckEngagementPanel } from '@/components/admin/DeckEngagementPanel';
import { AwardsManager } from '@/components/admin/AwardsManager';
import { EmailMarketingPanel } from '@/components/admin/EmailMarketingPanel';
import { TasksPanel } from '@/components/admin/TasksPanel';
import { FinancialsPanel } from '@/components/admin/FinancialsPanel';
import { HelpDeskPanel } from '@/components/admin/HelpDeskPanel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ThemeSelector } from '@/components/theme/ThemeToggle';
import {
  ClipboardList,
  LogOut,
  Shield,
  Home,
  Users,
  Mic,
  Handshake,
  Rss,
  Mail,
  Layers,
  ShieldCheck,
  BarChart3,
  KeyRound,
  Video,
  Activity,
  FileText,
  Trophy,
  ChevronDown,
  Megaphone,
  LifeBuoy,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/vpa-logo.png';

const MORE_TAB_VALUES = new Set([
  'investor-access',
  'investor-videos',
  'investor-engagement',
  'deck-engagement',
]);

const AdminPage = () => {
  const { user, loading, isAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const { setTheme } = useTheme();

  useEffect(() => {
    const prev = (localStorage.getItem("vpa-theme") || "dark") as "light" | "dark" | "system";
    setTheme("light");
    return () => { setTheme(prev); };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { from: '/admin' } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6">
            You don't have admin privileges. Contact an administrator for access.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src={logo} alt="VPA Logo" className="w-10 h-10" />
            </Link>
            <div>
              <h1 className="font-serif text-lg font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-500">Veteran Podcast Awards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector showLabels={false} />
            <span className="text-sm text-slate-500 hidden md:block">{user.email}</span>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                My Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-wrap items-stretch gap-1">
            <TabsList className="flex flex-wrap gap-1 h-auto p-1 flex-1 min-w-0 justify-start">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="podcasts" className="gap-2">
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Podcasts</span>
              </TabsTrigger>
              <TabsTrigger value="awards" className="gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Awards</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
              </TabsTrigger>
              <TabsTrigger value="sponsors" className="gap-2">
                <Handshake className="w-4 h-4" />
                <span className="hidden sm:inline">Sponsors</span>
              </TabsTrigger>
              <TabsTrigger value="email-marketing" className="gap-2">
                <Megaphone className="w-4 h-4" />
                <span className="hidden lg:inline">Email Marketing</span>
                <span className="hidden sm:inline lg:hidden">Email</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Metrics</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contacts</span>
              </TabsTrigger>
              <TabsTrigger value="financials" className="gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Financials</span>
              </TabsTrigger>
              <TabsTrigger value="help-desk" className="gap-2">
                <LifeBuoy className="w-4 h-4" />
                <span className="hidden sm:inline">Help</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="tech-stack" className="gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Tech</span>
              </TabsTrigger>
            </TabsList>
            {isSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                      MORE_TAB_VALUES.has(activeTab)
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900',
                    )}
                  >
                    <span className="hidden sm:inline">More</span>
                    <span className="sm:hidden">⋯</span>
                    <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setActiveTab('investor-access')}>
                    <KeyRound className="w-4 h-4" />
                    Investors
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setActiveTab('investor-videos')}>
                    <Video className="w-4 h-4" />
                    Videos
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setActiveTab('investor-engagement')}>
                    <Activity className="w-4 h-4" />
                    Investor Engagement
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setActiveTab('deck-engagement')}>
                    <FileText className="w-4 h-4" />
                    Deck Engagement
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactManager />
          </TabsContent>

          <TabsContent value="podcasts">
            <PodcastManager />
          </TabsContent>

          <TabsContent value="awards">
            <AwardsManager />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksPanel />
          </TabsContent>

          <TabsContent value="financials">
            <FinancialsPanel />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorTiersManager />
            <SponsorList />
          </TabsContent>

          <TabsContent value="email-marketing">
            <EmailMarketingPanel />
          </TabsContent>

          <TabsContent value="metrics">
            <BusinessMetricsPanel />
          </TabsContent>

          <TabsContent value="tech-stack">
            <TechStackPanel />
          </TabsContent>

          <TabsContent value="help-desk">
            <HelpDeskPanel />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPanel />
          </TabsContent>

          {isSuperAdmin && (
            <>
              <TabsContent value="investor-access" className="space-y-6">
                <ShareLinkManager />
                <InvestorAccessManager />
              </TabsContent>

              <TabsContent value="investor-videos">
                <InvestorVideoManager />
              </TabsContent>

              <TabsContent value="investor-engagement">
                <InvestorEngagementPanel />
              </TabsContent>

              <TabsContent value="deck-engagement">
                <DeckEngagementPanel />
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
