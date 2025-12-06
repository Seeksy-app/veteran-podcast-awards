import { useAuth } from '@/hooks/useAuth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { SponsorList } from '@/components/admin/SponsorList';
import { PodcastManager } from '@/components/admin/PodcastManager';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import logo from '@/assets/vpa-logo.png';

const AdminPage = () => {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
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
          <Button variant="outline" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="VPA Logo" className="w-10 h-10" />
            <div>
              <h1 className="font-serif text-lg font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Veteran Podcast Awards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SponsorList />
        <PodcastManager />
      </main>
    </div>
  );
};

export default AdminPage;
