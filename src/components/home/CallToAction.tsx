import { useState } from "react";
import { Calendar, Award, Users, Mic } from "lucide-react";
import { PreRegistrationForm } from "./PreRegistrationForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ContactFormDialog } from "@/components/contact/ContactFormDialog";

type ContactType = "sponsorship" | "general" | "nomination" | "partnership" | "media";

export const CallToAction = () => {
  const [contactType, setContactType] = useState<ContactType>("general");
  const [isContactOpen, setIsContactOpen] = useState(false);

  const openContact = (type: ContactType) => {
    setContactType(type);
    setIsContactOpen(true);
  };

  return (
    <>
      <section className="py-36 md:py-48 bg-white dark:bg-zinc-800 border-y border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-10">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Awards Show &bull; November 11th, 2026</span>
            </div>

            <h2 className="font-serif text-5xl md:text-7xl font-bold mb-10">
              <span className="text-foreground">Don't Miss the </span>
              <span className="text-gold-gradient">Ceremony</span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
              The 2026 Veteran Podcast Awards will be streamed live worldwide on Veterans Day.
              Voting opens October 5th. Sign up to get reminders and&nbsp;updates.
            </p>

            <div className="flex justify-center mb-16">
              <PreRegistrationForm />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/auth?mode=signup">
                <Button variant="goldOutline" size="lg">
                  <Mic className="w-4 h-4 mr-2" />
                  Register as Podcaster
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => openContact("nomination")}
              >
                <Award className="w-4 h-4 mr-2" />
                Nominate a Podcast
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => openContact("sponsorship")}
              >
                <Users className="w-4 h-4 mr-2" />
                Become a Sponsor
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ContactFormDialog
        open={isContactOpen}
        onOpenChange={setIsContactOpen}
        type={contactType}
      />
    </>
  );
};
