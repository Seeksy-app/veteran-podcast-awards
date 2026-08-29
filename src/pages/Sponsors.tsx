import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SponsorshipBenefits } from "@/components/sponsors/SponsorshipBenefits";
import { ContactFormDialog, useContactForm } from "@/components/contact/ContactFormDialog";
import { Users, BadgeCheck, Mic, Share2, TrendingUp, Star, Radio, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

interface SponsorPackage {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  slots_total: number;
  sort_order: number;
  is_active: boolean;
}

/**
 * Projection model (edit these to tune the public numbers):
 * every registered podcaster shares their voting link throughout the Oct 5 – Nov window;
 * each share carries the category/title sponsor's branding.
 */
const MODEL = {
  avgAudiencePerShow: 1200, // avg listeners/followers per network show
  sharesPerNominee: 15, // voting-link pushes per nominee over the voting window
  impressionsPerShare: 350, // avg social impressions per share
};

// Placeholder podcaster imagery — swap with real VPA podcaster photos anytime
const IMG = {
  studio: "https://images.unsplash.com/photo-1598743400863-0201c7e1445b?w=1200&q=80",
  mic: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&q=80",
  crowd: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80",
};

// Unlisted page: intentionally not linked from the nav while packages are finalized.
const SponsorsPage = () => {
  const contactForm = useContactForm();

  const { data: packages } = useQuery({
    queryKey: ["public-sponsor-tiers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sponsor_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) return [] as SponsorPackage[];
      return data as SponsorPackage[];
    },
  });

  const { data: taken } = useQuery({
    queryKey: ["public-sponsor-tier-usage"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("sponsors").select("tier_id");
      if (error) return {} as Record<string, number>;
      const counts: Record<string, number> = {};
      (data as { tier_id: string | null }[]).forEach((s) => {
        if (s.tier_id) counts[s.tier_id] = (counts[s.tier_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Live network size straight from the directory
  const { data: showCount } = useQuery({
    queryKey: ["public-network-count"],
    queryFn: async () => {
      const { count } = await supabase.from("podcasts").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const shows = showCount || 800;
  const reach = Math.round((shows * MODEL.avgAudiencePerShow) / 100000) / 10; // in 100k → M
  const impressionsPerNominee = MODEL.sharesPerNominee * MODEL.impressionsPerShare;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sponsorship Opportunities"
        description="Partner with the Veteran Podcast Awards to reach the military and veteran podcasting community. Sponsorship packages available for the 2026 awards."
        keywords="veteran podcast sponsors, military podcast sponsorship, veteran podcast awards partners, sponsor opportunities"
        canonicalUrl="/sponsors"
      />
      <Header />
      <main className="pt-16">
        {/* ─── Hero: the amplification thesis ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={IMG.studio} alt="" className="w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          </div>
          <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-5">
              2026 Sponsorship Opportunities
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
              <span className="text-foreground">Every podcaster who registers becomes </span>
              <span className="text-gold-gradient">your broadcast channel.</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-6 text-lg">
              Nominees campaign for votes. Every voting link they share — to their listeners, their
              socials, their communities — carries your brand with it. Your sponsorship doesn't sit
              on a banner. It rides the network.
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <Button variant="gold" size="lg" onClick={() => contactForm.openForm("sponsorship")}>
                <Users className="w-5 h-5 mr-2" />
                Become a Sponsor
              </Button>
              <Button variant="goldOutline" size="lg" asChild>
                <a href="#packages">See Packages</a>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Distribution numbers ─── */}
        <section className="border-y border-primary/20 bg-secondary/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { n: `${shows}+`, label: "Shows in the Network", icon: Radio },
                { n: `${reach}M+`, label: "Combined Audience Reach*", icon: TrendingUp },
                { n: "16", label: "Award Categories", icon: Trophy },
                { n: `${(impressionsPerNominee / 1000).toFixed(1)}K`, label: "Projected Impressions per Nominee*", icon: Share2 },
              ].map((s) => (
                <div key={s.label}>
                  <s.icon className="w-5 h-5 text-primary mx-auto mb-3" />
                  <p className="font-serif text-4xl md:text-5xl font-bold text-gold-gradient">{s.n}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/60 text-center mt-8">
              *Projections based on average show audience of {MODEL.avgAudiencePerShow.toLocaleString()} and{" "}
              {MODEL.sharesPerNominee} voting-link shares per nominee at {MODEL.impressionsPerShare} impressions each
              across the Oct 5 – Nov 11 voting window.
            </p>
          </div>
        </section>

        {/* ─── The flywheel ─── */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              <span className="text-foreground">The </span>
              <span className="text-gold-gradient">Sponsor Flywheel</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mt-3">
              Awards are the only sponsorship where the talent does the promoting for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Mic,
                step: "01",
                title: "Podcasters register",
                body: "Veteran podcasters enter their shows in the categories you sponsor — your brand is on the category page, the ballot, and the award itself.",
                img: IMG.mic,
              },
              {
                icon: Share2,
                step: "02",
                title: "Nominees campaign",
                body: "Every nominee pushes their voting link to their audience for five weeks. Each push is an impression for the sponsor attached to it.",
                img: IMG.studio,
              },
              {
                icon: Star,
                step: "03",
                title: "Your brand compounds",
                body: "More nominees, more shares, more reach — capped off with your name in lights at the Veterans Day ceremony, streamed live worldwide.",
                img: IMG.crowd,
              },
            ].map((c) => (
              <div key={c.step} className="rounded-2xl overflow-hidden border border-border bg-secondary/40 flex flex-col">
                <div className="relative h-40">
                  <img src={c.img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <span className="absolute bottom-3 left-4 font-serif text-4xl font-bold text-primary/80">{c.step}</span>
                </div>
                <div className="p-6 pt-3 flex-1">
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                    <c.icon className="w-4 h-4 text-primary" /> {c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Packages ─── */}
        <section id="packages" className="container mx-auto px-4 pb-20">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold">
              <span className="text-foreground">Sponsorship </span>
              <span className="text-gold-gradient">Packages</span>
            </h2>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(packages || []).map((p) => {
              const used = taken?.[p.id] || 0;
              const left = Math.max(0, p.slots_total - used);
              const soldOut = left === 0;
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl border p-6 flex flex-col bg-secondary/40 ${
                    soldOut ? "border-border opacity-60" : "border-primary/30"
                  }`}
                >
                  <h3 className="font-serif text-lg font-bold text-foreground">{p.name}</h3>
                  <p className="text-3xl font-bold text-gold-gradient mt-2">
                    {p.price != null ? `$${Number(p.price).toLocaleString()}` : "Contact us"}
                  </p>
                  <p className={`text-xs mt-2 font-medium ${soldOut ? "text-destructive" : "text-muted-foreground"}`}>
                    {soldOut ? "Sold out" : `${left} of ${p.slots_total} available`}
                  </p>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed flex-1">{p.description}</p>
                  )}
                  <Button
                    variant={soldOut ? "outline" : "gold"}
                    disabled={soldOut}
                    className="mt-6 w-full"
                    onClick={() => contactForm.openForm("sponsorship")}
                  >
                    <BadgeCheck className="w-4 h-4 mr-2" />
                    {soldOut ? "Unavailable" : "Reserve This Package"}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sponsorship Benefits Section */}
        <SponsorshipBenefits onContactClick={() => contactForm.openForm("sponsorship")} />
      </main>
      <Footer />

      <ContactFormDialog
        open={contactForm.isOpen}
        onOpenChange={contactForm.setIsOpen}
        type={contactForm.formType}
      />
    </div>
  );
};

export default SponsorsPage;
