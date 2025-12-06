import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Award, Calendar, Mic, Users, Heart, Video } from "lucide-react";
import { PreRegistrationForm } from "@/components/home/PreRegistrationForm";
import logo from "@/assets/vpa-logo.png";
import { SEO } from "@/components/SEO";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About Us"
        description="Learn about the Veteran Podcast Awards mission to celebrate and recognize veteran podcasters. Join us October 5th, 2026 for our first livestream awards ceremony."
        keywords="about veteran podcast awards, veteran podcast mission, military podcast community, podcaster recognition"
        canonicalUrl="/about"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <img
              src={logo}
              alt="Veteran Podcast Awards"
              className="w-28 h-28 mx-auto mb-6 glow-gold rounded-full"
            />
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">About the </span>
              <span className="text-gold-gradient">Veteran Podcast Awards</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Celebrating the impactful voices of veteran podcasters and honoring
              those who share their stories with the world.
            </p>
          </div>

          {/* Mission Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-card border border-border rounded-xl p-8 md:p-12">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
                <span className="text-gold-gradient">Our Mission</span>
              </h2>
              <p className="text-muted-foreground text-center mb-8 text-lg">
                The Veteran Podcast Awards exists to recognize and celebrate the
                extraordinary contributions of veteran podcasters to our community.
                We believe in the power of storytelling and the unique perspectives
                that veterans bring to the podcasting world.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Amplify Voices
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We elevate veteran stories that deserve to be heard.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Build Community
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We connect veteran podcasters and their audiences.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Honor Service
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We recognize those who continue to serve through content.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2026 Livestream */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-destructive/10 to-card border border-destructive/30 rounded-xl p-8 md:p-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Video className="w-6 h-6 text-destructive" />
                <span className="text-sm text-destructive font-semibold uppercase tracking-wider">
                  Live Streaming Event
                </span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
                <span className="text-gold-gradient">2026 Awards Ceremony</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
                For the first time, the Veteran Podcast Awards will be streamed live worldwide
                on October 5th, 2026. Join us from anywhere to celebrate the best in veteran podcasting.
              </p>
              <div className="flex justify-center">
                <PreRegistrationForm />
              </div>
            </div>
          </div>

          {/* National Military Podcast Day */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-secondary to-card border border-border rounded-xl p-8 md:p-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-sm text-primary font-semibold uppercase tracking-wider">
                  October 5th
                </span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-center">
                <span className="text-gold-gradient">National Military Podcast Day</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                The Veteran Podcast Awards coincides with National Military Podcast Day,
                a property of the VPA. This annual celebration brings together the
                veteran podcasting community to recognize excellence and foster
                connections among content creators who serve our community.
              </p>
            </div>
          </div>

          {/* History */}
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8 text-center">
              <span className="text-foreground">Our </span>
              <span className="text-gold-gradient">Story</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <span className="font-serif text-lg font-semibold text-foreground">
                    Why We Started
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  The Veteran Podcast Awards was born from a recognition that
                  veteran podcasters were creating incredible content without
                  a dedicated platform to celebrate their work. We set out to
                  change that by creating an awards program specifically for
                  the veteran podcasting community.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-primary" />
                  <span className="font-serif text-lg font-semibold text-foreground">
                    Looking Forward
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  In 2026, we're taking the awards to the next level with our first
                  ever livestream ceremony. We're committed to expanding our
                  reach and finding more ways to support veteran podcasters
                  in sharing their important stories with the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
