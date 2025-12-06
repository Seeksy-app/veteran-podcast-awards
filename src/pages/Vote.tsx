import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Vote, Award, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const votingCategories = [
  {
    id: "best-overall",
    title: "Best Overall Veteran Podcast 2025",
    nominees: [
      { id: "1", name: "Veterans Voices", host: "John Mitchell", votes: 342 },
      { id: "2", name: "Military Mindset", host: "Sarah Johnson", votes: 289 },
      { id: "3", name: "Service & Beyond", host: "Mike Rodriguez", votes: 267 },
      { id: "4", name: "Veteran Nation", host: "David Kim", votes: 234 },
    ],
  },
  {
    id: "best-army",
    title: "Best Army Veteran Podcast",
    nominees: [
      { id: "5", name: "Army Strong Stories", host: "Michael Brooks", votes: 312 },
      { id: "6", name: "Hooah Nation", host: "James Wilson", votes: 245 },
      { id: "7", name: "Army Life After", host: "Chris Taylor", votes: 198 },
    ],
  },
  {
    id: "best-navy",
    title: "Best Navy Veteran Podcast",
    nominees: [
      { id: "8", name: "Navy Veteran Network", host: "James Anderson", votes: 223 },
      { id: "9", name: "Anchors Away Pod", host: "Steve Martinez", votes: 189 },
      { id: "10", name: "Fleet Stories", host: "Tony Lopez", votes: 156 },
    ],
  },
];

const VotePage = () => {
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [votesRemaining] = useState(5); // Admin controlled

  const handleVote = (categoryId: string, nomineeId: string) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [categoryId]: nomineeId,
    }));
  };

  const handleSubmitVotes = () => {
    if (Object.keys(selectedVotes).length === 0) {
      toast.error("Please select at least one nominee to vote for.");
      return;
    }
    toast.success(`Your ${Object.keys(selectedVotes).length} vote(s) have been recorded!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-4">
                <Vote className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Public Voting</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                <span className="text-gold-gradient">Vote for Your Favorites</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                Support your favorite veteran podcasts by casting your votes.
                You can vote for one nominee per category.
              </p>
              <div className="inline-flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
                <span className="text-sm text-muted-foreground">Votes remaining:</span>
                <span className="font-bold text-primary">{votesRemaining}</span>
              </div>
            </div>

            {/* Voting Categories */}
            <div className="space-y-8">
              {votingCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <div className="bg-secondary/30 px-6 py-4 border-b border-border">
                    <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      {category.title}
                    </h2>
                  </div>
                  <div className="p-6 space-y-3">
                    {category.nominees.map((nominee) => {
                      const isSelected = selectedVotes[category.id] === nominee.id;
                      return (
                        <button
                          key={nominee.id}
                          onClick={() => handleVote(category.id, nominee.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4 text-primary-foreground" />
                              )}
                            </div>
                            <div className="text-left">
                              <p
                                className={`font-medium ${
                                  isSelected ? "text-primary" : "text-foreground"
                                }`}
                              >
                                {nominee.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                by {nominee.host}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-primary font-medium">
                              {nominee.votes} votes
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="mt-10 text-center">
              <Button variant="hero" size="xl" onClick={handleSubmitVotes}>
                Submit Your Votes
                <ChevronRight className="w-5 h-5" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                You can change your votes until voting closes on October 1st, 2025.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VotePage;
