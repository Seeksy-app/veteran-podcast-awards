import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Vote, Inbox, RefreshCw } from 'lucide-react';

const card =
  'border border-[#F59E0B]/25 bg-[#0F2035] text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

/**
 * Live platform counts via investor_platform_metrics() RPC.
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
    refetchInterval: 30_000,
  });

  if (query.isPending) {
    return (
      <div className="rounded-xl border border-[#F59E0B]/20 bg-[#0F2035] p-8 text-center text-[#94A3B8]">
        Loading platform metrics…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className={`rounded-xl border border-[#F59E0B]/20 p-6 ${card}`}>
        <p className="text-[#94A3B8]">Could not load metrics. The database may need the latest migration applied.</p>
        <Button
          type="button"
          className="mt-4 bg-[#F59E0B] font-semibold text-[#0A1628] transition-colors hover:bg-[#FBBF24]"
          onClick={() => query.refetch()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const m = query.data!;

  const items = [
    {
      label: 'Active Podcasts',
      value: m.active_podcasts,
      hint: 'Listed in catalog',
      icon: Mic,
    },
    {
      label: 'Total Votes',
      value: m.total_votes,
      hint: 'All cast votes',
      icon: Vote,
    },
    {
      label: 'Total Submissions',
      value: m.podcast_submissions,
      hint: 'Inbound podcast requests',
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold text-[#F59E0B]">Platform metrics</h2>
        <p className="mt-1 text-sm text-[#94A3B8]">Live data updated in real time</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} className={card}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[#F59E0B]" />
                <CardTitle className="text-base font-semibold text-white">{label}</CardTitle>
              </div>
              <CardDescription className="text-[#94A3B8]">{hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tabular-nums tracking-tight text-[#F59E0B]">
                {value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
