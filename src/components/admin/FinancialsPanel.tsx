import { useState, useEffect, useMemo } from "react";
import { DollarSign, Plus, Trash2, TrendingUp, Clock, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── CONFIG ──────────────────────────────────────────────────────────────────
const RATE        = 150;
const PAST_HRS    = 200;
const HRS_PER_WK  = 10;
const EVENT_DATE  = new Date("2026-11-11T00:00:00");

const INFRA: { service: string; purpose: string; monthly: number }[] = [
  { service: "Supabase (Pro)",  purpose: "Database, Auth, Storage, Edge Functions", monthly: 25  },
  { service: "Vercel (Pro)",    purpose: "Hosting, CDN, OG image functions",         monthly: 20  },
  { service: "Resend",          purpose: "Transactional & campaign email",           monthly: 15  },
  { service: "Upload-Post",     purpose: "Podcaster social posting (⅓ share)",       monthly: 17  },
  { service: "Lovable AI",      purpose: "AI gateway (Gemini 2.5 Flash)",            monthly: 10  },
  { service: "Podchaser",       purpose: "Podcast API (free tier, ⅓ share)",         monthly: 0   },
];

const CATEGORIES = ["Awards", "Event", "Marketing", "Operations", "Technology", "Other"] as const;
type Category = typeof CATEGORIES[number];

interface Expense {
  id: string;
  desc: string;
  cat: Category;
  qty: number;
  unit: number;
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDecimal(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STORAGE_KEY = "vpa_financials_expenses";

function loadExpenses(): Expense[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveExpenses(list: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ── COMPONENT ────────────────────────────────────────────────────────────────
export const FinancialsPanel = () => {
  const today       = useMemo(() => new Date(), []);
  const msLeft      = Math.max(0, EVENT_DATE.getTime() - today.getTime());
  const weeksLeft   = Math.floor(msLeft / (7 * 24 * 60 * 60 * 1000));
  const daysLeft    = Math.floor(msLeft / (24 * 60 * 60 * 1000));
  const monthsLeft  = parseFloat((msLeft / (30.44 * 24 * 60 * 60 * 1000)).toFixed(1));
  const futureHrs   = weeksLeft * HRS_PER_WK;
  const totalHrs    = PAST_HRS + futureHrs;

  const infraTotal  = useMemo(
    () => INFRA.reduce((sum, r) => sum + r.monthly * monthsLeft, 0),
    [monthsLeft]
  );

  const [expenses, setExpenses]  = useState<Expense[]>(loadExpenses);
  const [desc, setDesc]          = useState("");
  const [cat, setCat]            = useState<Category>("Awards");
  const [qty, setQty]            = useState("1");
  const [unit, setUnit]          = useState("");

  const expTotal = useMemo(
    () => expenses.reduce((s, e) => s + e.qty * e.unit, 0),
    [expenses]
  );

  const devCost   = totalHrs * RATE;
  const grandTotal = devCost + infraTotal + expTotal;

  useEffect(() => { saveExpenses(expenses); }, [expenses]);

  const addExpense = () => {
    const u = parseFloat(unit);
    const q = parseFloat(qty) || 1;
    if (!desc.trim() || isNaN(u) || u < 0) return;
    setExpenses(prev => [
      ...prev,
      { id: crypto.randomUUID(), desc: desc.trim(), cat, qty: q, unit: u },
    ]);
    setDesc(""); setUnit(""); setQty("1");
  };

  const removeExpense = (id: string) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          VPA Project Financials
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Development investment, infrastructure costs, and custom expenses through November 11, 2026
          {daysLeft > 0 && <span className="ml-2 text-amber-600 font-medium">· {daysLeft} days to event</span>}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Invested", value: fmt(PAST_HRS * RATE), sub: `${PAST_HRS} hrs logged`, icon: Clock,      color: "text-amber-600" },
          { label: "Projected Total", value: fmt(grandTotal),      sub: "All costs to Nov 11",   icon: TrendingUp,  color: "text-amber-600" },
          { label: "Dev Hours",      value: String(totalHrs),       sub: `${PAST_HRS} past · ${futureHrs} remaining`, icon: Clock, color: "text-slate-600" },
          { label: "Custom Expenses", value: fmt(expTotal),         sub: `${expenses.length} line item${expenses.length === 1 ? "" : "s"}`, icon: DollarSign, color: "text-slate-600" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-1">
              <k.icon className={`w-4 h-4 ${k.color}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k.label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Development */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-slate-900">Development</h3>
          <span className="text-xs text-slate-400 ml-auto">$150 / hr · Andrew Appleton</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Phase</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Hours</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Rate</th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-3 font-medium text-slate-900">Platform Build (completed)</td>
                <td className="px-4 py-3 text-right text-slate-600">{PAST_HRS}</td>
                <td className="px-4 py-3 text-right text-slate-500">{fmtDecimal(RATE)}/hr</td>
                <td className="px-6 py-3 text-right font-semibold text-amber-600">{fmt(PAST_HRS * RATE)}</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-slate-900">
                  Ongoing to Nov 11
                  <span className="text-xs text-slate-400 ml-2">({weeksLeft} wks × {HRS_PER_WK} hrs/wk)</span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{futureHrs}</td>
                <td className="px-4 py-3 text-right text-slate-500">{fmtDecimal(RATE)}/hr</td>
                <td className="px-6 py-3 text-right font-semibold text-amber-600">{fmt(futureHrs * RATE)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={3} className="px-6 py-3 font-bold text-slate-900">Development Total</td>
                <td className="px-6 py-3 text-right font-bold text-amber-600">{fmt(devCost)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Infrastructure */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-slate-900">Infrastructure</h3>
          <span className="text-xs text-slate-400 ml-auto">Monthly recurring · projected {monthsLeft} months</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 hidden md:table-cell">Purpose</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Monthly</th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INFRA.map(r => {
                const sub = r.monthly * monthsLeft;
                return (
                  <tr key={r.service}>
                    <td className="px-6 py-3 font-medium text-slate-900">{r.service}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{r.purpose}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {r.monthly === 0 ? <span className="text-slate-400">Free</span> : fmtDecimal(r.monthly)}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-emerald-600">
                      {r.monthly === 0 ? <span className="text-slate-400">—</span> : fmt(sub)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={3} className="px-6 py-3 font-bold text-slate-900">Infrastructure Total</td>
                <td className="px-6 py-3 text-right font-bold text-emerald-600">{fmt(infraTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="px-6 py-3 text-xs text-slate-400 border-t border-slate-100">
          * Stripe: 2.9% + $0.30/transaction — add as a custom expense once ticket revenue is known.
        </p>
      </div>

      {/* Custom Expenses */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-slate-900">Custom Expenses</h3>
          <span className="text-xs text-slate-400 ml-auto">Saved in this browser</span>
        </div>

        {/* Add form */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_100px_120px_auto] gap-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Input
                value={desc}
                onChange={e => setDesc(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addExpense()}
                placeholder="e.g. Main category awards"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={cat} onValueChange={v => setCat(v as Category)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Qty</Label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addExpense()}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unit Cost ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addExpense()}
                placeholder="0.00"
                className="h-9"
              />
            </div>
            <Button onClick={addExpense} className="h-9 bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Expense list */}
        {expenses.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400 italic">
            No expenses added yet — use the form above to track awards, event costs, and other line items.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Category</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Qty</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Unit</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => (
                  <tr key={e.id} className="group hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{e.desc}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                        {e.cat}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{e.qty}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmtDecimal(e.unit)}</td>
                    <td className="px-6 py-3 text-right font-semibold text-slate-900">{fmt(e.qty * e.unit)}</td>
                    <td className="pr-4">
                      <button
                        onClick={() => removeExpense(e.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50">
                  <td colSpan={4} className="px-6 py-3 font-bold text-slate-900">Custom Expenses Total</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{fmt(expTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-amber-700">Total Project Cost</div>
          <div className="text-xs text-amber-600 mt-0.5">
            Dev {fmt(devCost)} · Infra {fmt(infraTotal)} · Expenses {fmt(expTotal)}
          </div>
        </div>
        <div className="text-4xl font-bold text-amber-700 font-mono">{fmt(grandTotal)}</div>
      </div>
    </div>
  );
};
