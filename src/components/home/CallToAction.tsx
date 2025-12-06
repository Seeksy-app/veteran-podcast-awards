import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, Calendar } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">October 5th, 2025</span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Ready to Be </span>
            <span className="text-gold-gradient">Recognized?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the veteran podcasting community's biggest celebration. Register your podcast
            today and let your audience vote for you in the 2025 Veteran Podcast Awards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="hero" size="xl">
                <Mic className="w-5 h-5" />
                Register Your Podcast
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Registration deadline: September 15th, 2025
          </p>
        </div>
      </div>
    </section>
  );
};
