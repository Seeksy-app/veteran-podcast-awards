import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Video, Upload, GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface InvestorVideo {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const InvestorVideoManager = () => {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['investor-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_videos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as InvestorVideo[];
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async ({ title, description, file }: { title: string; description: string; file: File }) => {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `investor-videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('investor_videos').insert({
        title,
        description: description || null,
        video_url: publicUrl,
        display_order: (videos?.length || 0) + 1,
      });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-videos'] });
      setNewTitle('');
      setNewDescription('');
      setSelectedFile(null);
      setUploading(false);
      toast.success('Video uploaded successfully');
    },
    onError: (error: Error) => {
      setUploading(false);
      toast.error('Failed to upload video: ' + error.message);
    },
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investor_videos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-videos'] });
      toast.success('Video deleted');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('investor_videos').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-videos'] });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newTitle) {
      toast.error('Please select a video file and enter a title');
      return;
    }
    uploadVideoMutation.mutate({ title: newTitle, description: newDescription, file: selectedFile });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Investor Video
          </CardTitle>
          <CardDescription>
            Upload videos for investors to view in the investor portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  placeholder="Platform Demo"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the video content"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" disabled={uploading || !selectedFile}>
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Uploaded Videos
          </CardTitle>
          <CardDescription>Manage videos available in the investor portal</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : videos?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No videos uploaded yet
            </div>
          ) : (
            <div className="space-y-4">
              {videos?.map((video) => (
                <div
                  key={video.id}
                  className="flex flex-col md:flex-row gap-4 p-4 border border-border rounded-lg bg-card"
                >
                  <div className="w-full md:w-48 aspect-video bg-muted rounded overflow-hidden">
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{video.title}</h3>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${video.id}`} className="text-sm text-muted-foreground">
                          Active
                        </Label>
                        <Switch
                          id={`active-${video.id}`}
                          checked={video.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({ id: video.id, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                    {video.description && (
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteVideoMutation.mutate(video.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
