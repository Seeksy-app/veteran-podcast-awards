import { Mic, Link2, Share2, Trophy } from "lucide-react";

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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">How It </span>
            <span className="text-gold-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to get your podcast recognized in the veteran community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4" />
              )}

              <div className="flex flex-col items-center text-center">
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center group-hover:border-primary group-hover:glow-gold transition-all duration-300">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-sm font-bold text-background">
                    {index + 1}
                  </div>
                </div>

                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
