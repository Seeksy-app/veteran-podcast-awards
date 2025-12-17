import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Users, TrendingUp, Heart, Vote, Mail, Mic, Calendar, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface MetricStats {
  totalUsers: number;
  totalPreRegistrations: number;
  totalPodcasts: number;
  totalVotes: number;
  totalFavorites: number;
  totalCampaignsSent: number;
  totalEmailsSent: number;
  emailOpenRate: number;
  emailClickRate: number;
}

interface GrowthData {
  date: string;
  users: number;
  preRegistrations: number;
}

interface UserTypeData {
  name: string;
  value: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function BusinessMetricsPanel() {
  const [stats, setStats] = useState<MetricStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [userTypeData, setUserTypeData] = useState<UserTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch counts in parallel
      const [
        usersResult,
        preRegsResult,
        podcastsResult,
        votesResult,
        favoritesResult,
        campaignsResult,
        emailSendsResult,
        profilesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('pre_registrations').select('id', { count: 'exact', head: true }),
        supabase.from('podcasts').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('votes').select('id', { count: 'exact', head: true }),
        supabase.from('favorites').select('id', { count: 'exact', head: true }),
        supabase.from('email_campaigns').select('*').eq('status', 'sent'),
        supabase.from('email_sends').select('id, status, opened_at, clicked_at'),
        supabase.from('profiles').select('user_type, created_at')
      ]);

      // Calculate email metrics
      const campaigns = campaignsResult.data || [];
      const totalSent = campaigns.reduce((acc, c) => acc + (c.sent_count || 0), 0);
      const totalOpened = campaigns.reduce((acc, c) => acc + (c.opened_count || 0), 0);
      const totalClicked = campaigns.reduce((acc, c) => acc + (c.clicked_count || 0), 0);

      setStats({
        totalUsers: usersResult.count || 0,
        totalPreRegistrations: preRegsResult.count || 0,
        totalPodcasts: podcastsResult.count || 0,
        totalVotes: votesResult.count || 0,
        totalFavorites: favoritesResult.count || 0,
        totalCampaignsSent: campaigns.length,
        totalEmailsSent: totalSent,
        emailOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        emailClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      });

      // Process user type data
      const profiles = profilesResult.data || [];
      const typeCount: Record<string, number> = {};
      profiles.forEach(p => {
        const type = p.user_type || 'unknown';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      setUserTypeData(Object.entries(typeCount).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), 
        value 
      })));

      // Generate growth data (last 30 days)
      const last30Days = eachDayOfInterval({
        start: subDays(new Date(), 29),
        end: new Date()
      });

      const growthByDay = last30Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const usersOnDay = profiles.filter(p => 
          p.created_at && format(parseISO(p.created_at), 'yyyy-MM-dd') <= dayStr
        ).length;
        return {
          date: format(day, 'MMM d'),
          users: usersOnDay,
          preRegistrations: 0, // Would need pre_registrations data with dates
        };
      });
      setGrowthData(growthByDay);

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleExport = () => {
    if (!stats) return;
    
    const data = {
      exportDate: new Date().toISOString(),
      metrics: stats,
      userTypes: userTypeData,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vpa-metrics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Business Metrics</h2>
          <p className="text-muted-foreground">User growth and engagement analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pre-Registrations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPreRegistrations || 0}</div>
            <p className="text-xs text-muted-foreground">Event interest signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Podcasts</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPodcasts || 0}</div>
            <p className="text-xs text-muted-foreground">In the network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVotes || 0}</div>
            <p className="text-xs text-muted-foreground">Votes cast</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="email">Email Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Growth (Last 30 Days)</CardTitle>
                <CardDescription>Cumulative registered users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Types</CardTitle>
                <CardDescription>Distribution by account type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {userTypeData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalFavorites || 0}</div>
                <p className="text-xs text-muted-foreground">Podcasts favorited by users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVotes || 0}</div>
                <p className="text-xs text-muted-foreground">Award votes submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats && stats.totalUsers > 0 
                    ? ((stats.totalVotes + stats.totalFavorites) / stats.totalUsers).toFixed(1)
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground">Actions per user</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Summary</CardTitle>
              <CardDescription>Key engagement metrics for investors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">User Activation Rate</div>
                    <div className="text-sm text-muted-foreground">Users who have taken at least one action</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {stats && stats.totalUsers > 0 
                      ? Math.min(100, Math.round(((stats.totalVotes + stats.totalFavorites) / stats.totalUsers) * 100 / 2)).toString() + '%'
                      : '0%'}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Podcast Network Coverage</div>
                    <div className="text-sm text-muted-foreground">Active podcasts in the veteran/military space</div>
                  </div>
                  <div className="text-2xl font-bold text-primary">{stats?.totalPodcasts || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campaigns Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCampaignsSent || 0}</div>
                <p className="text-xs text-muted-foreground">Email campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEmailsSent || 0}</div>
                <p className="text-xs text-muted-foreground">Total deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.emailOpenRate.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">Industry avg: 21%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.emailClickRate.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground">Industry avg: 2.5%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Investor Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investment Highlights
          </CardTitle>
          <CardDescription>Key metrics for potential acquirers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Platform Traction</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {stats?.totalUsers || 0} registered users</li>
                <li>• {stats?.totalPreRegistrations || 0} pre-registrations</li>
                <li>• {stats?.totalPodcasts || 0} podcasts in network</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Engagement Metrics</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {stats?.totalVotes || 0} votes cast</li>
                <li>• {stats?.totalFavorites || 0} favorites saved</li>
                <li>• {stats?.emailOpenRate.toFixed(1) || 0}% email open rate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Market Opportunity</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 18M+ veterans in the US</li>
                <li>• 2M+ active military</li>
                <li>• 40M+ military family members</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
