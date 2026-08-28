import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { usePodchaserSearch, type PodchaserPodcast } from "@/hooks/usePodchaserSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/vpa-logo.png";
import heroBg from "@/assets/hero-bg.jpg";
import {
  Mic,
  Rss,
  Search,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  DollarSign,
  Globe,
  Shield,
  Trophy,
} from "lucide-react";

const TOTAL_STEPS = 4;

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

const MILITARY_BRANCHES = [
  "Army",
  "Navy",
  "Marine Corps",
  "Air Force",
  "Coast Guard",
  "Space Force",
  "National Guard",
];

const MILITARY_AFFILIATIONS = [
  { id: "veteran", label: "Veteran" },
  { id: "active_duty", label: "Active Duty" },
  { id: "spouse", label: "Military Spouse" },
  { id: "supporter", label: "Military Supporter" },
  { id: "other", label: "Other" },
];

const STEP_PANELS = [
  { emoji: "\u{1F3A4}", heading: "Let's set up your podcast", sub: "We'll get your show connected in just a few steps." },
  { emoji: "\u{1F1FA}\u{1F1F8}", heading: "Tell us about your service", sub: "Honoring those who serve and support the military community." },
  { emoji: "\u{1F4E1}", heading: "Where does your show live?", sub: "Help us understand your hosting and distribution." },
  { emoji: "\u{1F3C6}", heading: "Choose your categories", sub: "Select up to 3 award categories for the 2026 Veteran Podcast Awards." },
];

interface AwardCategory {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

const OnboardingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Podcast Info
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<PodchaserPodcast | null>(null);
  const [localResults, setLocalResults] = useState<{ id: string; title: string; author: string | null; image_url: string | null; rss_url: string }[]>([]);
  const [podcastName, setPodcastName] = useState("");
  const [podcastRss, setPodcastRss] = useState("");
  const [podcastImageUrl, setPodcastImageUrl] = useState("");
  const [podchaserId, setPodchaserId] = useState<number | null>(null);
  const [selectedLocalPodcastId, setSelectedLocalPodcastId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Step 2: Military Info
  const [militaryBranch, setMilitaryBranch] = useState("");
  const [militaryAffiliation, setMilitaryAffiliation] = useState("");

  // Step 3: Hosting & Distribution
  const [hostingPlatform, setHostingPlatform] = useState("");
  const [distributionPlatforms, setDistributionPlatforms] = useState<string[]>([]);

  // Step 4: Categories + Sponsorship
  const [categories, setCategories] = useState<AwardCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hasAgency, setHasAgency] = useState<boolean | null>(null);
  const [interestedInOpportunities, setInterestedInOpportunities] = useState<boolean | null>(null);

  const { setTheme } = useTheme();

  useEffect(() => {
    const prev = (localStorage.getItem("vpa-theme") || "dark") as "light" | "dark" | "system";
    setTheme("light");
    return () => { setTheme(prev); };
  }, []);

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isFetching: isSearching } = usePodchaserSearch(debouncedQuery, 1, true);

  // Search local podcasts table in parallel
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setLocalResults([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("podcasts")
        .select("id, title, author, image_url, rss_url")
        .ilike("title", `%${debouncedQuery}%`)
        .eq("is_active", true)
        .limit(5);
      if (data) setLocalResults(data);
    })();
  }, [debouncedQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectPodcast = (podcast: PodchaserPodcast) => {
    setSelectedPodcast(podcast);
    setPodcastName(podcast.title);
    setPodcastRss(podcast.rssUrl || "");
    setPodcastImageUrl(podcast.imageUrl || "");
    setPodchaserId(podcast.id);
    setSelectedLocalPodcastId(null);
    setSearchQuery(podcast.title);
    setShowDropdown(false);
  };

  const handleSelectLocalPodcast = (podcast: { id: string; title: string; author: string | null; image_url: string | null; rss_url: string }) => {
    setSelectedPodcast(null);
    setPodcastName(podcast.title);
    setPodcastRss(podcast.rss_url);
    setPodcastImageUrl(podcast.image_url || "");
    setPodchaserId(null);
    setSelectedLocalPodcastId(podcast.id);
    setSearchQuery(podcast.title);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedPodcast(null);
    setSelectedLocalPodcastId(null);
    setPodcastName("");
    setPodcastRss("");
    setPodcastImageUrl("");
    setPodchaserId(null);
    setSearchQuery("");
  };

  const [isFetchingRss, setIsFetchingRss] = useState(false);

  const fetchRssDetails = async (url: string) => {
    if (!url.match(/^https?:\/\/[^\s]+\.[^\s]+/)) return;
    setIsFetchingRss(true);
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      const title = doc.querySelector("channel > title")?.textContent?.trim();
      const image =
        doc.querySelector("channel > itunes\\:image")?.getAttribute("href") ||
        doc.querySelector("channel > image > url")?.textContent?.trim();
      if (title) {
        setPodcastName(title);
        setSearchQuery(title);
      }
      if (image) setPodcastImageUrl(image);
      if (title || image) {
        setPodcastRss(url);
        setSelectedPodcast(null);
        setSelectedLocalPodcastId(null);
        setPodchaserId(null);
        setShowDropdown(false);
        toast.success("Podcast details pulled from RSS feed!");
      }
    } catch {
      // silently fail — user can still enter manually
    } finally {
      setIsFetchingRss(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("award_categories")
      .select("id, name, description, slug, award_programs!inner(status)")
      .eq("award_programs.status", "active")
      .order("sort_order")
      .order("name");
    if (data) {
      setCategories(data.map((c: any) => ({ id: c.id, name: c.name, description: c.description, slug: c.slug })));
    }
  };

  const toggleDistribution = (id: string) => {
    setDistributionPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3) {
        toast.error("You can select up to 3 categories.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSkip = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      if (error) console.error("Skip onboarding DB error:", error);
    } catch (err) {
      console.error("Skip onboarding error:", err);
    } finally {
      setIsSaving(false);
    }
    // Always mark done in localStorage so Dashboard never loops even if DB lags
    localStorage.setItem("vpa-onboarding-done", user.id);
    navigate("/dashboard", { replace: true });
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
          podcast_image_url: podcastImageUrl || null,
          podchaser_id: podchaserId,
          military_branch: militaryBranch || null,
          military_affiliation: militaryAffiliation || null,
          hosting_platform: hostingPlatform || null,
          distribution_platforms: distributionPlatforms,
          selected_categories: selectedCategories,
          has_ad_agency: hasAgency,
          interested_in_opportunities: interestedInOpportunities,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      localStorage.setItem("vpa-onboarding-done", user.id);
      navigate("/dashboard?welcome=1", { replace: true });
    } catch (err) {
      console.error("Onboarding save error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return podcastName.trim().length > 0 || podcastRss.trim().length > 0;
    if (step === 1) return militaryAffiliation.length > 0;
    if (step === 2) return hostingPlatform.length > 0;
    if (step === 3) return true;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  const stepInfo = STEP_PANELS[step];

  return (
    <div className="min-h-screen flex">
      {/* ─── Left: Form ─── */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-8 bg-white">
        <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <a href="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="VPA" className="h-10 w-10" />
              <span className="font-serif text-lg font-bold text-amber-600">Veteran Podcast Awards</span>
            </a>
            <button onClick={handleSkip} disabled={isSaving} className="text-sm text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50">
              {isSaving ? "Saving..." : "Skip for now"}
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-amber-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step label */}
          <p className="text-sm text-amber-600 font-medium mb-2">
            Step {step + 1} of {TOTAL_STEPS}
          </p>

          {/* ─── Step 1: Podcast Info ─── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">
                  Find your podcast
                </h1>
                <p className="text-slate-500">
                  Search for your podcast by name, or add your RSS feed below.
                </p>
              </div>

              {/* Selected podcast card — confirm it matches before continuing */}
              {(selectedPodcast || selectedLocalPodcastId || (podcastRss.trim() && podcastName.trim())) ? (
                <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-3 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Confirm this is your show
                  </p>
                  <div className="flex items-center gap-4">
                    {podcastImageUrl && (
                      <img
                        src={podcastImageUrl}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{podcastName}</p>
                      {podcastRss && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{podcastRss}</p>
                      )}
                      {selectedLocalPodcastId && (
                        <p className="text-xs text-amber-600 mt-0.5">Already in our directory</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-sm text-amber-600 hover:underline flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Check that the artwork and title match the podcast you want to register. If not, click Change.
                  </p>
                </div>
              ) : (
                <>
                  {/* Search input with dropdown */}
                  <div className="space-y-2" ref={dropdownRef}>
                    <Label htmlFor="podcastSearch">Search by podcast name</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                      )}
                      <Input
                        id="podcastSearch"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPodcastName(e.target.value);
                          setShowDropdown(true);
                        }}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text");
                          if (pasted.match(/^https?:\/\//)) {
                            e.preventDefault();
                            setPodcastRss(pasted);
                            setSearchQuery(pasted);
                            fetchRssDetails(pasted);
                          }
                        }}
                        onFocus={() => {
                          if (searchQuery.length >= 2) setShowDropdown(true);
                        }}
                        placeholder="Start typing your podcast name or paste an RSS URL..."
                        className="pl-10 h-12"
                        autoComplete="off"
                      />

                      {/* Dropdown */}
                      {showDropdown && debouncedQuery.length >= 2 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[320px] overflow-y-auto">
                          {/* Local directory results first */}
                          {localResults.length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-amber-50 border-b border-slate-100">
                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Our Directory</p>
                              </div>
                              {localResults.map((podcast) => (
                                <button
                                  key={`local-${podcast.id}`}
                                  type="button"
                                  onClick={() => handleSelectLocalPodcast(podcast)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
                                >
                                  {podcast.image_url ? (
                                    <img src={podcast.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                      <Mic className="w-5 h-5 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{podcast.title}</p>
                                    {podcast.author && (
                                      <p className="text-xs text-slate-500 truncate">{podcast.author}</p>
                                    )}
                                  </div>
                                  <span className="text-xs text-amber-600 flex-shrink-0">VPA</span>
                                </button>
                              ))}
                            </>
                          )}

                          {/* Podchaser results */}
                          {searchResults?.data && searchResults.data.length > 0 && (
                            <>
                              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">More from Podchaser</p>
                              </div>
                              {searchResults.data.map((podcast) => (
                                <button
                                  key={`pc-${podcast.id}`}
                                  type="button"
                                  onClick={() => handleSelectPodcast(podcast)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                >
                                  {podcast.imageUrl ? (
                                    <img src={podcast.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                      <Mic className="w-5 h-5 text-slate-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{podcast.title}</p>
                                    {podcast.author?.name && (
                                      <p className="text-xs text-slate-500 truncate">{podcast.author.name}</p>
                                    )}
                                  </div>
                                  {podcast.numberOfEpisodes > 0 && (
                                    <span className="text-xs text-slate-400 flex-shrink-0">{podcast.numberOfEpisodes} eps</span>
                                  )}
                                </button>
                              ))}
                            </>
                          )}

                          {/* No results at all */}
                          {localResults.length === 0 && (!searchResults?.data || searchResults.data.length === 0) && !isSearching && (
                            <div className="px-4 py-6 text-center">
                              <p className="text-sm text-slate-500">
                                No podcasts found for "{debouncedQuery}"
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                You can enter your RSS feed below instead.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400">or enter your RSS feed</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="podcastRss">RSS Feed URL</Label>
                    <div className="relative">
                      <Rss className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      {isFetchingRss && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 animate-spin" />
                      )}
                      <Input
                        id="podcastRss"
                        value={podcastRss}
                        onChange={(e) => setPodcastRss(e.target.value)}
                        onPaste={(e) => {
                          const pasted = e.clipboardData.getData("text");
                          if (pasted.match(/^https?:\/\//)) {
                            e.preventDefault();
                            setPodcastRss(pasted);
                            fetchRssDetails(pasted);
                          }
                        }}
                        placeholder="https://feeds.example.com/your-podcast"
                        className="pl-10 h-12"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Can't find your show? Paste your RSS feed and we'll pull in your podcast name and artwork automatically.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── Step 2: Military Info ─── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">
                  About You
                </h1>
                <p className="text-slate-500">
                  Help us understand your connection to the military community.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliation">Military Affiliation *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MILITARY_AFFILIATIONS.map((a) => {
                    const selected = militaryAffiliation === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setMilitaryAffiliation(a.id)}
                        className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-left text-sm transition-all ${
                          selected
                            ? "border-amber-500 bg-amber-50 text-amber-700 font-medium"
                            : "border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900"
                        }`}
                      >
                        <Shield className={`w-4 h-4 flex-shrink-0 ${selected ? "text-amber-700" : "text-slate-400"}`} />
                        {a.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {militaryAffiliation && militaryAffiliation !== "supporter" && militaryAffiliation !== "other" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Label htmlFor="branch">Branch of Service</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <select
                      id="branch"
                      value={militaryBranch}
                      onChange={(e) => setMilitaryBranch(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                    >
                      <option value="">Select your branch</option>
                      {MILITARY_BRANCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Step 3: Hosting & Distribution ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">
                  Hosting &amp; Distribution
                </h1>
                <p className="text-slate-500">
                  Where do you host your podcast and where is it available?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hosting">Where do you currently host? *</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <select
                    id="hosting"
                    value={hostingPlatform}
                    onChange={(e) => setHostingPlatform(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-md border border-slate-200 bg-white text-slate-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
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
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                            selected ? "bg-amber-500 border-amber-500" : "border-slate-300"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 4: Categories + Sponsorship ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-3xl font-bold text-slate-900 mb-2">
                  Awards &amp; Opportunities
                </h1>
                <p className="text-slate-500">
                  Choose up to 3 categories for the 2026 awards and tell us about sponsorship.
                </p>
              </div>

              {categories.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Award Categories (up to 3)</Label>
                    <span className="text-xs text-slate-500">
                      {selectedCategories.length}/3 selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
                    {categories.map((cat) => {
                      const selected = selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all ${
                            selected
                              ? "border-amber-500 bg-amber-50"
                              : "border-slate-200 hover:border-amber-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                              selected ? "bg-amber-500 border-amber-500" : "border-slate-300"
                            }`}
                          >
                            {selected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${selected ? "text-amber-700" : "text-slate-900"}`}>
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p className="text-xs text-slate-500 truncate">{cat.description}</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-5 space-y-3">
                <Label>Are you currently using an agency for advertising or sponsorships?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHasAgency(true)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      hasAgency === true
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900"
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium text-sm">Yes, I have an agency</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasAgency(false)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      hasAgency === false
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    <span className="font-medium text-sm">No, I handle it myself</span>
                  </button>
                </div>
              </div>

              {hasAgency !== null && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Label>
                    Interested in sponsorship and advertising opportunities through VPA?
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInterestedInOpportunities(true)}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                        interestedInOpportunities === true
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900"
                      }`}
                    >
                      Yes, I'm interested
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterestedInOpportunities(false)}
                      className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                        interestedInOpportunities === false
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-600 hover:border-amber-300 hover:text-slate-900"
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
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < TOTAL_STEPS - 1 ? (
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
                {!isSaving && <Trophy className="w-4 h-4" />}
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
