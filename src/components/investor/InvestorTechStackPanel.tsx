import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Globe, Layers, Sparkles } from 'lucide-react';

const cardClass =
  'border border-[#F59E0B]/25 bg-[#0F2035] text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

const STACK_ITEMS: { title: string; description: string; icon: typeof Database }[] = [
  {
    title: 'Supabase',
    description: 'PostgreSQL database, auth, storage, and realtime APIs.',
    icon: Database,
  },
  {
    title: 'React + Vite',
    description: 'Frontend application and build tooling.',
    icon: Layers,
  },
  {
    title: 'Vercel',
    description: 'Production hosting and edge delivery.',
    icon: Globe,
  },
  {
    title: 'Anthropic Claude',
    description: 'AI-assisted features and content workflows.',
    icon: Sparkles,
  },
];

function InvestorTechStackContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold text-[#F59E0B]">Technology stack</h2>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Core platforms powering the Veteran Podcast Awards investor experience.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {STACK_ITEMS.map(({ title, description, icon: Icon }) => (
          <Card key={title} className={cardClass}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F59E0B]/30 bg-[#0A1628]">
                  <Icon className="h-5 w-5 text-[#F59E0B]" aria-hidden />
                </div>
                <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
              </div>
              <CardDescription className="pt-1 text-[#94A3B8]">{description}</CardDescription>
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
        <div className="space-y-4 rounded-xl border border-[#F59E0B]/20 bg-[#0F2035] p-6 text-[#94A3B8]">
          <p className="text-sm text-white/90">Something went wrong loading this section.</p>
          <p className="text-sm">Technology stack:</p>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Supabase — database</li>
            <li>React + Vite — frontend</li>
            <li>Vercel — hosting</li>
            <li>Anthropic Claude — AI features</li>
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
