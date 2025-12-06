import { useSponsors } from '@/hooks/useSponsors';
import type { Database } from '@/integrations/supabase/types';

type Sponsor = Database['public']['Tables']['sponsors']['Row'];
type SponsorTier = Database['public']['Enums']['sponsor_tier'];

const tierConfig: Record<SponsorTier, { label: string; logoClass: string; containerClass: string; labelClass: string }> = {
  platinum: {
    label: 'Platinum Sponsors',
    logoClass: 'w-48 h-24',
    containerClass: 'gap-8',
    labelClass: 'text-primary',
  },
  gold: {
    label: 'Gold Sponsors',
    logoClass: 'w-40 h-20',
    containerClass: 'gap-6',
    labelClass: 'text-primary/80',
  },
  silver: {
    label: 'Silver Sponsors',
    logoClass: 'w-32 h-16',
    containerClass: 'gap-4',
    labelClass: 'text-muted-foreground',
  },
  bronze: {
    label: 'Bronze Sponsors',
    logoClass: 'w-28 h-14',
    containerClass: 'gap-4',
    labelClass: 'text-muted-foreground/80',
  },
};

const PlaceholderSponsors = ({ tier }: { tier: SponsorTier }) => {
  const config = tierConfig[tier];
  const count = tier === 'platinum' ? 2 : tier === 'gold' ? 3 : 4;
  
  return (
    <div className={`flex flex-wrap justify-center ${config.containerClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${config.logoClass} bg-card border border-dashed border-border rounded-lg flex items-center justify-center`}
        >
          <span className="text-muted-foreground text-xs">Your Logo Here</span>
        </div>
      ))}
    </div>
  );
};

const SponsorTierSection = ({ tier, sponsors }: { tier: SponsorTier; sponsors: Sponsor[] }) => {
  const config = tierConfig[tier];
  const tierSponsors = sponsors.filter((s) => s.tier === tier);
  
  if (tierSponsors.length === 0) {
    return (
      <div>
        <h3 className={`text-center text-sm font-semibold ${config.labelClass} uppercase tracking-wider mb-6`}>
          {config.label}
        </h3>
        <PlaceholderSponsors tier={tier} />
      </div>
    );
  }
  
  return (
    <div>
      <h3 className={`text-center text-sm font-semibold ${config.labelClass} uppercase tracking-wider mb-6`}>
        {config.label}
      </h3>
      <div className={`flex flex-wrap justify-center ${config.containerClass}`}>
        {tierSponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.website_url || '#'}
            target={sponsor.website_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`${config.logoClass} bg-card border border-border rounded-lg flex items-center justify-center p-2 hover:border-primary transition-colors`}
          >
            <img
              src={sponsor.logo_url}
              alt={sponsor.name}
              className="max-w-full max-h-full object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export const SponsorDisplay = () => {
  const { data: sponsors, isLoading } = useSponsors();

  if (isLoading) {
    return (
      <div className="space-y-12">
        {(['platinum', 'gold', 'silver'] as SponsorTier[]).map((tier) => (
          <PlaceholderSponsors key={tier} tier={tier} />
        ))}
      </div>
    );
  }

  const tiers: SponsorTier[] = ['platinum', 'gold', 'silver', 'bronze'];
  
  return (
    <div className="space-y-12">
      {tiers.map((tier) => (
        <SponsorTierSection key={tier} tier={tier} sponsors={sponsors || []} />
      ))}
    </div>
  );
};
