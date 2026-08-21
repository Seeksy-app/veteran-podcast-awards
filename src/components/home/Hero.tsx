import { Award } from "lucide-react";
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
        className={`absolute inset-0 bg-background transition-opacity duration-1000 ${
          videoLoaded && !videoError ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-8 animate-slide-up leading-tight">
            <span className="text-gold-gradient">Veteran Podcast</span>
            <br />
            <span className="text-foreground">Awards 2026</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 animate-slide-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Celebrating the impactful voices of veteran podcasters.
            Register your podcast or sign up to vote.
          </p>

          <div className="mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CountdownTimer targetDate="2026-11-11T18:00:00" />
          </div>

          <div className="mb-10 w-full max-w-lg animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <PreRegistrationForm />
          </div>

          <div className="flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-5 py-2.5">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                National Military Podcast Day, October 5th
              </span>
            </div>
            <p className="text-sm text-muted-foreground/70">Live streaming event</p>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">Oct 5</p>
              <p className="text-sm text-muted-foreground">Voting Day</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">LIVE</p>
              <p className="text-sm text-muted-foreground">Streaming</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-primary font-bold">Nov 11</p>
              <p className="text-sm text-muted-foreground">Awards Show</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
