import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Copy, Trash2, RefreshCw, Calendar, Mail, Key } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';

interface InvestorAccess {
  id: string;
  email: string;
  access_code: string;
  allowed_tabs: string[];
  expires_at: string;
  created_at: string;
  last_accessed_at: string | null;
  is_active: boolean;
}

const AVAILABLE_TABS = [
  { id: 'metrics', label: 'Business Metrics' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'security', label: 'Security' },
  { id: 'video', label: 'Video' },
  { id: 'opportunity', label: 'Opportunity' },
];

const generateAccessCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const InvestorAccessManager = () => {
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState('');
  const [expirationDays, setExpirationDays] = useState(30);
  const [selectedTabs, setSelectedTabs] = useState<string[]>(['metrics', 'tech-stack', 'security', 'video', 'opportunity']);

  const { data: accessList, isLoading } = useQuery({
    queryKey: ['investor-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investor_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvestorAccess[];
    },
  });

  const createAccessMutation = useMutation({
    mutationFn: async (data: { email: string; allowed_tabs: string[]; expires_at: string }) => {
      const { error } = await supabase.from('investor_access').insert({
        email: data.email,
        access_code: generateAccessCode(),
        allowed_tabs: data.allowed_tabs,
        expires_at: data.expires_at,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-access'] });
      setNewEmail('');
      toast.success('Investor access created');
    },
    onError: (error: Error) => {
      toast.error('Failed to create access: ' + error.message);
    },
  });

  const deleteAccessMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('investor_access').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-access'] });
      toast.success('Access revoked');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('investor_access').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-access'] });
    },
  });

  const regenerateCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investor_access')
        .update({ access_code: generateAccessCode() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-access'] });
      toast.success('Access code regenerated');
    },
  });

  const handleCreateAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || selectedTabs.length === 0) {
      toast.error('Please enter an email and select at least one tab');
      return;
    }
    createAccessMutation.mutate({
      email: newEmail,
      allowed_tabs: selectedTabs,
      expires_at: addDays(new Date(), expirationDays).toISOString(),
    });
  };

  const copyAccessLink = (code: string) => {
    const url = `${window.location.origin}/investor?code=${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Access link copied to clipboard');
  };

  const toggleTab = (tabId: string) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Create Investor Access
          </CardTitle>
          <CardDescription>
            Generate access codes for investors to view selected admin tabs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccess} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Investor Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="investor@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiration">Expires In (Days)</Label>
                <Input
                  id="expiration"
                  type="number"
                  min={1}
                  max={365}
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allowed Tabs</Label>
              <div className="flex flex-wrap gap-4">
                {AVAILABLE_TABS.map((tab) => (
                  <div key={tab.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`tab-${tab.id}`}
                      checked={selectedTabs.includes(tab.id)}
                      onCheckedChange={() => toggleTab(tab.id)}
                    />
                    <Label htmlFor={`tab-${tab.id}`} className="cursor-pointer">
                      {tab.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={createAccessMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Create Access
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Access Codes</CardTitle>
          <CardDescription>Manage investor portal access</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : accessList?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No investor access codes created yet
            </div>
          ) : (
            <div className="space-y-4">
              {accessList?.map((access) => {
                const isExpired = !isAfter(new Date(access.expires_at), new Date());
                return (
                  <div
                    key={access.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-card"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{access.email}</span>
                        {!access.is_active && <Badge variant="secondary">Disabled</Badge>}
                        {isExpired && <Badge variant="destructive">Expired</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          <code className="bg-muted px-2 py-0.5 rounded">{access.access_code}</code>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {format(new Date(access.expires_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {access.allowed_tabs.map((tab) => (
                          <Badge key={tab} variant="outline" className="text-xs">
                            {AVAILABLE_TABS.find((t) => t.id === tab)?.label || tab}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAccessLink(access.access_code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateCodeMutation.mutate(access.id)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleActiveMutation.mutate({ id: access.id, is_active: !access.is_active })
                        }
                      >
                        {access.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAccessMutation.mutate(access.id)}
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
