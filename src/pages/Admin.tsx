import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SponsorList } from '@/components/admin/SponsorList';
import { PodcastManager } from '@/components/admin/PodcastManager';
import { UserManager } from '@/components/admin/UserManager';
import { SubmissionManager } from '@/components/admin/SubmissionManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { TechStackPanel } from '@/components/admin/TechStackPanel';
import { SecurityPanel } from '@/components/admin/SecurityPanel';
import { BusinessMetricsPanel } from '@/components/admin/BusinessMetricsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSelector } from '@/components/theme/ThemeToggle';
import { LogOut, Shield, Home, Users, Mic, Handshake, Rss, Mail, Layers, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/vpa-logo.png';

const AdminPage = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { from: '/admin' } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src={logo} alt="VPA Logo" className="w-10 h-10" />
            </Link>
            <div>
              <h1 className="font-serif text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Veteran Podcast Awards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector showLabels={false} />
            <span className="text-sm text-muted-foreground hidden md:block">{user.email}</span>
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
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid md:grid-cols-8">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Podcasts</span>
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Rss className="w-4 h-4" />
              <span className="hidden sm:inline">Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="gap-2">
              <Handshake className="w-4 h-4" />
              <span className="hidden sm:inline">Sponsors</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="tech-stack" className="gap-2">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Tech Stack</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactManager />
          </TabsContent>

          <TabsContent value="podcasts">
            <PodcastManager />
          </TabsContent>

          <TabsContent value="submissions">
            <SubmissionManager />
          </TabsContent>

          <TabsContent value="sponsors">
            <SponsorList />
          </TabsContent>

          <TabsContent value="metrics">
            <BusinessMetricsPanel />
          </TabsContent>

          <TabsContent value="tech-stack">
            <TechStackPanel />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
