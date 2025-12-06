import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { parseRSSFeed } from "@/hooks/usePodcasts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, RefreshCw, Rss, ExternalLink, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface Podcast {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  rss_url: string;
  website_url: string | null;
  author: string | null;
  is_active: boolean;
  display_order: number;
  last_fetched_at: string | null;
}

export const PodcastManager = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [newRssUrl, setNewRssUrl] = useState("");
  const [bulkRssUrls, setBulkRssUrls] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: podcasts, isLoading: loadingPodcasts } = useQuery({
    queryKey: ["admin-podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("id, title, description, image_url, rss_url, website_url, author, is_active, display_order, last_fetched_at")
        .order("display_order");
      if (error) throw error;
      return data as Podcast[];
    },
  });

  const addPodcast = useMutation({
    mutationFn: async (rssUrl: string) => {
      // Check for duplicate RSS URL
      const { data: existing } = await supabase
        .from("podcasts")
        .select("id, title")
        .eq("rss_url", rssUrl)
        .maybeSingle();

      if (existing) {
        throw new Error(`Duplicate: "${existing.title}" already exists`);
      }

      // Parse the RSS feed
      const result = await parseRSSFeed(rssUrl);
      if (!result.success) throw new Error(result.error || "Failed to parse RSS");

      const podcastData = result.data;

      // Insert into database
      const { error } = await supabase.from("podcasts").insert({
        title: podcastData.title,
        description: podcastData.description,
        image_url: podcastData.imageUrl,
        rss_url: rssUrl,
        website_url: podcastData.websiteUrl,
        author: podcastData.author,
        episodes: podcastData.episodes,
        last_fetched_at: new Date().toISOString(),
      });

      if (error) throw error;
      return podcastData.title;
    },
    onSuccess: (title) => {
      queryClient.invalidateQueries({ queryKey: ["admin-podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      toast.success(`Added: ${title}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deletePodcast = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("podcasts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      toast.success("Podcast deleted");
    },
  });

  const refreshPodcast = useMutation({
    mutationFn: async (podcast: Podcast) => {
      const result = await parseRSSFeed(podcast.rss_url, podcast.id);
      if (!result.success) throw new Error(result.error || "Failed to refresh");
      return result.data.title;
    },
    onSuccess: (title) => {
      queryClient.invalidateQueries({ queryKey: ["admin-podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      toast.success(`Refreshed: ${title}`);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("podcasts").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });

  const handleAddSingle = async () => {
    if (!newRssUrl.trim()) return;
    setIsLoading(true);
    await addPodcast.mutateAsync(newRssUrl.trim());
    setNewRssUrl("");
    setIsAddDialogOpen(false);
    setIsLoading(false);
  };

  const handleBulkAdd = async () => {
    const urls = bulkRssUrls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && url.startsWith("http"));

    if (urls.length === 0) return;

    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const url of urls) {
      try {
        await addPodcast.mutateAsync(url);
        successCount++;
      } catch {
        failCount++;
      }
    }

    toast.success(`Added ${successCount} podcasts${failCount > 0 ? `, ${failCount} failed` : ""}`);
    setBulkRssUrls("");
    setIsBulkDialogOpen(false);
    setIsLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Parse CSV - look for URLs in any column
      const lines = text.split(/\r?\n/);
      const urls: string[] = [];
      
      for (const line of lines) {
        // Split by comma, tab, or semicolon
        const cells = line.split(/[,;\t]/);
        for (const cell of cells) {
          const trimmed = cell.trim().replace(/^["']|["']$/g, ''); // Remove quotes
          if (trimmed.startsWith('http') && (trimmed.includes('rss') || trimmed.includes('feed') || trimmed.includes('.xml') || trimmed.includes('podcast'))) {
            urls.push(trimmed);
          }
        }
      }

      if (urls.length > 0) {
        setBulkRssUrls(urls.join('\n'));
        setIsBulkDialogOpen(true);
        toast.success(`Found ${urls.length} RSS URLs in spreadsheet`);
      } else {
        toast.error("No RSS URLs found in file. Make sure URLs contain 'rss', 'feed', '.xml', or 'podcast'");
      }
    };

    reader.readAsText(file);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-xl font-bold text-foreground">Podcast Network</h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt,.tsv"
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import Spreadsheet
          </Button>
          <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
            <Rss className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Podcast
          </Button>
        </div>
      </div>

      {loadingPodcasts ? (
        <div className="text-center py-8 text-muted-foreground">Loading podcasts...</div>
      ) : !podcasts?.length ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Rss className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No podcasts yet</p>
          <Button onClick={() => setIsBulkDialogOpen(true)}>
            <Rss className="w-4 h-4 mr-2" />
            Import from RSS URLs
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {podcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              {podcast.image_url ? (
                <img
                  src={podcast.image_url}
                  alt={podcast.title}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-secondary/50 rounded flex items-center justify-center">
                  <Rss className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{podcast.title}</h3>
                  {!podcast.is_active && (
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded">Inactive</span>
                  )}
                </div>
                {podcast.author && (
                  <p className="text-sm text-muted-foreground">by {podcast.author}</p>
                )}
                {podcast.website_url && (
                  <a
                    href={podcast.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {podcast.website_url} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={podcast.is_active}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: podcast.id, is_active: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refreshPodcast.mutate(podcast)}
                  disabled={refreshPodcast.isPending}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshPodcast.isPending ? "animate-spin" : ""}`} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Podcast</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{podcast.title}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deletePodcast.mutate(podcast.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Single Podcast Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Podcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>RSS Feed URL</Label>
              <Input
                value={newRssUrl}
                onChange={(e) => setNewRssUrl(e.target.value)}
                placeholder="https://feed.example.com/podcast.xml"
              />
            </div>
            <Button onClick={handleAddSingle} disabled={isLoading || !newRssUrl.trim()} className="w-full">
              {isLoading ? "Adding..." : "Add Podcast"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Import Podcasts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>RSS Feed URLs (one per line)</Label>
              <Textarea
                value={bulkRssUrls}
                onChange={(e) => setBulkRssUrls(e.target.value)}
                placeholder="https://feed.example.com/podcast1.xml&#10;https://feed.example.com/podcast2.xml&#10;https://feed.example.com/podcast3.xml"
                rows={10}
              />
            </div>
            <Button onClick={handleBulkAdd} disabled={isLoading || !bulkRssUrls.trim()} className="w-full">
              {isLoading ? "Importing..." : "Import Podcasts"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
