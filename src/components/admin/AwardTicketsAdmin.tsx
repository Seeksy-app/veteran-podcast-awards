import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { ExternalLink, Loader2, Pencil, Plus, Ticket, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type AwardProgram = Database["public"]["Tables"]["award_programs"]["Row"];
type TicketType = Database["public"]["Tables"]["award_ticket_types"]["Row"];
type Purchase = Database["public"]["Tables"]["award_ticket_purchases"]["Row"];

const GOLD_RING = "border-l-[3px] border-[#B8860B]";
const KINDS = [
  { value: "general_admission", label: "General Admission" },
  { value: "vip", label: "VIP" },
  { value: "sponsor_table", label: "Sponsor Table" },
  { value: "custom", label: "Custom" },
] as const;

type Props = {
  program: AwardProgram | null;
  programId: string | null;
};

export function AwardTicketsAdmin({ program, programId }: Props) {
  const qc = useQueryClient();
  const [typeDialog, setTypeDialog] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);
  const [draft, setDraft] = useState({
    ticket_kind: "general_admission" as string,
    name: "",
    description: "",
    price_dollars: "",
    quantity: "",
    sort_order: 0,
    is_active: true,
  });

  const typesQuery = useQuery({
    queryKey: ["award-ticket-types-admin", programId],
    queryFn: async () => {
      if (!programId) return [];
      const { data, error } = await supabase
        .from("award_ticket_types")
        .select("*")
        .eq("program_id", programId)
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data as TicketType[];
    },
    enabled: Boolean(programId),
  });

  const purchasesQuery = useQuery({
    queryKey: ["award-ticket-purchases-admin", programId],
    queryFn: async () => {
      if (!programId) return [];
      const { data, error } = await supabase
        .from("award_ticket_purchases")
        .select("*")
        .eq("program_id", programId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Purchase[];
    },
    enabled: Boolean(programId),
  });

  const updateProgramExternalUrl = useMutation({
    mutationFn: async (url: string) => {
      if (!programId) return;
      const { error } = await supabase
        .from("award_programs")
        .update({ external_ticket_url: url.trim() || null })
        .eq("id", programId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["award-programs"] });
      toast.success("Saved");
    },
    onError: () => toast.error("Could not save URL"),
  });

  const [externalDraft, setExternalDraft] = useState(program?.external_ticket_url ?? "");
  useEffect(() => {
    setExternalDraft(program?.external_ticket_url ?? "");
  }, [program?.id, program?.external_ticket_url]);

  const openNew = () => {
    setEditingType(null);
    setDraft({
      ticket_kind: "general_admission",
      name: "General Admission",
      description: "",
      price_dollars: "0",
      quantity: "",
      sort_order: typesQuery.data?.length ?? 0,
      is_active: true,
    });
    setTypeDialog(true);
  };

  const openEdit = (t: TicketType) => {
    setEditingType(t);
    setDraft({
      ticket_kind: t.ticket_kind,
      name: t.name,
      description: t.description ?? "",
      price_dollars: (t.price_cents / 100).toFixed(2),
      quantity: t.quantity_total == null ? "" : String(t.quantity_total),
      sort_order: t.sort_order,
      is_active: t.is_active,
    });
    setTypeDialog(true);
  };

  const saveType = useMutation({
    mutationFn: async () => {
      if (!programId) throw new Error("No program");
      const priceCents = Math.round(parseFloat(draft.price_dollars || "0") * 100);
      if (priceCents < 0 || Number.isNaN(priceCents)) throw new Error("Invalid price");
      const qtyRaw = draft.quantity.trim();
      const quantityTotal = qtyRaw === "" ? null : parseInt(qtyRaw, 10);
      if (quantityTotal !== null && (Number.isNaN(quantityTotal) || quantityTotal < 0)) {
        throw new Error("Invalid quantity cap");
      }
      const row: Database["public"]["Tables"]["award_ticket_types"]["Insert"] = {
        program_id: programId,
        ticket_kind: draft.ticket_kind,
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        price_cents: priceCents,
        quantity_total: quantityTotal,
        sort_order: draft.sort_order,
        is_active: draft.is_active,
      };
      if (editingType) {
        const { error } = await supabase
          .from("award_ticket_types")
          .update({
            ticket_kind: row.ticket_kind,
            name: row.name,
            description: row.description,
            price_cents: row.price_cents,
            quantity_total: row.quantity_total,
            sort_order: row.sort_order,
            is_active: row.is_active,
          })
          .eq("id", editingType.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("award_ticket_types").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["award-ticket-types-admin", programId] });
      qc.invalidateQueries({ queryKey: ["award-ticket-types-public", programId] });
      toast.success(editingType ? "Ticket type updated" : "Ticket type created");
      setTypeDialog(false);
    },
    onError: (e: Error) => toast.error(e.message || "Save failed"),
  });

  const toggleCheckIn = useMutation({
    mutationFn: async ({ id, checkedIn }: { id: string; checkedIn: boolean }) => {
      const { error } = await supabase
        .from("award_ticket_purchases")
        .update({
          checked_in_at: checkedIn ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["award-ticket-purchases-admin", programId] });
      toast.success("Updated");
    },
    onError: () => toast.error("Could not update check-in"),
  });

  if (!programId || !program) return null;

  return (
    <section className="space-y-4">
      <div className={cn("flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between", GOLD_RING, "pl-4")}>
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#B8860B]" />
          <h3 className="text-base font-semibold tracking-tight">Ceremony tickets</h3>
        </div>
        <Button
          size="sm"
          className="h-9 rounded-lg bg-[#B8860B] text-white shadow hover:bg-[#9a7209]"
          onClick={openNew}
        >
          <Plus className="mr-1 h-4 w-4" /> Add ticket type
        </Button>
      </div>

      <Card className="rounded-2xl border-border/80">
        <CardContent className="space-y-3 p-5">
          <div>
            <Label>External ticket URL (Eventbrite fallback)</Label>
            <p className="mb-2 text-xs text-muted-foreground">
              Shown when Stripe is not configured or as an alternate option on the public tickets page.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="https://www.eventbrite.com/..."
                value={externalDraft}
                onChange={(e) => setExternalDraft(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={updateProgramExternalUrl.isPending}
                onClick={() => updateProgramExternalUrl.mutate(externalDraft)}
              >
                Save URL
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        {typesQuery.isLoading ? (
          <p className="text-muted-foreground">Loading ticket types…</p>
        ) : !(typesQuery.data?.length ?? 0) ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No ticket types yet. Add General Admission, VIP, or Sponsor Table.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Sold / Cap</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {typesQuery.data!.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.ticket_kind}</TableCell>
                    <TableCell className="text-right tabular-nums">${(t.price_cents / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {t.quantity_sold} / {t.quantity_total ?? "∞"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-6">
        <h4 className="text-sm font-semibold">Purchases & check-in</h4>
        {purchasesQuery.isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : !(purchasesQuery.data?.length ?? 0) ? (
          <p className="text-sm text-muted-foreground">No purchases yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Ticket link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchasesQuery.data!.map((row) => {
                  const site =
                    typeof window !== "undefined" ? window.location.origin : "";
                  const link = `${site}/ticket/${row.qr_token}`;
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {format(new Date(row.created_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">{row.buyer_name}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-xs">{row.buyer_email}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        ${((row.total_amount_cents ?? 0) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.status === "completed" ? "default" : "secondary"}>{row.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {row.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              toggleCheckIn.mutate({
                                id: row.id,
                                checkedIn: !row.checked_in_at,
                              })
                            }
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            {row.checked_in_at ? "Undo" : "Check in"}
                          </Button>
                        )}
                        {row.checked_in_at && (
                          <span className="ml-2 text-xs text-emerald-600">
                            {format(new Date(row.checked_in_at), "MMM d h:mm a")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.status === "completed" && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Open <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={typeDialog} onOpenChange={setTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingType ? "Edit ticket type" : "New ticket type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Kind</Label>
              <Select
                value={draft.ticket_kind}
                onValueChange={(v) => setDraft((d) => ({ ...d, ticket_kind: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.price_dollars}
                  onChange={(e) => setDraft((d) => ({ ...d, price_dollars: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Quantity cap</Label>
                <Input
                  placeholder="Unlimited if empty"
                  value={draft.quantity}
                  onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTypeDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={saveType.isPending || !draft.name.trim()}
              onClick={() => saveType.mutate()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
