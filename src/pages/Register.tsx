import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Mic, Link2, Upload, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";

const categories = [
  "Best Overall Veteran Podcast 2025",
  "Best VSO Podcast",
  "Best MilVet Advocate Podcast",
  "Best Spouse Podcast",
  "Best Air Force Veteran Podcast",
  "Best Army Veteran Podcast",
  "Best Coast Guard Veteran Podcast",
  "Best Marine Corps Veteran Podcast",
  "Best Navy Veteran Podcast",
  "Best Space Force Veteran Podcast",
  "Best Military Transition Podcast",
  "Best Business/Entrepreneur Podcast",
  "Best Lifestyle/Family Podcast",
  "Best Health and Wellness Podcast",
  "Best Motivational Podcast",
  "Best History Podcast",
  "Best Current Events Podcast",
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    podcastName: "",
    hostName: "",
    email: "",
    rssUrl: "",
    website: "",
    description: "",
    selectedCategories: [] as string[],
  });

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category].slice(0, 3),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registration submitted! We'll review your podcast and be in touch.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-4">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Podcast Registration</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gold-gradient">Register Your Podcast</span>
              </h1>
              <p className="text-muted-foreground">
                Submit your podcast for consideration in the 2025 Veteran Podcast Awards.
                Connect your RSS feed and we'll automatically pull your podcast details.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-primary" />
                  Podcast Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Podcast Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.podcastName}
                      onChange={(e) =>
                        setFormData({ ...formData, podcastName: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your Podcast Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Host Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hostName}
                      onChange={(e) =>
                        setFormData({ ...formData, hostName: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="w-full h-11 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://yourpodcast.com"
                    />
                  </div>
                </div>
              </div>

              {/* RSS Feed */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  Connect Your RSS Feed
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll use your RSS feed to automatically pull your podcast artwork,
                  episodes, and description.
                </p>
                <div className="flex gap-3">
                  <input
                    type="url"
                    required
                    value={formData.rssUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, rssUrl: e.target.value })
                    }
                    className="flex-1 h-11 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://feeds.example.com/your-podcast"
                  />
                  <Button type="button" variant="goldOutline">
                    <Upload className="w-4 h-4" />
                    Fetch
                  </Button>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                  Select Categories
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose up to 3 categories that best describe your podcast.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((category) => {
                    const isSelected = formData.selectedCategories.includes(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm">{category}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  {formData.selectedCategories.length}/3 categories selected
                </p>
              </div>

              {/* Description */}
              <div className="bg-card border border-border rounded-xl p-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Why should your podcast win? (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell us about your podcast and its impact on the veteran community..."
                />
              </div>

              {/* Submit */}
              <div className="text-center">
                <Button type="submit" variant="hero" size="xl">
                  Submit Registration
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  By submitting, you agree to our terms and conditions.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
