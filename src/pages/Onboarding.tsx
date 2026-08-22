import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/vpa-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import {
  Mic,
  Rss,
  Radio,
  ChevronRight,
  ChevronLeft,
  Check,
  DollarSign,
  Globe,
} from "lucide-react";

const HOSTING_PLATFORMS = [
  "Buzzsprout",
  "Libsyn",
  "Podbean",
  "Spotify for Podcasters (Anchor)",
  "Transistor",
  "Captivate",
  "RSS.com",
  "Spreaker",
  "Blubrry",
  "Simplecast",
  "Megaphone",
  "Acast",
  "RedCircle",
  "Castos",
  "iHeartRadio",
  "SoundCloud",
  "Audioboom",
  "Podomatic",
  "Other",
];

const DISTRIBUTION_PLATFORMS = [
  { id: "apple", label: "Apple Podcasts" },
  { id: "spotify", label: "Spotify" },
  { id: "youtube", label: "YouTube / YouTube Music" },
  { id: "amazon", label: "Amazon Music / Audible" },
  { id: "iheart", label: "iHeartRadio" },
  { id: "pandora", label: "Pandora" },
  { id: "deezer", label: "Deezer" },
  { id: "tunein", label: "TuneIn" },
  { id: "overcast", label: "Overcast" },
  { id: "pocketcasts", label: "Pocket Casts" },
  { id: "podchaser", label: "Podchaser" },
  { id: "castbox", label: "Castbox" },
  { id: "podcastaddict", label: "Podcast Addict" },
  { id: "other", label: "Other" },
];

const STEP_IMAGES = [
  { emoji: "🎙️", heading: "Let's set up your podcast", sub: "We'll get your show connected in just a few steps." },
  { emoji: "📡", heading: "Where does your show live?", sub: "Help us understand your hosting and distribution." },
  { emoji: "💰", heading: "Let's talk opportunities", sub: "We connect podcasters with sponsors who value the military community." },
];

const OnboardingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1
  const [podcastName, setPodcastName] = useState("");
  const [podcastRss, setPodcastRss] = useState("");

  // Step 2
  const [hostingPlatform, setHostingPlatform] = useState("");
  const [distributionPlatforms, setDistributionPlatforms] = useState<string[]>([]);

  // Step 3
  const [hasAgency, setHasAgency] = useState<boolean | null>(null);
  const [interestedInOpportunities, setInterestedInOpportunities] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata;
      if (meta?.user_type !== "podcaster") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const toggleDistribution = (id: string) => {
    setDistributionPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          podcast_name: podcastName || null,
          podcast_rss: podcastRss || null,
          hosting_platform: hostingPlatform || null,
          distribution_platforms: distributionPlatforms,
          has_ad_agency: hasAgency,
          interested_in_opportunities: interestedInOpportunities,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("You're all set! Welcome to VPA.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding save error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return podcastName.trim().length > 0;
    if (step === 1) return hostingPlatform.length > 0;
    if (step === 2) return hasAgency !== null;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const stepInfo = STEP_IMAGES[step];

  return (
    <div className="min-h-screen flex">
      {/* ─── Left: Form ─── */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-8 bg-background">
        <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <a href="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="VPA" className="h-10 w-10" />
              <span className="font-serif text-lg font-bold text-primary">Veteran Podcast Awards</span>
            </a>
            <button
              onClick={() => {
                navigate("/dashboard");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Step label */}
          <p className="text-sm text-primary font-medium mb-2">
            Step {step + 1} of 3
          </p>

          {/* ─── Step 1: Podcast Info ─── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Tell us about your podcast
                </h1>
                <p className="text-muted-foreground">
                  We'll use this to set up your profile and connect your show.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="podcastName">Podcast Name *</Label>
                <div className="relative">
                  <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="podcastName"
                    value={podcastName}
                    onChange={(e) => setPodcastName(e.target.value)}
                    placeholder="e.g. The Veteran's Voice"
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="podcastRss">RSS Feed URL (optional)</Label>
                <div className="relative">
                  <Rss className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="podcastRss"
                    value={podcastRss}
                    onChange={(e) => setPodcastRss(e.target.value)}
                    placeholder="https://feeds.example.com/your-podcast"
                    className="pl-10 h-12"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll use your RSS to pull in your podcast artwork and episode list.
                </p>
              </div>
            </div>
          )}

          {/* ─── Step 2: Hosting & Distribution ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Hosting &amp; Distribution
                </h1>
                <p className="text-muted-foreground">
                  Where do you host your podcast and where is it available?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hosting">Where do you currently host? *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <select
                    id="hosting"
                    value={hostingPlatform}
                    onChange={(e) => setHostingPlatform(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="">Select your hosting platform</option>
                    {HOSTING_PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Where is your podcast distributed? (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {DISTRIBUTION_PLATFORMS.map((p) => {
                    const selected = distributionPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleDistribution(p.id)}
                        className={`flex items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                            selected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Monetization ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Sponsorships &amp; Advertising
                </h1>
                <p className="text-muted-foreground">
                  VPA connects podcasters with sponsors who support the military community.
                </p>
              </div>

              <div className="space-y-3">
                <Label>Are you currently using an agency for advertising or sponsorships?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHasAgency(true)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-5 transition-all ${
                      hasAgency === true
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="font-medium">Yes</span>
                    <span className="text-xs text-center">I have an agency</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasAgency(false)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-5 transition-all ${
                      hasAgency === false
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <Mic className="w-6 h-6" />
                    <span className="font-medium">No</span>
                    <span className="text-xs text-center">I handle it myself</span>
                  </button>
                </div>
              </div>

              {hasAgency !== null && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Label>
                    Would you be interested in additional sponsorship and advertising opportunities through VPA?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInterestedInOpportunities(true)}
                      className={`rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                        interestedInOpportunities === true
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      Yes, I'm interested
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestedInOpportunities(false)}
                      className={`rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                        interestedInOpportunities === false
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      Not right now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Navigation ─── */}
          <div className="flex items-center justify-between mt-auto pt-10">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button
                variant="gold"
                onClick={() => setStep(step + 1)}
                disabled={!canAdvance()}
                className="gap-2 h-12 px-8"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="gold"
                onClick={handleComplete}
                disabled={isSaving || !canAdvance()}
                className="gap-2 h-12 px-8"
              >
                {isSaving ? "Saving..." : "Complete Setup"}
                {!isSaving && <Check className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Right: Image + Context ─── */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12">
          <div className="max-w-md">
            <div className="text-6xl mb-6">{stepInfo.emoji}</div>
            <h2 className="font-serif text-3xl text-white font-bold mb-4">
              {stepInfo.heading}
            </h2>
            <p className="text-white/70 text-lg">
              {stepInfo.sub}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
