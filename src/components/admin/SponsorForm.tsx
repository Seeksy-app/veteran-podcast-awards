import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SponsorTier as SponsorPackage } from './SponsorTiersManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { uploadSponsorLogo } from '@/hooks/useSponsors';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type SponsorTier = Database['public']['Enums']['sponsor_tier'];
type Sponsor = Database['public']['Tables']['sponsors']['Row'];

interface SponsorFormProps {
  sponsor?: Sponsor;
  onSubmit: (data: {
    name: string;
    logo_url: string;
    website_url?: string;
    tier: SponsorTier;
    tier_id?: string | null;
    category_id?: string | null;
    display_order: number;
    is_active: boolean;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SponsorForm = ({ sponsor, onSubmit, onCancel, isLoading }: SponsorFormProps) => {
  const [name, setName] = useState(sponsor?.name || '');
  const [logoUrl, setLogoUrl] = useState(sponsor?.logo_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(sponsor?.website_url || '');
  const [tier, setTier] = useState<SponsorTier>(sponsor?.tier || 'silver');
  const [displayOrder, setDisplayOrder] = useState(sponsor?.display_order || 0);
  const [isActive, setIsActive] = useState(sponsor?.is_active ?? true);
  const [uploading, setUploading] = useState(false);
  const [tierId, setTierId] = useState<string>(((sponsor as unknown as { tier_id?: string })?.tier_id) || "");
  const [categoryId, setCategoryId] = useState<string>(((sponsor as unknown as { category_id?: string })?.category_id) || "");

  const { data: packages } = useQuery({
    queryKey: ["sponsor-tiers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("sponsor_tiers").select("*").order("sort_order");
      if (error) return [] as SponsorPackage[];
      return data as SponsorPackage[];
    },
  });

  const { data: awardCategories } = useQuery({
    queryKey: ["award-categories-for-sponsors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("award_categories")
        .select("id, name")
        .order("sort_order");
      if (error) return [];
      return data as { id: string; name: string }[];
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadSponsorLogo(file);
      setLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    }
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoUrl) {
      toast.error('Please upload a logo');
      return;
    }
    onSubmit({
      name,
      logo_url: logoUrl,
      website_url: websiteUrl || undefined,
      tier,
      tier_id: tierId || null,
      category_id: categoryId || null,
      display_order: displayOrder,
      is_active: isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Sponsor Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company Name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Logo</Label>
        {logoUrl ? (
          <div className="relative inline-block">
            <img src={logoUrl} alt="Logo preview" className="h-20 object-contain bg-slate-50 rounded-lg p-2" />
            <button
              type="button"
              onClick={() => setLogoUrl('')}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 h-20 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
            <Upload className="w-5 h-5 text-slate-500" />
            <span className="text-sm text-slate-500">
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website URL (optional)</Label>
        <Input
          id="website"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {(packages?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <Label htmlFor="package">Sponsorship Package</Label>
          <Select value={tierId || "none"} onValueChange={(v) => setTierId(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a package..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No package</SelectItem>
              {(packages || []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                  {p.price != null ? ` — $${Number(p.price).toLocaleString()}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">Package pricing and slots are managed in Sponsorship Packages above.</p>
        </div>
      )}

      {(awardCategories?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <Label htmlFor="sponsoredCategory">Sponsored Award Category (optional)</Label>
          <Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {(awardCategories || []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400">
            Shows "Presented by" with this sponsor's logo on the category page and every nominee's voting page.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="tier">Display Tier (site placement)</Label>
        <Select value={tier} onValueChange={(v) => setTier(v as SponsorTier)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Display Order</Label>
        <Input
          id="order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          min={0}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
        <Label htmlFor="active">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || uploading} className="flex-1">
          {isLoading ? 'Saving...' : sponsor ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
