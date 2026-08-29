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
    category_ids: string[];
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loadedExisting, setLoadedExisting] = useState(false);

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
        .select("id, name, slug")
        .order("sort_order");
      if (error) return [];
      return data as { id: string; name: string; slug: string }[];
    },
  });

  // Which categories are already claimed, and by which sponsor
  const { data: claims } = useQuery({
    queryKey: ["sponsor-category-claims"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sponsor_categories")
        .select("category_id, sponsor_id");
      if (error) return [] as { category_id: string; sponsor_id: string }[];
      return data as { category_id: string; sponsor_id: string }[];
    },
  });

  // Pre-select the sponsor's existing categories when editing
  if (!loadedExisting && claims && sponsor) {
    setSelectedCategoryIds(claims.filter((c) => c.sponsor_id === sponsor.id).map((c) => c.category_id));
    setLoadedExisting(true);
  }

  const BRANCH_RE = /(army|navy|marine|air-force|coast-guard|space-force|national-guard)/;
  const isBranch = (slug: string) => BRANCH_RE.test(slug);
  const regularCats = (awardCategories || []).filter((c) => !isBranch(c.slug));
  const branchCats = (awardCategories || []).filter((c) => isBranch(c.slug));

  // The chosen package determines what can be sponsored:
  // "…category…" packages unlock award categories; "…branch…"/"…best of…" unlock branch categories.
  const pkgName = (packages?.find((p) => p.id === tierId)?.name || "").toLowerCase();
  const allowsRegular = pkgName.includes("category");
  const allowsBranch = pkgName.includes("branch") || pkgName.includes("best of");
  const takenByOther = (catId: string) =>
    (claims || []).some((c) => c.category_id === catId && c.sponsor_id !== sponsor?.id);
  const selectedRegular = selectedCategoryIds.filter((id) => regularCats.some((c) => c.id === id));
  const selectedBranch = selectedCategoryIds.filter((id) => branchCats.some((c) => c.id === id));

  const toggleCategory = (catId: string, branch: boolean) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(catId)) return prev.filter((id) => id !== catId);
      if (branch && selectedBranch.length >= 1) {
        toast.error("Sponsors can pick 1 branch category");
        return prev;
      }
      if (!branch && selectedRegular.length >= 5) {
        toast.error("Sponsors can pick up to 5 award categories");
        return prev;
      }
      return [...prev, catId];
    });
  };

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
      category_ids: selectedCategoryIds,
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
          <Select
            value={tierId || "none"}
            onValueChange={(v) => {
              const newId = v === "none" ? "" : v;
              setTierId(newId);
              // Drop selections the new package doesn't allow
              const name = (packages?.find((p) => p.id === newId)?.name || "").toLowerCase();
              const reg = name.includes("category");
              const br = name.includes("branch") || name.includes("best of");
              setSelectedCategoryIds((prev) =>
                prev.filter((id) => {
                  const cat = (awardCategories || []).find((c) => c.id === id);
                  if (!cat) return false;
                  return isBranch(cat.slug) ? br : reg;
                })
              );
            }}
          >
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

      {(awardCategories?.length ?? 0) > 0 && (allowsRegular || allowsBranch) && (
        <div className="space-y-4 rounded-lg border border-slate-200 p-4">
          <div>
            <Label>{allowsBranch && !allowsRegular ? "Sponsored Branch Category" : "Sponsored Award Categories"}</Label>
            <p className="text-xs text-slate-400 mt-0.5">
              Each category is exclusive — taken ones are locked. "Presented by" appears on the
              category page and every nominee's voting page and share card.
            </p>
          </div>
          {allowsRegular && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Categories ({selectedRegular.length}/5)
            </p>
            <div className="flex flex-wrap gap-2">
              {regularCats.map((c) => {
                const taken = takenByOther(c.id);
                const selected = selectedCategoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={taken}
                    onClick={() => toggleCategory(c.id, false)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? "bg-amber-500 border-amber-500 text-white"
                        : taken
                        ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                        : "bg-white border-slate-200 text-slate-600 hover:border-amber-300"
                    }`}
                    title={taken ? "Already sponsored" : undefined}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          )}
          {allowsBranch && branchCats.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Branch Categories ({selectedBranch.length}/1)
              </p>
              <div className="flex flex-wrap gap-2">
                {branchCats.map((c) => {
                  const taken = takenByOther(c.id);
                  const selected = selectedCategoryIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={taken}
                      onClick={() => toggleCategory(c.id, true)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-amber-500 border-amber-500 text-white"
                          : taken
                          ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                          : "bg-white border-slate-200 text-slate-600 hover:border-amber-300"
                      }`}
                      title={taken ? "Already sponsored" : undefined}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
