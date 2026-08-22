import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Copy, Trash2, Calendar, Link2, Users, Eye, Ban, RotateCcw } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';

interface ShareLinkVisit {
  email: string;
  visited_at: string;
}

interface ShareLink {
  id: string;
  token: string;
  label: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  investor_share_link_visits: ShareLinkVisit[];
}

const generateToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

const shareUrl = (token: string) => `${window.location.origin}/invest/${token}`;

export const ShareLinkManager = () => {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('');
  const [expirationDate, setExpirationDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));

  const { data: links, isLoading } = useQuery({
    queryKey: ['investor-share-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_share_links')
        .select('*, investor_share_link_visits(email, visited_at)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShareLink[];
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (input: { label: string; expires_at: string }) => {
      const token = generateToken();
      const { error } = await supabase.from('investor_share_links').insert({
        token,
        label: input.label,
        expires_at: input.expires_at,
      });
      if (error) throw error;
      return token;
    },
    onSuccess: (token) => {
      queryClient.invalidateQueries({ queryKey: ['investor-share-links'] });
      setLabel('');
      navigator.clipboard.writeText(shareUrl(token));
      toast.success('Magic link created and copied to clipboard');
    },
    onError: (error: Error) => {
      toast.error('Failed to create link: ' + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('investor_share_links')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
      return is_active;
    },
    onSuccess: (is_active) => {
      queryClient.invalidateQueries({ queryKey: ['investor-share-links'] });
      toast.success(is_active ? 'Link reactivated' : 'Link revoked');
    },
    onError: (error: Error) => {
      toast.error('Failed to update link: ' + error.message);
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investor_share_links').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-share-links'] });
      toast.success('Link deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete link: ' + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error('Please enter a label for the link');
      return;
    }
    const expiresAt = new Date(`${expirationDate}T23:59:59`);
    if (!isAfter(expiresAt, new Date())) {
      toast.error('Expiration date must be in the future');
      return;
    }
    createLinkMutation.mutate({ label: trimmed, expires_at: expiresAt.toISOString() });
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(shareUrl(token));
    toast.success('Magic link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Magic Share Links
          </CardTitle>
          <CardDescription>
            Share a link to the investor deck with anyone — they enter their email, get access, and
            every visit is logged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-label">Label</Label>
                <Input
                  id="link-label"
                  placeholder="e.g. Sequoia intro call"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-expiration">Expires On</Label>
                <Input
                  id="link-expiration"
                  type="date"
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={createLinkMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Create Magic Link
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared Links</CardTitle>
          <CardDescription>Visit activity and controls for each magic link</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : !links?.length ? (
            <div className="text-center py-8 text-slate-500">No magic links created yet</div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => {
                const isExpired = !isAfter(new Date(link.expires_at), new Date());
                const visits = link.investor_share_link_visits ?? [];
                const uniqueEmails = new Set(visits.map((v) => v.email));
                const lastVisit = visits.reduce<string | null>(
                  (latest, v) => (!latest || v.visited_at > latest ? v.visited_at : latest),
                  null,
                );
                return (
                  <div
                    key={link.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-slate-200 rounded-lg bg-white"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link2 className="w-4 h-4 text-slate-500" />
                        <span className="font-medium">{link.label}</span>
                        {!link.is_active ? (
                          <Badge variant="secondary">Revoked</Badge>
                        ) : isExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {visits.length} {visits.length === 1 ? 'visit' : 'visits'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {uniqueEmails.size} unique
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {format(new Date(link.expires_at), 'MMM d, yyyy')}
                        </span>
                        {lastVisit && (
                          <span>Last visit: {format(new Date(lastVisit), 'MMM d, yyyy h:mm a')}</span>
                        )}
                      </div>
                      {uniqueEmails.size > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {[...uniqueEmails].map((visitorEmail) => (
                            <Badge key={visitorEmail} variant="outline" className="text-xs">
                              {visitorEmail}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => copyLink(link.token)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: link.id, is_active: !link.is_active })
                        }
                      >
                        {link.is_active ? (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Revoke
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Reactivate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteLinkMutation.mutate(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
