import { SEO } from "@/components/SEO";
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

const Opportunity = () => {
  return (
    <>
      <SEO
        title="Investment Opportunity | Veteran Podcast Awards"
        description="Exclusive acquisition opportunity for the Veteran Podcast Awards platform"
        noIndex={true}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-gold/10 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 text-gold border-gold">
                Exclusive Investment Opportunity
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Veteran Podcast Awards
              </h1>
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                A flagship recognition platform in the military/veteran media space with proven technology and established brand equity.
              </p>
              <p className="text-xl text-gold font-semibold mb-12">
                Significant growth potential.
              </p>
              
              {/* Available Audience */}
              <div className="mb-8">
                <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">
                  Available Audience to Target
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
                  <div className="bg-card border rounded-xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-gold mb-2">18M+</div>
                    <div className="text-sm text-muted-foreground">Veterans in the U.S.</div>
                  </div>
                  <div className="bg-card border rounded-xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-gold mb-2">2M+</div>
                    <div className="text-sm text-muted-foreground">Active Duty Service Members</div>
                  </div>
                  <div className="bg-card border rounded-xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-gold mb-2">40M+</div>
                    <div className="text-sm text-muted-foreground">Military-Connected Americans</div>
                  </div>
                  <div className="bg-card border rounded-xl p-6">
                    <div className="text-3xl md:text-4xl font-bold text-gold mb-2">500K+</div>
                    <div className="text-sm text-muted-foreground">Combined Social Media Reach</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  These figures represent the addressable market—an untapped audience that, when targeted, could significantly elevate the value of this property.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship Opportunities for Military & Veteran Brands */}
        <section className="py-16 bg-muted/20 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gold/20 rounded-full">
                  <DollarSign className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-3xl font-bold">2025 Sponsorship Opportunities</h2>
              </div>
              <p className="text-muted-foreground mb-8 max-w-2xl">
                Premium sponsorship packages designed for brands looking to authentically connect with the military and veteran community.
              </p>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Presenting Partner */}
                <Card className="relative overflow-hidden border-2 border-gold">
                  <div className="absolute top-0 right-0 bg-gold text-gold-foreground px-3 py-1 text-sm font-semibold">
                    FLAGSHIP
                  </div>
                  <CardHeader className="pb-2">
                    <Badge className="w-fit mb-2 bg-gold/20 text-gold border-gold">$100,000</Badge>
                    <CardTitle className="text-xl">Presenting Partner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">Naming Rights: "VPA presented by [Partner]"</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">Exclusive 60-sec Executive message during show</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">4x :30 ads during livestream</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">Brand "logo bug" during broadcast</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">4 dedicated emails (600K+ impressions)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">Social reach: 1.4M+</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold mt-1 shrink-0" />
                      <span className="text-sm">Press release inclusion</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Sponsor */}
                <Card className="border-2 border-primary/50">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit mb-2 bg-primary/20 text-primary border-primary">$25,000 each</Badge>
                    <CardTitle className="text-xl">Category Sponsor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-sm">Category naming rights</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-sm">Logo across slides/ticker/email (200K+ impressions)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-sm">1 dedicated post + 3 stories</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-sm">On-screen recognition</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Engagement Sponsor */}
                <Card className="border-2 border-muted">
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">$10,000</Badge>
                    <CardTitle className="text-xl">Engagement Sponsor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <span className="text-sm">Livestream interview segment</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <span className="text-sm">Post-event newsletter + content features</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <span className="text-sm">Logo on app + Apple TV channel</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Technology & Build Value */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Code className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="font-display text-3xl font-bold">Technology & SaaS Value</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      Development Investment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-500 mb-2">240 Hours</div>
                    <p className="text-muted-foreground">Development time invested in platform</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Replacement Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-500 mb-2">~$75,000</div>
                    <p className="text-muted-foreground">Not including hosting, integrations, future upgrades</p>
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
                        <div className="font-medium">Avoid Sunk Costs</div>
                        <div className="text-sm text-muted-foreground">Skip $75K+ in development</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Accelerate Time-to-Market</div>
                        <div className="text-sm text-muted-foreground">Proven, operational system</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-full shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <div className="font-medium">Ecosystem Connected</div>
                        <div className="text-sm text-muted-foreground">Parade Deck integration ready</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card className="mt-8 border-2 border-primary/30">
                <CardHeader>
                  <CardTitle>What's Included in the Acquisition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Complete intellectual property (IP)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Front-end & back-end technology stack</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Veteran Podcast Awards name & branding</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>All URLs and domains</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>National Military Podcast Day ownership</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Existing user database & contacts</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Full Stack Event Platform */}
              <Card className="mt-8 border-2 border-gold/50 bg-gradient-to-br from-gold/5 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-gold" />
                    Full Stack Event Platform Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    A complete, custom-built event management platform providing a strong alternative to Eventbrite and other paid SaaS platforms.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gold/10 rounded-full shrink-0">
                        <Users className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium">Registration & Ticketing</div>
                        <div className="text-sm text-muted-foreground">Built-in user registration and event signups</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gold/10 rounded-full shrink-0">
                        <Tv className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium">Livestream Integration</div>
                        <div className="text-sm text-muted-foreground">Seamless streaming to web, mobile, Apple TV</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gold/10 rounded-full shrink-0">
                        <Mail className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium">Email Marketing</div>
                        <div className="text-sm text-muted-foreground">Built-in campaign tools with tracking</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gold/10 rounded-full shrink-0">
                        <Trophy className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium">Voting System</div>
                        <div className="text-sm text-muted-foreground">Complete nomination and voting workflow</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gold/10 rounded-full shrink-0">
                        <BarChart3 className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium">Analytics Dashboard</div>
                        <div className="text-sm text-muted-foreground">Real-time insights and reporting</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gold/10 rounded-full shrink-0">
                        <DollarSign className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <div className="font-medium">No Platform Fees</div>
                        <div className="text-sm text-muted-foreground">Unlike Eventbrite, keep 100% of revenue</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Growth Projections */}
        <section className="py-16 bg-gradient-to-br from-gold/5 via-background to-primary/5 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gold/20 rounded-full">
                  <BarChart3 className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-3xl font-bold">Growth Projections</h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* 2026 */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">Year 1</Badge>
                    <CardTitle className="text-2xl">2026</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-2xl font-bold text-blue-500">$400K–$500K</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Impressions</div>
                      <div className="text-2xl font-bold">5M+</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Bespoke Events</div>
                      <div className="text-2xl font-bold">1–2 pilots</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2027 */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">Year 2</Badge>
                    <CardTitle className="text-2xl">2027</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-2xl font-bold text-purple-500">$750K–$1M</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Impressions</div>
                      <div className="text-2xl font-bold">8M+</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Award Verticals</div>
                      <div className="text-2xl font-bold">3–4 shows</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2028 */}
                <Card className="relative overflow-hidden border-2 border-gold">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
                  <CardHeader>
                    <Badge className="w-fit mb-2 bg-gold/20 text-gold border-gold">Year 3</Badge>
                    <CardTitle className="text-2xl">2028</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-2xl font-bold text-gold">$1.5M+</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Impressions</div>
                      <div className="text-2xl font-bold">12M+</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <div className="text-lg font-bold">Marquee Annual Event</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ROI & Strategic Value */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold">Strategic Value & ROI</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-gold" />
                      Exclusive Ownership
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Flagship property in the veteran/military media space with established brand recognition and community trust.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-blue-500" />
                      Cross-Platform Amplification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Integration potential across Task & Purpose, MIC, Military Spouse Fest and other Recurrent properties.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-500" />
                      Scalable Format
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Bespoke award shows can be templated and launched in new verticals—first responders, healthcare, education, and more.
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Multiple Revenue Streams
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    Sponsorship, branded content, livestream advertising, licensing, and winner award purchases.
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8 bg-gradient-to-r from-primary/10 to-gold/10 border-2">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/20 rounded-full shrink-0">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Community Convener Role</h3>
                      <p className="text-muted-foreground">
                        VPA positions the acquirer as a central hub and community convener in the military/veteran space—
                        expanding influence beyond traditional media into recognition-driven engagement and creator economy participation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              This document is confidential and intended for prospective investors only.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              © {new Date().getFullYear()} Veteran Podcast Awards. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default Opportunity;
