import { Calendar, Bell } from "lucide-react";
import { PreRegistrationForm } from "./PreRegistrationForm";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CallToAction = () => {
  return (
    <section className="py-20 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">October 5th, 2026</span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Don't Miss the </span>
            <span className="text-gold-gradient">Ceremony</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            The 2026 Veteran Podcast Awards will be streamed live worldwide. 
            Sign up to get reminders and be the first to know when registration opens.
          </p>

          <div className="flex justify-center mb-8">
            <PreRegistrationForm />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link to="/livestream">
              <Button variant="goldOutline">
                View Livestream Page
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground mt-6">
            <Bell className="w-4 h-4" />
            <p className="text-sm">
              Registration opens Summer 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
