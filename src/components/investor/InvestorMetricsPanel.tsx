import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Vote, Inbox, RefreshCw } from 'lucide-react';

const gold = 'text-[hsl(43_72%_52%)]';
const muted = 'text-[hsl(45_15%_72%)]';
const card =
  'border-[hsl(43_72%_45%/0.35)] bg-[hsl(222_35%_16%)] text-[hsl(45_20%_96%)]';

/**
 * Live platform counts via investor_platform_metrics() (podcasts, votes, podcast_submissions).
 */
export function InvestorMetricsPanel() {
  const query = useQuery({
    queryKey: ['investor-platform-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('investor_platform_metrics');
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error('No metrics returned');
      return row as {
        active_podcasts: number;
        total_votes: number;
        podcast_submissions: number;
      };
    },
    refetchInterval: 60_000,
  });

  if (query.isPending) {
    return (
      <div className={`rounded-lg border border-[hsl(43_72%_45%/0.2)] p-8 text-center ${muted}`}>
        Loading platform metrics…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className={`rounded-lg border border-[hsl(43_72%_45%/0.2)] p-6 ${card}`}>
        <p className={muted}>Could not load metrics. The database may need the latest migration applied.</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 border-[hsl(43_72%_45%/0.4)] text-[hsl(43_72%_52%)]"
          onClick={() => query.refetch()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const m = query.data!;

  const items = [
    {
      label: 'Active podcasts',
      value: m.active_podcasts,
      hint: 'Listed nominees / catalog',
      icon: Mic,
    },
    {
      label: 'Votes cast',
      value: m.total_votes,
      hint: 'Total rows in votes',
      icon: Vote,
    },
    {
      label: 'Podcast submissions',
      value: m.podcast_submissions,
      hint: 'Inbound submission requests',
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`font-serif text-xl font-semibold ${gold}`}>Platform metrics</h2>
        <p className={`text-sm ${muted}`}>Live counts (refreshes every minute)</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} className={card}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${gold}`} />
                <CardTitle className={`text-base ${gold}`}>{label}</CardTitle>
              </div>
              <CardDescription className={muted}>{hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums text-[hsl(45_20%_96%)]">{value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
