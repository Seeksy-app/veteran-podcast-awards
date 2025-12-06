import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight } from "lucide-react";

const categories = [
  "Best Overall Veteran Podcast 2025",
  "Best Army Veteran Podcast",
  "Best Navy Veteran Podcast",
  "Best Marine Corps Veteran Podcast",
  "Best Air Force Veteran Podcast",
  "Best Coast Guard Veteran Podcast",
  "Best Space Force Veteran Podcast",
  "Best VSO Podcast",
  "Best MilVet Advocate Podcast",
  "Best Spouse Podcast",
  "Best Military Transition Podcast",
  "Best Business/Entrepreneur Podcast",
];

export const CategoriesPreview = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Award Categories</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gold-gradient">25+ Categories</span>
            <span className="text-foreground"> to Honor Excellence</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From branch-specific awards to content-focused recognition, we celebrate
            veteran podcasters across every dimension of their craft.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {categories.map((category, index) => (
            <div
              key={category}
              className="group flex items-center gap-3 bg-background border border-border rounded-lg p-4 hover:border-primary hover:glow-gold-sm transition-all duration-300 cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {category}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/categories">
            <Button variant="goldOutline" size="lg">
              View All Categories
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
