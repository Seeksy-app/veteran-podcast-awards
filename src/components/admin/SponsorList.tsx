import { useState } from 'react';
import { useAllSponsors, useDeleteSponsor, useUpdateSponsor, useCreateSponsor } from '@/hooks/useSponsors';
import { SponsorForm } from './SponsorForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Sponsor = Database['public']['Tables']['sponsors']['Row'];

const tierColors: Record<string, string> = {
  platinum: 'bg-slate-300 text-slate-900',
  gold: 'bg-yellow-500 text-yellow-900',
  silver: 'bg-gray-400 text-gray-900',
  bronze: 'bg-orange-600 text-orange-100',
};

export const SponsorList = () => {
  const { data: sponsors, isLoading } = useAllSponsors();
  const createSponsor = useCreateSponsor();
  const updateSponsor = useUpdateSponsor();
  const deleteSponsor = useDeleteSponsor();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);

  const handleCreate = async (data: Parameters<typeof createSponsor.mutateAsync>[0]) => {
    try {
      await createSponsor.mutateAsync(data);
      toast.success('Sponsor created successfully');
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Failed to create sponsor');
    }
  };

  const handleUpdate = async (data: {
    name: string;
    logo_url: string;
    website_url?: string;
    tier: Database['public']['Enums']['sponsor_tier'];
    display_order: number;
    is_active: boolean;
  }) => {
    if (!editingSponsor) return;
    try {
      await updateSponsor.mutateAsync({ ...data, id: editingSponsor.id });
      toast.success('Sponsor updated successfully');
      setEditingSponsor(null);
    } catch (error) {
      toast.error('Failed to update sponsor');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSponsor.mutateAsync(id);
      toast.success('Sponsor deleted successfully');
    } catch (error) {
      toast.error('Failed to delete sponsor');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sponsors...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-xl font-bold text-foreground">Sponsors</h2>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      {!sponsors?.length ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No sponsors yet</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Sponsor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
            >
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="w-16 h-16 object-contain bg-secondary/50 rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{sponsor.name}</h3>
                  <Badge className={tierColors[sponsor.tier]}>
                    {sponsor.tier}
                  </Badge>
                  {!sponsor.is_active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </div>
                {sponsor.website_url && (
                  <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    {sponsor.website_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingSponsor(sponsor)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {sponsor.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(sponsor.id)}
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

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sponsor</DialogTitle>
          </DialogHeader>
          <SponsorForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createSponsor.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingSponsor} onOpenChange={(open) => !open && setEditingSponsor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sponsor</DialogTitle>
          </DialogHeader>
          {editingSponsor && (
            <SponsorForm
              sponsor={editingSponsor}
              onSubmit={handleUpdate}
              onCancel={() => setEditingSponsor(null)}
              isLoading={updateSponsor.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
