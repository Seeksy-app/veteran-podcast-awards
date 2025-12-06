import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Award, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const allCategories = [
  {
    title: "Best Overall Veteran Podcast 2025",
    description: "Recognizing excellence across all aspects of veteran podcasting.",
    nomineeCount: 12,
  },
  {
    title: "Best VSO Podcast",
    description: "Honoring podcasts from Veteran Service Organizations.",
    nomineeCount: 8,
  },
  {
    title: "Best MilVet Advocate Podcast",
    description: "Celebrating podcasts advocating for military veterans.",
    nomineeCount: 10,
  },
  {
    title: "Best Spouse Podcast",
    description: "Recognizing podcasts by and for military spouses.",
    nomineeCount: 7,
  },
  {
    title: "Best Air Force Veteran Podcast",
    description: "Honoring outstanding podcasts by Air Force veterans.",
    nomineeCount: 9,
  },
  {
    title: "Best Army Veteran Podcast",
    description: "Celebrating podcasts by Army veterans.",
    nomineeCount: 15,
  },
  {
    title: "Best Coast Guard Veteran Podcast",
    description: "Recognizing Coast Guard veteran podcasters.",
    nomineeCount: 5,
  },
  {
    title: "Best Marine Corps Veteran Podcast",
    description: "Honoring podcasts by Marine Corps veterans.",
    nomineeCount: 11,
  },
  {
    title: "Best Navy Veteran Podcast",
    description: "Celebrating Navy veteran podcasters.",
    nomineeCount: 8,
  },
  {
    title: "Best Space Force Veteran Podcast",
    description: "Recognizing Space Force veteran content creators.",
    nomineeCount: 3,
  },
  {
    title: "Best Military Transition Podcast",
    description: "Honoring podcasts focused on military-to-civilian transition.",
    nomineeCount: 12,
  },
  {
    title: "Best Business/Entrepreneur Podcast",
    description: "Celebrating veteran entrepreneurs in podcasting.",
    nomineeCount: 14,
  },
  {
    title: "Best Lifestyle/Family Podcast",
    description: "Recognizing podcasts about veteran family life.",
    nomineeCount: 6,
  },
  {
    title: "Best Guest Interview on a Podcast",
    description: "Honoring exceptional guest appearances.",
    nomineeCount: 20,
  },
  {
    title: "Best Health and Wellness Podcast",
    description: "Celebrating podcasts focused on veteran health.",
    nomineeCount: 9,
  },
  {
    title: "Best Motivational Podcast",
    description: "Recognizing inspirational veteran content.",
    nomineeCount: 11,
  },
  {
    title: "Best History Podcast",
    description: "Honoring military history podcasts.",
    nomineeCount: 7,
  },
  {
    title: "Best Current Events Podcast",
    description: "Celebrating timely veteran perspectives.",
    nomineeCount: 8,
  },
];

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Award Categories</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">All Categories</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore all the award categories for the 2025 Veteran Podcast Awards.
              Each category celebrates a unique aspect of veteran podcasting.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCategories.map((category) => (
              <div
                key={category.title}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:glow-gold-sm transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{category.nomineeCount} Nominees</span>
                      </div>
                      <Link to="/nominees">
                        <Button variant="ghost" size="sm" className="group-hover:text-primary">
                          View
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;
