import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Award, ChevronRight, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PreRegistrationForm } from "@/components/home/PreRegistrationForm";
import { SEO } from "@/components/SEO";

const confirmedCategories = [
  {
    title: "Best Overall Veteran Podcast",
    description: "Recognizing excellence across all aspects of veteran podcasting.",
  },
  {
    title: "Best Army Veteran Podcast",
    description: "Celebrating podcasts by Army veterans.",
  },
  {
    title: "Best Navy Veteran Podcast",
    description: "Celebrating Navy veteran podcasters.",
  },
  {
    title: "Best Marine Corps Veteran Podcast",
    description: "Honoring podcasts by Marine Corps veterans.",
  },
  {
    title: "Best Air Force Veteran Podcast",
    description: "Honoring outstanding podcasts by Air Force veterans.",
  },
  {
    title: "Best Coast Guard Veteran Podcast",
    description: "Recognizing Coast Guard veteran podcasters.",
  },
  {
    title: "Best Space Force Veteran Podcast",
    description: "Recognizing Space Force veteran content creators.",
  },
  {
    title: "Best Military Transition Podcast",
    description: "Honoring podcasts focused on military-to-civilian transition.",
  },
];

const plannedCategories = [
  "Best VSO Podcast",
  "Best MilVet Advocate Podcast",
  "Best Spouse Podcast",
  "Best Business/Entrepreneur Podcast",
  "Best Lifestyle/Family Podcast",
  "Best Health and Wellness Podcast",
  "Best Motivational Podcast",
  "Best History Podcast",
  "Best Current Events Podcast",
  "Best Guest Interview on a Podcast",
];

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="2026 Award Categories"
        description="Browse the official Veteran Podcast Awards categories for 2026. Awards for Best Overall, Army, Navy, Marine Corps, Air Force, Coast Guard, Space Force veteran podcasts and more."
        keywords="veteran podcast categories, military podcast awards, best veteran podcast, army podcast, navy podcast, marine corps podcast"
        canonicalUrl="/categories"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive/50 rounded-full px-4 py-2 mb-4">
              <Video className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">Livestream Event • Oct 5, 2026</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">2026 Categories</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're finalizing the official category list for the 2026 Veteran Podcast Awards.
              Sign up to be notified when the full list is announced and registration opens.
            </p>
          </div>

          {/* Pre-registration CTA */}
          <div className="max-w-md mx-auto mb-16">
            <PreRegistrationForm />
          </div>

          {/* Confirmed Categories */}
          <div className="mb-16">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Confirmed Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {confirmedCategories.map((category) => (
                <div
                  key={category.title}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Categories */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-muted-foreground" />
              Additional Categories (Coming Soon)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plannedCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-3 bg-card/50 border border-dashed border-border rounded-lg p-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Want to suggest a category? We'd love to hear from you.
            </p>
            <Link to="/about">
              <Button variant="goldOutline">
                Contact Us
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
