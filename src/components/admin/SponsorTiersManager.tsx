import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";

export interface SponsorTier {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  slots_total: number;
  sort_order: number;
  is_active: boolean;
}

const tiersTable = () => (supabase as any).from("sponsor_tiers");

const emptyDraft = { name: "", description: "", price: "", slots_total: "1" };

export const SponsorTiersManager = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SponsorTier | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const { data: tiers, error } = useQuery({
    queryKey: ["sponsor-tiers"],
    queryFn: async () => {
      const { data, error } = await tiersTable().select("*").order("sort_order");
      if (error) throw error;
      return data as SponsorTier[];
    },
  });

  // Slots taken per tier (sponsors with that tier_id)
  const { data: taken } = useQuery({
    queryKey: ["sponsor-tier-usage"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("sponsors").select("tier_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as { tier_id: string | null }[]).forEach((s) => {
        if (s.tier_id) counts[s.tier_id] = (counts[s.tier_id] || 0) + 1;
      });
      return counts;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["sponsor-tiers"] });
    queryClient.invalidateQueries({ queryKey: ["sponsor-tier-usage"] });
  };

  const saveTier = useMutation({
    mutationFn: async () => {
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        price: draft.price ? Number(draft.price) : null,
        slots_total: Math.max(1, parseInt(draft.slots_total) || 1),
      };
      const { error } = editing
        ? await tiersTable().update(payload).eq("id", editing.id)
        : await tiersTable().insert({ ...payload, sort_order: (tiers?.length || 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editing ? "Sponsorship updated" : "Sponsorship created");
      setDialogOpen(false);
      setEditing(null);
      setDraft(emptyDraft);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Save failed: ${e.message}`),
  });

  const deleteTier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await tiersTable().delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sponsorship deleted");
      invalidate();
    },
    onError: () => toast.error("Delete failed — a sponsor may be assigned to this package."),
  });

  const openEdit = (t: SponsorTier) => {
    setEditing(t);
    setDraft({
      name: t.name,
      description: t.description || "",
      price: t.price != null ? String(t.price) : "",
      slots_total: String(t.slots_total),
    });
    setDialogOpen(true);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <BadgeDollarSign className="w-4 h-4 text-amber-600" />
            Sponsorship Packages
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">Tiers, pricing, and available slots</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(null);
            setDraft(emptyDraft);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Package
        </Button>
      </div>

      {error && (
        <p className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3">
          Sponsorship packages table not found — run the <code>sponsor_tiers</code> migration in the Supabase SQL editor to enable this.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(tiers || []).map((t) => {
          const used = taken?.[t.id] || 0;
          const left = Math.max(0, t.slots_total - used);
          return (
            <div key={t.id} className="border border-slate-200 rounded-lg p-4 group relative">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(t)} className="text-slate-400 hover:text-amber-600" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteTier.mutate(t.id)} className="text-slate-300 hover:text-red-500" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-semibold text-slate-900 text-sm pr-10">{t.name}</p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                {t.price != null ? `$${Number(t.price).toLocaleString()}` : "—"}
              </p>
              <p className={`text-xs mt-1.5 font-medium ${left === 0 ? "text-red-500" : "text-slate-500"}`}>
                {left === 0 ? "Sold out" : `${left} of ${t.slots_total} available`}
                {used > 0 && left > 0 && ` · ${used} sold`}
              </p>
              {t.description && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{t.description}</p>}
            </div>
          );
        })}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
            setDraft(emptyDraft);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sponsorship Package" : "New Sponsorship Package"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Award Category"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={2}
                placeholder="What the sponsor gets..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  placeholder="2500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Available Slots</Label>
                <Input
                  type="number"
                  min="1"
                  value={draft.slots_total}
                  onChange={(e) => setDraft({ ...draft, slots_total: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => saveTier.mutate()} disabled={!draft.name.trim() || saveTier.isPending}>
                {saveTier.isPending ? "Saving..." : editing ? "Save Changes" : "Create Package"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
