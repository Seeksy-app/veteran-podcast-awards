import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Award, ChevronRight, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PreRegistrationForm } from "@/components/home/PreRegistrationForm";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

const CategoriesPage = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["public-award-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_categories")
        .select("id, slug, name, description, sort_order, award_programs(id, name, year, status)")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return (data ?? []).filter(
        (c: { award_programs?: { status?: string } | null }) => c.award_programs?.status === "active",
      );
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="2026 Award Categories"
        description="Browse official Veteran Podcast Awards categories, discover nominees, and vote for your favorite veteran podcasts."
        keywords="veteran podcast categories, military podcast awards, best veteran podcast, vote veteran podcast"
        canonicalUrl="/categories"
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive/50 rounded-full px-4 py-2 mb-4">
              <Video className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">Livestream Event • Oct 5, 2026</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">Award Categories</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore active categories for the Veteran Podcast Awards. Tap a category to see nominees and vote.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-16">
            <PreRegistrationForm />
          </div>

          <div className="mb-16">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Active categories
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !categories?.length ? (
              <p className="text-muted-foreground text-center py-12 border border-dashed border-border rounded-xl">
                No active award program categories are published yet. Check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 block text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center gap-1">
                          {category.name}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {category.description || "View nominees and cast your votes."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">Want to suggest a category? We&apos;d love to hear from you.</p>
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
