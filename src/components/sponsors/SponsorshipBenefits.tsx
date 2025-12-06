import { Trophy, Users, Radio, Mic, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const sponsorshipTiers = [
  {
    name: "Livestream Title Sponsor",
    description: "Premier visibility throughout the entire live broadcast",
    icon: Radio,
  },
  {
    name: "Event Title Sponsor",
    description: "Your brand featured as the presenting sponsor of the awards",
    icon: Trophy,
  },
  {
    name: "Individual Award Sponsor",
    description: "Sponsor a specific award category and present to winners",
    icon: Star,
  },
  {
    name: "Community Partner",
    description: "Support the veteran podcasting community with your brand",
    icon: Users,
  },
];

const communityStats = [
  { stat: "18M+", label: "Veterans in the U.S." },
  { stat: "2M+", label: "Active Duty Service Members" },
  { stat: "40M+", label: "Military-Connected Americans" },
  { stat: "500K+", label: "Combined Social Media Reach" },
];

export const SponsorshipBenefits = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Sponsorship Opportunities</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Partner With </span>
            <span className="text-gold-gradient">The Veteran Community</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Connect your brand with the dedicated military and veteran podcasting community 
            and reach millions of engaged listeners who trust these voices.
          </p>
        </div>

        {/* Community Reach Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {communityStats.map((item, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
            >
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold mb-2">
                {item.stat}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Why Sponsor */}
        <div className="bg-card border border-border rounded-xl p-8 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="w-6 h-6 text-primary" />
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Why Sponsor the Veteran Podcast Awards?
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
            <div className="space-y-4">
              <p>
                <strong className="text-foreground">Authentic Audience Connection:</strong> Veteran 
                podcasters have built deeply loyal audiences who trust their recommendations. 
                Your brand gains credibility through association with these respected voices.
              </p>
              <p>
                <strong className="text-foreground">Massive Combined Reach:</strong> Our nominees 
                collectively reach hundreds of thousands of listeners across platforms. When they 
                share the awards, your brand goes with them.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <strong className="text-foreground">Military-Connected Market:</strong> The military 
                and veteran community represents over 40 million Americans with strong purchasing 
                power and brand loyalty. They support brands that support them.
              </p>
              <p>
                <strong className="text-foreground">Multi-Platform Exposure:</strong> From the live 
                ceremony broadcast to social media promotions, podcast mentions, and event materials—your 
                brand receives visibility across all channels.
              </p>
            </div>
          </div>
        </div>

        {/* Sponsorship Tiers */}
        <div className="mb-16">
          <h3 className="font-serif text-2xl font-bold text-foreground text-center mb-8">
            Sponsorship Opportunities
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipTiers.map((tier, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <tier.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{tier.name}</h4>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-xl p-8">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-4">
              Ready to Reach the Veteran Community?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Contact us today to discuss sponsorship packages and how we can create 
              a customized partnership that meets your marketing goals.
            </p>
            <Button variant="gold" size="lg" asChild>
              <a href="mailto:sponsors@veteranpodcastawards.com">
                Contact Us About Sponsorship
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
