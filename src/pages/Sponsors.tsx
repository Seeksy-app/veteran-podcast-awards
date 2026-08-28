import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SponsorshipBenefits } from "@/components/sponsors/SponsorshipBenefits";
import { ContactFormDialog, useContactForm } from "@/components/contact/ContactFormDialog";
import { Users, BadgeCheck } from "lucide-react";
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

  // Slots already taken per package
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

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sponsorship Opportunities"
        description="Partner with the Veteran Podcast Awards to reach the military and veteran podcasting community. Sponsorship packages available for the 2026 awards."
        keywords="veteran podcast sponsors, military podcast sponsorship, veteran podcast awards partners, sponsor opportunities"
        canonicalUrl="/sponsors"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Sponsorship </span>
              <span className="text-gold-gradient">Opportunities</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Put your brand in front of the military and veteran podcasting community —
              voting opens October 5 and the ceremony streams live worldwide on Veterans Day.
            </p>
          </div>

          {/* Packages */}
          <div className="max-w-5xl mx-auto mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

          {/* Become a Sponsor CTA */}
          <div className="text-center mb-8">
            <Button
              variant="goldOutline"
              size="lg"
              onClick={() => contactForm.openForm("sponsorship")}
            >
              <Users className="w-5 h-5 mr-2" />
              Talk to Us About Sponsoring
            </Button>
          </div>
        </div>

        {/* Sponsorship Benefits Section */}
        <SponsorshipBenefits onContactClick={() => contactForm.openForm("sponsorship")} />
      </main>
      <Footer />

      {/* Contact Form Dialog */}
      <ContactFormDialog
        open={contactForm.isOpen}
        onOpenChange={contactForm.setIsOpen}
        type={contactForm.formType}
      />
    </div>
  );
};

export default SponsorsPage;
