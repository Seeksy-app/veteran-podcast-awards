import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code2,
  Database,
  Github,
  Globe,
  type LucideIcon,
  Shield,
  Sparkles,
} from 'lucide-react';

const cardClass =
  'border border-[#F59E0B]/25 bg-[#0F2035] text-[#FFFFFF] shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

const descClass = 'text-sm leading-snug text-[#CBD5E1]';

type StackCard = {
  category: string;
  techName: string;
  line1: string;
  line2: string;
  icon: LucideIcon;
};

const STACK_CARDS: StackCard[] = [
  {
    category: 'FRONTEND',
    techName: 'React 18 + TypeScript + Vite',
    line1: 'Modern component-based UI with full type safety,',
    line2: 'fast hot-reload builds, and responsive design.',
    icon: Code2,
  },
  {
    category: 'DATABASE',
    techName: 'Supabase (PostgreSQL)',
    line1: 'Enterprise-grade relational database with Row Level',
    line2: 'Security, real-time subscriptions, edge functions, and built-in authentication.',
    icon: Database,
  },
  {
    category: 'HOSTING',
    techName: 'Vercel (Edge Network)',
    line1: 'Global CDN with automatic deployments, 99.99% uptime',
    line2: 'SLA, serverless functions, and instant rollbacks.',
    icon: Globe,
  },
  {
    category: 'AI',
    techName: 'Anthropic Claude',
    line1: 'Powers intelligent content workflows, automated matching,',
    line2: 'and platform intelligence features.',
    icon: Sparkles,
  },
  {
    category: 'SECURITY',
    techName: 'JWT + RLS',
    line1: 'Industry-standard authentication with row-level',
    line2: 'database security ensuring users only access their own data.',
    icon: Shield,
  },
  {
    category: 'INFRASTRUCTURE',
    techName: 'GitHub + CI/CD',
    line1: 'Full version control with automated testing and',
    line2: 'deployment pipeline. All code owned outright.',
    icon: Github,
  },
];

function InvestorTechStackContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold text-[#F59E0B]">Technology stack</h2>
        <p className="mt-1 text-sm text-[#CBD5E1]">
          Production-grade systems behind the Veteran Podcast Awards platform.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STACK_CARDS.map(({ category, techName, line1, line2, icon: Icon }) => (
          <Card key={category} className={cardClass}>
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B]/35 bg-[#0A1628]">
                  <Icon className="h-5 w-5 text-[#F59E0B]" aria-hidden />
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-emerald-500/50 bg-emerald-500/15 text-xs font-semibold uppercase tracking-wide text-emerald-400"
                >
                  Active
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#FFFFFF]">{category}</p>
                <p className="font-semibold text-[#F59E0B]">{techName}</p>
              </div>
              <p className={descClass}>
                {line1}
                <br />
                {line2}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

type ErrorBoundaryState = { hasError: boolean };

/** Catches render errors so the investor portal never shows a blank white tab. */
export class InvestorTechStackErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('InvestorTechStackPanel error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-4 rounded-xl border border-[#F59E0B]/20 bg-[#0F2035] p-6 text-[#CBD5E1]">
          <p className="text-sm text-[#FFFFFF]">Something went wrong loading this section.</p>
          <p className="text-sm">Technology stack:</p>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>React 18 + TypeScript + Vite — frontend</li>
            <li>Supabase (PostgreSQL) — database</li>
            <li>Vercel — hosting</li>
            <li>Anthropic Claude — AI</li>
            <li>JWT + RLS — security</li>
            <li>GitHub + CI/CD — infrastructure</li>
          </ul>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Static tech summary for the investor portal — no database calls.
 * Wrapped in an error boundary so a component fault cannot blank the tab.
 */
export function InvestorTechStackPanel() {
  return (
    <InvestorTechStackErrorBoundary>
      <InvestorTechStackContent />
    </InvestorTechStackErrorBoundary>
  );
}
