import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight, Clock } from "lucide-react";

const previewCategories = [
  "Best Overall Veteran Podcast",
  "Best Army Veteran Podcast",
  "Best Navy Veteran Podcast",
  "Best Marine Corps Veteran Podcast",
  "Best Air Force Veteran Podcast",
  "Best Military Transition Podcast",
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
            <span className="text-gold-gradient">Categories</span>
            <span className="text-foreground"> Coming Soon</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're finalizing the official category list for 2026. Here's a preview of 
            some categories we're planning. Sign up to be notified when the full list is announced.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {previewCategories.map((category, index) => (
            <div
              key={category}
              className="group flex items-center gap-3 bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {category}
              </span>
            </div>
          ))}
          
          {/* Coming Soon Card */}
          <div className="flex items-center gap-3 bg-secondary/30 border border-dashed border-border rounded-lg p-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              More categories coming soon...
            </span>
          </div>
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
