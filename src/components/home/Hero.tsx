import { ArrowRight, Radio } from "lucide-react";
import { Link } from "react-router-dom";
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
        className={`absolute inset-0 bg-background transition-opacity duration-1000 ${
          videoLoaded && !videoError ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-slide-up leading-tight">
            <span className="text-gold-gradient">Veteran Podcast</span>
            <br />
            <span className="text-foreground">Awards 2026</span>
          </h1>

          <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex flex-col items-center bg-secondary/60 border border-primary/30 rounded-2xl px-10 py-5">
              <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-muted-foreground mb-1.5">Awards Show</p>
              <p className="font-serif text-3xl md:text-4xl font-bold text-gold-gradient">Coming in Q1 2027</p>
            </div>
          </div>

          <div className="mb-10 w-full animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/40 rounded-full px-4 py-1.5 mb-4">
              <Radio className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Live Streaming Event
              </span>
            </div>
            <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-gold-gradient leading-tight">
              24 Hour Podcastathon
            </h2>
            <p className="font-serif text-2xl md:text-3xl text-foreground mt-2">
              October 5th, 2026
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
              Twenty-four straight hours of live veteran podcasting on National Military Podcast Day.
              Back-to-back shows, special guests, and stories from the community, streaming around the clock.
            </p>
            <Link
              to="/podcast-day"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:text-gold-light transition-colors"
            >
              Learn about National Military Podcast Day
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="w-full max-w-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <PreRegistrationForm />
          </div>

        </div>
      </div>
    </section>
  );
};
