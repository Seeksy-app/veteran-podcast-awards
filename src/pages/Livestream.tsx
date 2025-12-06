import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Calendar, Bell, Users } from "lucide-react";
import { PreRegistrationForm } from "@/components/home/PreRegistrationForm";
import { SponsorDisplay } from "@/components/sponsors/SponsorDisplay";
import { SponsorshipBenefits } from "@/components/sponsors/SponsorshipBenefits";
import logo from "@/assets/vpa-logo.png";

const VIDEO_URL = "https://snhrqbtwahgarxxbizsz.supabase.co/storage/v1/object/public/videos/hero-video.mp4";

const LivestreamPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Live Badge Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-full px-4 py-2 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-red-400 font-medium uppercase tracking-wider">Live Streaming Event</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">Watch Live</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us on October 5th, 2026 for the live ceremony celebrating 
              the best in veteran podcasting. Streaming worldwide.
            </p>
          </div>

          {/* Video Player Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative aspect-video bg-card border border-border rounded-xl overflow-hidden">
              <video
                controls
                className="w-full h-full object-cover"
                poster=""
              >
                <source src={VIDEO_URL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Overlay for pre-event */}
              <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                <img
                  src={logo}
                  alt="Veteran Podcast Awards"
                  className="w-24 h-24 mb-6 glow-gold rounded-full"
                />
                <div className="flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">October 5th, 2026 • 6:00 PM ET</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Coming Soon
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                  The livestream will begin on the day of the event. 
                  Register below to get a reminder.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Section */}
          <div className="max-w-2xl mx-auto mb-20">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  Get Reminded
                </h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Sign up to receive a reminder when the livestream goes live. 
                We'll send you the link directly to your inbox.
              </p>
              <div className="flex justify-center">
                <PreRegistrationForm />
              </div>
            </div>
          </div>

          {/* Sponsors Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                <span className="text-foreground">Our </span>
                <span className="text-gold-gradient">Sponsors</span>
              </h2>
              <p className="text-muted-foreground">
                Thank you to our sponsors for making this event possible.
              </p>
            </div>

            {/* Sponsor Tiers - Dynamic from Database */}
            <SponsorDisplay />

            {/* Become a Sponsor CTA */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-6 py-4">
                <Users className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Interested in sponsoring?</p>
                  <p className="text-sm text-muted-foreground">Scroll down to learn about our sponsorship opportunities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Benefits Section */}
        <SponsorshipBenefits />
      </main>
      <Footer />
    </div>
  );
};

export default LivestreamPage;
