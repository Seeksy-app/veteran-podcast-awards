import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Calendar, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreRegistrationForm } from "@/components/home/PreRegistrationForm";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

const VIDEO_URL = "https://snhrqbtwahgarxxbizsz.supabase.co/storage/v1/object/public/videos/hero-video.mp4";

const LivestreamPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Live Awards Ceremony"
        description="Watch the 2026 Veteran Podcast Awards live on Veterans Day, November 11th. Streaming worldwide to celebrate the best in veteran podcasting."
        keywords="veteran podcast awards livestream, live ceremony, veterans day, military podcast awards"
        canonicalUrl="/livestream"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-4 py-2 mb-6">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">November 11th, 2026 &bull; Veterans Day</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">Watch Live</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join us on Veterans Day for the live ceremony celebrating
              the best in veteran podcasting. Streaming worldwide.
            </p>
          </div>

          {/* Video Player Section */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="relative aspect-video bg-card border border-border rounded-xl overflow-hidden">
              <video
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={VIDEO_URL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Full ceremony streaming November 11th, 2026 at 6:00 PM ET</span>
            </div>
          </div>

          {/* Registration Section */}
          <div className="max-w-2xl mx-auto mb-12">
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

          {/* Sponsors CTA hidden while packages are finalized — /sponsors stays live but unlisted */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LivestreamPage;
