import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, Radio } from "lucide-react";
import logo from "@/assets/vpa-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import { CountdownTimer } from "./CountdownTimer";
import { PreRegistrationForm } from "./PreRegistrationForm";
import { useState } from "react";

const VIDEO_URL = "https://snhrqbtwahgarxxbizsz.supabase.co/storage/v1/object/public/videos/hero-video.mp4";

export const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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

      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          videoLoaded && !videoError ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${heroBg})` }}
      />

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
            Celebrating the impactful voices of veteran podcasters. 
            Join us for the live ceremony on October 5th, 2026.
          </p>

          <div className="mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CountdownTimer targetDate="2026-10-05T18:00:00" />
          </div>

          <div className="mb-10 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <PreRegistrationForm />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/livestream">
              <Button variant="gold" size="lg">
                <Radio className="w-5 h-5" />
                Watch Live
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="goldOutline" size="lg">
                <Award className="w-5 h-5" />
                View Categories
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
