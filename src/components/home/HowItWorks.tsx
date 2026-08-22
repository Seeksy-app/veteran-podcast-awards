import { Mic, Link2, Share2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const steps = [
  {
    icon: Mic,
    title: "Register Your Podcast",
    description: "Connect your RSS feed and fill out your podcast details to enter the awards.",
  },
  {
    icon: Link2,
    title: "Choose Categories",
    description: "Select the award categories that best fit your podcast content and style.",
  },
  {
    icon: Share2,
    title: "Share Your Voting Link",
    description: "Get a unique voting link to share with your audience and community.",
  },
  {
    icon: Trophy,
    title: "Win Recognition",
    description: "Gather votes, impress our judges, and earn your place among the best.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="relative bg-background overflow-hidden">
      {/* Top fade — blends into the section above */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[900px]">
        {/* Left: Microphone — centered, blends seamlessly into right column */}
        <div className="relative hidden lg:block">
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-[62%_45%]"
          />
          {/* Seamless right-edge blend */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent from-30% via-background/40 via-70% to-background" />
          {/* Top fade */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/60 to-transparent" />
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Right: Content */}
        <div className="relative z-10 flex flex-col justify-center py-32 lg:py-40 px-8 lg:pl-16 lg:pr-28">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-5">
            <span className="text-foreground">How It </span>
            <span className="text-gold-gradient">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-14">
            Register your podcast and get recognized in the veteran community.
          </p>

          <div className="space-y-10 mb-14">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-start gap-5 group">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:glow-gold transition-all duration-300">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-background">
                    {index + 1}
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Link to="/auth?mode=signup">
              <Button variant="gold" size="lg" className="h-14 px-10 text-base">
                <Mic className="w-5 h-5 mr-2" />
                Register Your Podcast
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile: show image as background behind the whole section */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
      </div>
    </section>
  );
};
