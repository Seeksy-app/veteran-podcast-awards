import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SponsorDisplay } from "@/components/sponsors/SponsorDisplay";
import { SponsorshipBenefits } from "@/components/sponsors/SponsorshipBenefits";
import { ContactFormDialog, useContactForm } from "@/components/contact/ContactFormDialog";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const SponsorsPage = () => {
  const contactForm = useContactForm();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Sponsors & Partnership Opportunities"
        description="Partner with the Veteran Podcast Awards to reach the military and veteran podcasting community. Sponsorship tiers available for the 2026 awards ceremony."
        keywords="veteran podcast sponsors, military podcast sponsorship, veteran podcast awards partners, sponsor opportunities"
        canonicalUrl="/sponsors"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">Our </span>
              <span className="text-gold-gradient">Sponsors</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thank you to our sponsors for making the Veteran Podcast Awards possible.
            </p>
          </div>

          {/* Sponsor Tiers - Dynamic from Database */}
          <div className="max-w-4xl mx-auto mb-12">
            <SponsorDisplay />
          </div>

          {/* Become a Sponsor CTA */}
          <div className="text-center mb-8">
            <Button 
              variant="goldOutline" 
              size="lg"
              onClick={() => contactForm.openForm("sponsorship")}
            >
              <Users className="w-5 h-5 mr-2" />
              Become a Sponsor
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
