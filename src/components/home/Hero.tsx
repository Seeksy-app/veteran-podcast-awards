import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Users, Radio, Video } from "lucide-react";
import logo from "@/assets/vpa-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { CountdownTimer } from "./CountdownTimer";
import { PreRegistrationForm } from "./PreRegistrationForm";
import { useState } from "react";

// Video URL from Supabase storage
const VIDEO_URL = "https://snhrqbtwahgarxxbizsz.supabase.co/storage/v1/object/public/videos/hero-video.mp4";

export const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      )}

      {/* Fallback Image Background */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          videoLoaded && !videoError ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="animate-float mb-8">
            <img
              src={logo}
              alt="Veteran Podcast Awards"
              className="w-32 h-32 md:w-40 md:h-40 glow-gold rounded-full"
            />
          </div>

          {/* Livestream Badge */}
          <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive/50 rounded-full px-4 py-2 mb-4 animate-fade-in">
            <Video className="w-4 h-4 text-destructive animate-pulse" />
            <span className="text-sm text-destructive font-medium">
              Live Streaming Event
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              National Military Podcast Day • October 5th, 2026
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-gold-gradient">Veteran Podcast</span>
            <br />
            <span className="text-foreground">Awards 2026</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Join us for a live celebration of the impactful voices in veteran podcasting. 
            Streaming worldwide on October 5th, 2026.
          </p>

          <div className="mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CountdownTimer targetDate="2026-10-05T18:00:00" />
          </div>

          {/* Pre-Registration Form */}
          <div className="mb-10 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <PreRegistrationForm />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/categories">
              <Button variant="goldOutline" size="lg">
                <Award className="w-5 h-5" />
                View Categories
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">
                <Radio className="w-5 h-5" />
                Learn More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">20+</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">LIVE</p>
              <p className="text-sm text-muted-foreground">Streaming</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">Oct 5</p>
              <p className="text-sm text-muted-foreground">Save the Date</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
