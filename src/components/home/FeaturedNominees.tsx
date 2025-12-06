import { NomineeCard } from "@/components/nominees/NomineeCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const featuredNominees = [
  {
    name: "John Mitchell",
    podcastName: "Veterans Voices",
    category: "Best Overall",
    imageUrl: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=400&fit=crop",
    description: "Weekly conversations with veterans sharing their transition stories and insights.",
    episodeCount: 156,
    voteCount: 342,
  },
  {
    name: "Sarah Thompson",
    podcastName: "Military Families United",
    category: "Best Spouse Podcast",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop",
    description: "Supporting military spouses through deployment, transition, and everyday life.",
    episodeCount: 89,
    voteCount: 287,
  },
  {
    name: "Marcus Williams",
    podcastName: "From Boots to Business",
    category: "Best Business",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop",
    description: "Helping veterans navigate the entrepreneurial journey after service.",
    episodeCount: 124,
    voteCount: 256,
  },
  {
    name: "David Rodriguez",
    podcastName: "Marine Stories",
    category: "Best USMC",
    imageUrl: "https://images.unsplash.com/photo-1487537023557-998d5db76e10?w=400&h=400&fit=crop",
    description: "Real stories from Marine Corps veterans, told in their own words.",
    episodeCount: 78,
    voteCount: 198,
  },
];

export const FeaturedNominees = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">Featured </span>
            <span className="text-gold-gradient">Nominees</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet some of the outstanding veteran podcasters competing for recognition this year.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {featuredNominees.map((nominee) => (
            <NomineeCard
              key={nominee.podcastName}
              {...nominee}
              onVote={() => console.log(`Voted for ${nominee.podcastName}`)}
              onPlay={() => console.log(`Playing ${nominee.podcastName}`)}
            />
          ))}
        </div>

        <div className="text-center">
          <Link to="/nominees">
            <Button variant="goldOutline" size="lg">
              View All Nominees
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
