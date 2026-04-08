import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Trophy, 
  Tv, 
  Mail, 
  Share2,
  Code,
  Clock,
  Target,
  Building,
  Star,
  Zap,
  BarChart3,
  Globe,
  CheckCircle2
} from "lucide-react";

const bodyPrimary = "text-[#FFFFFF]";

export const OpportunityContent = () => {
  return (
    <div
      className={`space-y-8 ${bodyPrimary} [&_.text-muted-foreground]:!text-[#CBD5E1] [&_.text-card-foreground]:!text-[#FFFFFF] [&_.text-muted-foreground]:!opacity-100 [&_p]:!opacity-100 [&_span]:!opacity-100 [&_h1]:!opacity-100 [&_h2]:!opacity-100 [&_h3]:!opacity-100 [&_strong]:!text-[#FFFFFF] [&_strong]:font-semibold`}
    >
      {/* Hero Section */}
      <section className="relative rounded-xl border border-[#F59E0B]/25 bg-[#0F2035] py-12 shadow-[0_0_80px_rgba(245,158,11,0.06)]">
        <div className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-[#F59E0B] text-[#FFFFFF]">
              Exclusive Investment Opportunity
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#FFFFFF] mb-6">
              Veteran Podcast Awards
            </h1>
            <p className={`text-lg ${bodyPrimary} mb-4 max-w-2xl mx-auto`}>
              A flagship recognition platform in the military/veteran media space with proven technology and established brand equity.
            </p>
            <p className="text-lg font-semibold text-[#FFFFFF] mb-8">
              Significant growth potential.
            </p>
            
            {/* Available Audience */}
            <div className="mb-4">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Available Audience to Target
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="rounded-xl border border-[#F59E0B]/35 bg-[#0F2035] p-4">
                  <div className="text-2xl md:text-3xl font-bold text-[#FFFFFF] mb-2">18M+</div>
                  <div className="text-xs text-[#CBD5E1]">Veterans in the U.S.</div>
                </div>
                <div className="rounded-xl border border-[#F59E0B]/35 bg-[#0F2035] p-4">
                  <div className="text-2xl md:text-3xl font-bold text-[#FFFFFF] mb-2">2M+</div>
                  <div className="text-xs text-[#CBD5E1]">Active Duty Service Members</div>
                </div>
                <div className="rounded-xl border border-[#F59E0B]/35 bg-[#0F2035] p-4">
                  <div className="text-2xl md:text-3xl font-bold text-[#FFFFFF] mb-2">40M+</div>
                  <div className="text-xs text-[#CBD5E1]">Military-Connected Americans</div>
                </div>
                <div className="rounded-xl border border-[#F59E0B]/35 bg-[#0F2035] p-4">
                  <div className="text-2xl md:text-3xl font-bold text-[#FFFFFF] mb-2">500K+</div>
                  <div className="text-xs text-[#CBD5E1]">Combined Social Media Reach</div>
                </div>
              </div>
              <p className="text-xs text-[#CBD5E1] mt-4">
                These figures represent the addressable market—an untapped audience that, when targeted, could significantly elevate the value of this property.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example 2026 Sponsorship Opportunities */}
      <section className="rounded-xl border border-[#F59E0B]/15 bg-[#0F2035] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gold/20 rounded-full">
              <DollarSign className="w-6 h-6 text-[#FFFFFF]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#FFFFFF]">Example 2026 Sponsorship Opportunities</h2>
          </div>
          <p className={`${bodyPrimary} mb-6 max-w-2xl`}>
            Multiple revenue streams through tiered sponsorship packages designed for brands seeking authentic connection with the military community.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="rounded-xl border-2 border-[#F59E0B]/45 bg-[#0F2035] p-4 text-center transition-colors hover:border-[#F59E0B]/70">
              <Trophy className="w-8 h-8 text-[#FFFFFF] mx-auto mb-3" />
              <h3 className="mb-1 font-semibold text-[#FFFFFF]">Presenting</h3>
              <p className="text-xs text-[#CBD5E1]">Title naming rights</p>
            </div>
            <div className="rounded-xl border-2 border-[#F59E0B]/45 bg-[#0F2035] p-4 text-center transition-colors hover:border-[#F59E0B]/70">
              <Star className="w-8 h-8 text-[#FFFFFF] mx-auto mb-3" />
              <h3 className="mb-1 font-semibold text-[#FFFFFF]">Category</h3>
              <p className="text-xs text-[#CBD5E1]">Award category sponsor</p>
            </div>
            <div className="rounded-xl border-2 border-[#F59E0B]/45 bg-[#0F2035] p-4 text-center transition-colors hover:border-[#F59E0B]/70">
              <Trophy className="w-8 h-8 text-[#FFFFFF] mx-auto mb-3" />
              <h3 className="mb-1 font-semibold text-[#FFFFFF]">Award</h3>
              <p className="text-xs text-[#CBD5E1]">Individual award sponsor</p>
            </div>
            <div className="rounded-xl border-2 border-[#F59E0B]/45 bg-[#0F2035] p-4 text-center transition-colors hover:border-[#F59E0B]/70">
              <Tv className="w-8 h-8 text-[#FFFFFF] mx-auto mb-3" />
              <h3 className="mb-1 font-semibold text-[#FFFFFF]">Livestream</h3>
              <p className="text-xs text-[#CBD5E1]">Broadcast integration</p>
            </div>
            <div className="rounded-xl border-2 border-[#F59E0B]/45 bg-[#0F2035] p-4 text-center transition-colors hover:border-[#F59E0B]/70">
              <Users className="w-8 h-8 text-[#FFFFFF] mx-auto mb-3" />
              <h3 className="mb-1 font-semibold text-[#FFFFFF]">& More</h3>
              <p className="text-xs text-[#CBD5E1]">Custom packages</p>
            </div>
          </div>

          <p className="text-center text-xs text-[#CBD5E1] mt-6">
            Sponsorship tiers range from $10K engagement packages to $100K+ presenting partnerships
          </p>
        </div>
      </section>

      {/* Technology & Build Value */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-full bg-[#F59E0B]/10 p-3">
              <Code className="h-6 w-6 text-[#FFFFFF]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#FFFFFF]">Technology & SaaS Value</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="border border-[#F59E0B]/25 bg-[#0F2035]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-[#FFFFFF]">
                  <Clock className="h-5 w-5 text-[#FFFFFF]" />
                  Development Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-3xl font-bold text-[#FFFFFF]">240 Hours</div>
                <p className="text-sm text-[#CBD5E1]">Development time invested in platform</p>
              </CardContent>
            </Card>

            <Card className="border border-[#F59E0B]/25 bg-[#0F2035]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-[#FFFFFF]">
                  <DollarSign className="h-5 w-5 text-[#FFFFFF]" />
                  Replacement Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-3xl font-bold text-[#FFFFFF]">~$75,000</div>
                <p className="text-sm text-[#CBD5E1]">Not including hosting, integrations, future upgrades</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-[#F59E0B]/25 bg-[#0F2035]">
            <CardContent className="pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#FFFFFF]">
                <Zap className="h-5 w-5 text-[#FFFFFF]" />
                Build vs. Buy Advantages
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-[#F59E0B]/15 p-2">
                    <CheckCircle2 className="h-4 w-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#FFFFFF]">Avoid Sunk Costs</div>
                    <div className="text-xs text-[#CBD5E1]">Skip $75K+ in development</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-[#F59E0B]/15 p-2">
                    <CheckCircle2 className="h-4 w-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#FFFFFF]">Accelerate Time-to-Market</div>
                    <div className="text-xs text-[#CBD5E1]">Proven, operational system</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-[#F59E0B]/15 p-2">
                    <CheckCircle2 className="h-4 w-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${bodyPrimary}`}>Ecosystem Connected</div>
                    <div className="text-xs text-[#CBD5E1]">Parade Deck integration ready</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card className="mt-6 border-2 border-[#F59E0B]/35 bg-[#0F2035]">
            <CardHeader>
              <CardTitle className="text-lg text-[#FFFFFF]">What's Included in the Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
                    <span className={`text-sm ${bodyPrimary}`}>Complete intellectual property (IP)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
                    <span className={`text-sm ${bodyPrimary}`}>Front-end & back-end technology stack</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
                    <span className={`text-sm ${bodyPrimary}`}>Veteran Podcast Awards name & branding</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
                    <span className={`text-sm ${bodyPrimary}`}>All URLs and domains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
                    <span className={`text-sm ${bodyPrimary}`}>National Military Podcast Day ownership</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
                    <span className={`text-sm ${bodyPrimary}`}>Existing user database & contacts</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Stack Event Platform */}
          <Card className="mt-6 border-2 border-[#F59E0B]/40 bg-[#0F2035]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-[#FFFFFF]">
                <Tv className="w-5 h-5 text-[#FFFFFF]" />
                Full Stack Event Platform Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm ${bodyPrimary} mb-4`}>
                A complete, custom-built event management platform providing a strong alternative to Eventbrite and other paid SaaS platforms.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Users className="w-4 h-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${bodyPrimary}`}>Registration & Ticketing</div>
                    <div className="text-xs text-[#CBD5E1]">Built-in user registration and event signups</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Tv className="w-4 h-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${bodyPrimary}`}>Livestream Integration</div>
                    <div className="text-xs text-[#CBD5E1]">Seamless streaming to web, mobile, Apple TV</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Mail className="w-4 h-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${bodyPrimary}`}>Email Marketing</div>
                    <div className="text-xs text-[#CBD5E1]">Built-in campaign tools with tracking</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <Trophy className="w-4 h-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${bodyPrimary}`}>Voting System</div>
                    <div className="text-xs text-[#CBD5E1]">Complete nomination and voting workflow</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <BarChart3 className="w-4 h-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${bodyPrimary}`}>Analytics Dashboard</div>
                    <div className="text-xs text-[#CBD5E1]">Real-time insights and reporting</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gold/10 rounded-full shrink-0">
                    <DollarSign className="w-4 h-4 text-[#FFFFFF]" />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${bodyPrimary}`}>No Platform Fees</div>
                    <div className="text-xs text-[#CBD5E1]">Unlike Eventbrite, keep 100% of revenue</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Growth Projections */}
      <section className="rounded-xl border border-[#F59E0B]/15 bg-[#0F2035] px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gold/20 rounded-full">
              <BarChart3 className="h-6 w-6 text-[#FFFFFF]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#FFFFFF]">Growth Projections</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 2026 */}
            <Card className="relative overflow-hidden border border-[#F59E0B]/20 bg-[#0F2035]">
              <div className="absolute left-0 right-0 top-0 h-1 bg-[#F59E0B]" />
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit border-[#F59E0B]/50 text-[#FFFFFF]">
                  Year 1
                </Badge>
                <CardTitle className="text-xl text-[#FFFFFF]">2026</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-[#CBD5E1]">Revenue</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">$400K–$500K</div>
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Impressions</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">5M+</div>
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Bespoke Events</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">1–2 pilots</div>
                </div>
              </CardContent>
            </Card>

            {/* 2027 */}
            <Card className="relative overflow-hidden border border-[#F59E0B]/20 bg-[#0F2035]">
              <div className="absolute left-0 right-0 top-0 h-1 bg-[#FBBF24]" />
              <CardHeader>
                <Badge variant="outline" className="mb-2 w-fit border-[#F59E0B]/50 text-[#FFFFFF]">
                  Year 2
                </Badge>
                <CardTitle className="text-xl text-[#FFFFFF]">2027</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-[#CBD5E1]">Revenue</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">$750K–$1M</div>
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Impressions</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">8M+</div>
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Award Verticals</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">3–4 shows</div>
                </div>
              </CardContent>
            </Card>

            {/* 2028 */}
            <Card className="relative overflow-hidden border-2 border-[#F59E0B]/50 bg-[#0F2035]">
              <div className="absolute left-0 right-0 top-0 h-1 bg-[#F59E0B]" />
              <CardHeader>
                <Badge className="mb-2 w-fit border-[#F59E0B] bg-[#F59E0B]/15 text-[#FFFFFF]">Year 3</Badge>
                <CardTitle className="text-xl text-[#FFFFFF]">2028</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-[#CBD5E1]">Revenue</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">$1.5M+</div>
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Impressions</div>
                  <div className="text-xl font-bold text-[#FFFFFF]">12M+</div>
                </div>
                <div>
                  <div className="text-xs text-[#CBD5E1]">Status</div>
                  <div className="text-lg font-bold text-[#FFFFFF]">Marquee Annual Event</div>
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
            <div className="rounded-full bg-[#F59E0B]/10 p-3">
              <Target className="h-6 w-6 text-[#FFFFFF]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#FFFFFF]">Strategic Value & ROI</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-[#F59E0B]/25 bg-[#0F2035] transition-colors hover:border-[#F59E0B]/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-[#FFFFFF]">
                  <Star className="h-5 w-5 text-[#FFFFFF]" />
                  Exclusive Ownership
                </CardTitle>
              </CardHeader>
              <CardContent className={`text-sm ${bodyPrimary}`}>
                Flagship property in the veteran/military media space with established brand recognition and community trust.
              </CardContent>
            </Card>

            <Card className="border border-[#F59E0B]/25 bg-[#0F2035] transition-colors hover:border-[#F59E0B]/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-[#FFFFFF]">
                  <Share2 className="h-5 w-5 text-[#FFFFFF]" />
                  Cross-Platform Amplification
                </CardTitle>
              </CardHeader>
              <CardContent className={`text-sm ${bodyPrimary}`}>
                Integration potential across Task & Purpose, MIC, Military Spouse Fest and other Recurrent properties.
              </CardContent>
            </Card>

            <Card className="border border-[#F59E0B]/25 bg-[#0F2035] transition-colors hover:border-[#F59E0B]/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-[#FFFFFF]">
                  <Globe className="h-5 w-5 text-[#FFFFFF]" />
                  Scalable Format
                </CardTitle>
              </CardHeader>
              <CardContent className={`text-sm ${bodyPrimary}`}>
                Bespoke award shows can be templated and launched in new verticals—first responders, healthcare, education, and more.
              </CardContent>
            </Card>

            <Card className="border border-[#F59E0B]/25 bg-[#0F2035] transition-colors hover:border-[#F59E0B]/45">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-[#FFFFFF]">
                  <TrendingUp className="h-5 w-5 text-[#FFFFFF]" />
                  Multiple Revenue Streams
                </CardTitle>
              </CardHeader>
              <CardContent className={`text-sm ${bodyPrimary}`}>
                Sponsorship, branded content, livestream advertising, licensing, and winner award purchases.
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-2 border-[#F59E0B]/30 bg-[#0F2035]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-full bg-[#F59E0B]/15 p-3">
                  <Building className="h-6 w-6 text-[#FFFFFF]" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-[#FFFFFF]">Community Convener Role</h3>
                  <p className={`text-sm ${bodyPrimary}`}>
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
      <section className="rounded-xl border border-[#F59E0B]/15 bg-[#0F2035] py-8 text-center">
        <p className="text-sm text-[#CBD5E1]">
          This document is confidential and intended for prospective investors only.
        </p>
        <p className="text-xs text-[#CBD5E1] mt-2">
          © {new Date().getFullYear()} Veteran Podcast Awards. All rights reserved.
        </p>
      </section>
    </div>
  );
};
