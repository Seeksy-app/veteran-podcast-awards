import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Mic, 
  Trophy, 
  Tv, 
  Mail, 
  Share2,
  Code,
  Clock,
  Rocket,
  Target,
  Building,
  Star,
  Zap,
  BarChart3,
  Globe,
  CheckCircle2
} from "lucide-react";

export const OpportunityContent = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-br from-primary/10 via-background to-gold/10 rounded-xl border">
        <div className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 text-gold border-gold">
              Exclusive Investment Opportunity
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Veteran Podcast Awards
            </h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              A flagship recognition platform in the military/veteran media space with proven technology and established brand equity.
            </p>
            <p className="text-lg text-gold font-semibold mb-8">
              Significant growth potential.
            </p>
            
            {/* Available Audience */}
            <div className="mb-4">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">
                Available Audience to Target
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-gold mb-2">18M+</div>
                  <div className="text-xs text-muted-foreground">Veterans in the U.S.</div>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-gold mb-2">2M+</div>
                  <div className="text-xs text-muted-foreground">Active Duty Service Members</div>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-gold mb-2">40M+</div>
                  <div className="text-xs text-muted-foreground">Military-Connected Americans</div>
                </div>
                <div className="bg-card border rounded-xl p-4">
                  <div className="text-2xl md:text-3xl font-bold text-gold mb-2">500K+</div>
                  <div className="text-xs text-muted-foreground">Combined Social Media Reach</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                These figures represent the addressable market—an untapped audience that, when targeted, could significantly elevate the value of this property.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example 2026 Sponsorship Opportunities */}
      <section className="py-8 bg-muted/20 rounded-xl border px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gold/20 rounded-full">
              <DollarSign className="w-6 h-6 text-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold">Example 2026 Sponsorship Opportunities</h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Multiple revenue streams through tiered sponsorship packages designed for brands seeking authentic connection with the military community.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-card border-2 border-gold rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-gold mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Presenting</h3>
              <p className="text-xs text-muted-foreground">Title naming rights</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Category</h3>
              <p className="text-xs text-muted-foreground">Award category sponsor</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Award</h3>
              <p className="text-xs text-muted-foreground">Individual award sponsor</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <Tv className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Livestream</h3>
              <p className="text-xs text-muted-foreground">Broadcast integration</p>
            </div>
            <div className="bg-card border rounded-xl p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">& More</h3>
              <p className="text-xs text-muted-foreground">Custom packages</p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 italic">
            Sponsorship tiers range from $10K engagement packages to $100K+ presenting partnerships
          </p>
        </div>
      </section>

      {/* Technology & Build Value */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Code className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="font-display text-2xl font-bold">Technology & SaaS Value</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Development Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500 mb-2">240 Hours</div>
                <p className="text-sm text-muted-foreground">Development time invested in platform</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Replacement Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500 mb-2">~$75,000</div>
                <p className="text-sm text-muted-foreground">Not including hosting, integrations, future upgrades</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-gold" />
                Build vs. Buy Advantages
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Avoid Sunk Costs</div>
                    <div className="text-xs text-muted-foreground">Skip $75K+ in development</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Accelerate Time-to-Market</div>
                    <div className="text-xs text-muted-foreground">Proven, operational system</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Ecosystem Connected</div>
                    <div className="text-xs text-muted-foreground">Parade Deck integration ready</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card className="mt-6 border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">What's Included in the Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Complete intellectual property (IP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Front-end & back-end technology stack</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Veteran Podcast Awards name & branding</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">All URLs and domains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">National Military Podcast Day ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">Existing user database & contacts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Stack Event Platform */}
          <Card className="mt-6 border-2 border-gold/50 bg-gradient-to-br from-gold/5 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="w-5 h-5 text-gold" />
                Full Stack Event Platform Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                A complete, custom-built event management platform providing a strong alternative to Eventbrite and other paid SaaS platforms.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Users className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Registration & Ticketing</div>
                    <div className="text-xs text-muted-foreground">Built-in user registration and event signups</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Tv className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Livestream Integration</div>
                    <div className="text-xs text-muted-foreground">Seamless streaming to web, mobile, Apple TV</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Email Marketing</div>
                    <div className="text-xs text-muted-foreground">Built-in campaign tools with tracking</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Trophy className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Voting System</div>
                    <div className="text-xs text-muted-foreground">Complete nomination and voting workflow</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <BarChart3 className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Analytics Dashboard</div>
                    <div className="text-xs text-muted-foreground">Real-time insights and reporting</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <DollarSign className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">No Platform Fees</div>
                    <div className="text-xs text-muted-foreground">Unlike Eventbrite, keep 100% of revenue</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Growth Projections */}
      <section className="py-8 bg-gradient-to-br from-gold/5 via-background to-primary/5 rounded-xl border px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gold/20 rounded-full">
              <BarChart3 className="w-6 h-6 text-gold" />
            </div>
            <h2 className="font-display text-2xl font-bold">Growth Projections</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 2026 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">Year 1</Badge>
                <CardTitle className="text-xl">2026</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <div className="text-xl font-bold text-blue-500">$400K–$500K</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Impressions</div>
                  <div className="text-xl font-bold">5M+</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Bespoke Events</div>
                  <div className="text-xl font-bold">1–2 pilots</div>
                </div>
              </CardContent>
            </Card>

            {/* 2027 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
              <CardHeader>
                <Badge variant="outline" className="w-fit mb-2">Year 2</Badge>
                <CardTitle className="text-xl">2027</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <div className="text-xl font-bold text-purple-500">$750K–$1M</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Impressions</div>
                  <div className="text-xl font-bold">8M+</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Award Verticals</div>
                  <div className="text-xl font-bold">3–4 shows</div>
                </div>
              </CardContent>
            </Card>

            {/* 2028 */}
            <Card className="relative overflow-hidden border-2 border-gold">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
              <CardHeader>
                <Badge className="w-fit mb-2 bg-gold/20 text-gold border-gold">Year 3</Badge>
                <CardTitle className="text-xl">2028</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <div className="text-xl font-bold text-gold">$1.5M+</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Impressions</div>
                  <div className="text-xl font-bold">12M+</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-lg font-bold">Marquee Annual Event</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI & Strategic Value */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold">Strategic Value & ROI</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Star className="w-5 h-5 text-gold" />
                  Exclusive Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Flagship property in the veteran/military media space with established brand recognition and community trust.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  Cross-Platform Amplification
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Integration potential across Task & Purpose, MIC, Military Spouse Fest and other Recurrent properties.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-5 h-5 text-purple-500" />
                  Scalable Format
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Bespoke award shows can be templated and launched in new verticals—first responders, healthcare, education, and more.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Multiple Revenue Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sponsorship, branded content, livestream advertising, licensing, and winner award purchases.
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-gradient-to-r from-primary/10 to-gold/10 border-2">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-full shrink-0">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Community Convener Role</h3>
                  <p className="text-sm text-muted-foreground">
                    VPA positions the acquirer as a central hub and community convener in the military/veteran space—
                    expanding influence beyond traditional media into recognition-driven engagement and creator economy participation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 bg-muted/30 rounded-xl text-center">
        <p className="text-sm text-muted-foreground">
          This document is confidential and intended for prospective investors only.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          © {new Date().getFullYear()} Veteran Podcast Awards. All rights reserved.
        </p>
      </section>
    </div>
  );
};
