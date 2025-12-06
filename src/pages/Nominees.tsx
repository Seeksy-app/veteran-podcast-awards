import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { NomineeCard } from "@/components/nominees/NomineeCard";
import { Button } from "@/components/ui/button";
import { Award, Search, Filter } from "lucide-react";

const categories = [
  "All Categories",
  "Best Overall",
  "Best Army",
  "Best Navy",
  "Best USMC",
  "Best Air Force",
  "Best Coast Guard",
  "Best Space Force",
  "Best VSO",
  "Best Spouse",
  "Best Business",
  "Best Transition",
];

const allNominees = [
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
    category: "Best Spouse",
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
  {
    name: "James Anderson",
    podcastName: "Navy Veteran Network",
    category: "Best Navy",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
    description: "Connecting Navy veterans worldwide with stories of service and success.",
    episodeCount: 112,
    voteCount: 223,
  },
  {
    name: "Emily Chen",
    podcastName: "Air Force Forward",
    category: "Best Air Force",
    imageUrl: "https://images.unsplash.com/photo-1559523182-a284c3fb7cff?w=400&h=400&fit=crop",
    description: "Exploring the experiences of Air Force veterans in civilian life.",
    episodeCount: 67,
    voteCount: 189,
  },
  {
    name: "Michael Brooks",
    podcastName: "Army Strong Stories",
    category: "Best Army",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
    description: "Celebrating the strength and resilience of Army veterans everywhere.",
    episodeCount: 145,
    voteCount: 312,
  },
  {
    name: "Lisa Martinez",
    podcastName: "Transition Tales",
    category: "Best Transition",
    imageUrl: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=400&h=400&fit=crop",
    description: "Guiding veterans through the journey from military to civilian careers.",
    episodeCount: 93,
    voteCount: 178,
  },
];

const NomineesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNominees = allNominees.filter((nominee) => {
    const matchesCategory =
      selectedCategory === "All Categories" || nominee.category === selectedCategory;
    const matchesSearch =
      nominee.podcastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nominee.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">2025 Nominees</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gold-gradient">Nominees</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse all the amazing veteran podcasts nominated for the 2025 awards.
              Vote for your favorites!
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "gold" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filteredNominees.length} nominees
          </p>

          {/* Nominees Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNominees.map((nominee) => (
              <NomineeCard
                key={nominee.podcastName}
                {...nominee}
                onVote={() => console.log(`Voted for ${nominee.podcastName}`)}
                onPlay={() => console.log(`Playing ${nominee.podcastName}`)}
              />
            ))}
          </div>

          {filteredNominees.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No nominees found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NomineesPage;
