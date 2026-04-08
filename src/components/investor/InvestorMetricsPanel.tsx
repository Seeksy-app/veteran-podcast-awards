import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Vote, Inbox, RefreshCw } from 'lucide-react';

const card =
  'border border-[#F59E0B]/25 bg-[#0F2035] text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

export type PlatformMetrics = {
  active_podcasts: number;
  total_votes: number;
  podcast_submissions: number;
};

async function fetchMetricsViaRpc(): Promise<PlatformMetrics | null> {
  const { data, error } = await supabase.rpc('investor_platform_metrics');
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return null;
  const m = row as Record<string, unknown>;
  const a = Number(m.active_podcasts);
  const v = Number(m.total_votes);
  const s = Number(m.podcast_submissions);
  if (!Number.isFinite(a) || !Number.isFinite(v) || !Number.isFinite(s)) return null;
  return { active_podcasts: a, total_votes: v, podcast_submissions: s };
}

/** Direct counts when RPC is missing or fails (subject to RLS). */
async function fetchMetricsDirect(): Promise<PlatformMetrics> {
  const countOrZero = async (
    promise: Promise<{ count: number | null; error: { message: string } | null }>,
  ) => {
    try {
      const { count, error } = await promise;
      if (error) {
        console.warn('investor metrics direct count:', error.message);
        return 0;
      }
      return count ?? 0;
    } catch (e) {
      console.warn('investor metrics direct count failed:', e);
      return 0;
    }
  };

  const active_podcasts = await countOrZero(
    supabase.from('podcasts').select('*', { count: 'exact', head: true }).eq('is_active', true),
  );
  const total_votes = await countOrZero(
    supabase.from('votes').select('*', { count: 'exact', head: true }),
  );
  const podcast_submissions = await countOrZero(
    supabase.from('podcast_submissions').select('*', { count: 'exact', head: true }),
  );

  return { active_podcasts, total_votes, podcast_submissions };
}

async function fetchPlatformMetrics(): Promise<{ metrics: PlatformMetrics; usedFallback: boolean }> {
  try {
    const fromRpc = await fetchMetricsViaRpc();
    if (fromRpc) {
      return { metrics: fromRpc, usedFallback: false };
    }
    const metrics = await fetchMetricsDirect();
    return { metrics, usedFallback: true };
  } catch (e) {
    console.warn('fetchPlatformMetrics:', e);
    const metrics = await fetchMetricsDirect();
    return { metrics, usedFallback: true };
  }
}

/**
 * Live platform counts via investor_platform_metrics() RPC, with direct COUNT fallbacks.
 */
export function InvestorMetricsPanel() {
  const query = useQuery({
    queryKey: ['investor-platform-metrics'],
    queryFn: fetchPlatformMetrics,
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
        <p className="text-[#94A3B8]">
          We couldn&apos;t load metrics right now. Please try again.
        </p>
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

  const { metrics: m, usedFallback } = query.data!;

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
        {usedFallback && (
          <p className="mt-2 text-xs text-[#94A3B8]/90">
            Showing live counts from the database (aggregated RPC unavailable). If numbers look off, your
            account may have limited read access under row-level security.
          </p>
        )}
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
