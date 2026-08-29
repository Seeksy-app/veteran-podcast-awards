import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/vpa-logo.png";

interface Props {
  podcastTitle: string;
  podcasterName: string;
  categoryIds?: string[];
}

type Variant = "classic" | "frame" | "banner";

/** Screenshot-friendly "Official Nominee" card — black + gold, three style options */
export const NomineeBadgeCard = ({ podcastTitle, podcasterName, categoryIds = [] }: Props) => {
  const [variant, setVariant] = useState<Variant>("classic");

  const { data: categoryNames = [] } = useQuery({
    queryKey: ["badge-category-names", categoryIds.join("|")],
    enabled: categoryIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("award_categories").select("id, name").in("id", categoryIds);
      return (data || []).map((c) => c.name);
    },
  });

  const catLine = categoryNames.length > 0 && (
    <div className="flex flex-wrap justify-center gap-1.5">
      {categoryNames.map((n) => (
        <span
          key={n}
          className="rounded-full border border-[#d3a747]/50 bg-[#d3a747]/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#e8c56d]"
        >
          {n}
        </span>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Style switcher — not part of the shareable card */}
      <div className="flex justify-center gap-2">
        {(
          [
            { key: "classic", label: "Classic" },
            { key: "frame", label: "Gold Frame" },
            { key: "banner", label: "Banner" },
          ] as const
        ).map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setVariant(v.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              variant === v.key
                ? "bg-amber-500 border-amber-500 text-white"
                : "bg-background border-border text-muted-foreground hover:border-amber-400"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {variant === "classic" && (
        <div className="rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto bg-[#0a0a0b] border border-[#d3a747]/30">
          <div className="px-8 py-9 text-center space-y-5">
            <img src={logo} alt="Veteran Podcast Awards" className="w-20 h-20 mx-auto" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#d3a747] font-bold">
                2026 Veteran Podcast Awards
              </p>
              <h3 className="font-serif text-3xl font-bold text-white mt-2 leading-tight">Official Nominee</h3>
            </div>
            {catLine}
            <div className="pt-4 border-t border-white/10">
              <p className="font-serif text-xl font-semibold text-white">{podcastTitle}</p>
              <p className="text-sm text-neutral-400 mt-1">{podcasterName}</p>
            </div>
            <p className="text-[11px] tracking-widest text-neutral-500">VETERANPODCASTAWARDS.COM</p>
          </div>
        </div>
      )}

      {variant === "frame" && (
        <div className="rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto bg-[#0a0a0b] p-2.5">
          <div className="rounded-xl border-2 border-[#d3a747] p-1">
            <div className="rounded-lg border border-[#d3a747]/40 px-8 py-8 text-center space-y-4">
              <img src={logo} alt="Veteran Podcast Awards" className="w-16 h-16 mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-[#e8c56d] leading-tight uppercase tracking-wide">
                Nominated
              </h3>
              <p className="font-serif text-2xl font-bold text-white leading-snug">{podcastTitle}</p>
              {catLine}
              <p className="text-sm text-neutral-400">Hosted by {podcasterName}</p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="h-px w-10 bg-[#d3a747]/50" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#d3a747]">Voting Opens Oct 5</p>
                <span className="h-px w-10 bg-[#d3a747]/50" />
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === "banner" && (
        <div className="rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto bg-[#0a0a0b] border border-[#d3a747]/30">
          <div className="bg-gradient-to-r from-[#d3a747] to-[#b8860b] px-6 py-2.5 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#1c1917]">
              2026 Veteran Podcast Awards
            </p>
          </div>
          <div className="px-8 py-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <img src={logo} alt="" className="w-14 h-14" />
              <div className="text-left">
                <h3 className="font-serif text-2xl font-bold text-white leading-tight">{podcastTitle}</h3>
                <p className="text-sm text-neutral-400">{podcasterName}</p>
              </div>
            </div>
            <p className="font-serif text-lg text-[#e8c56d] italic">is an Official Nominee</p>
            {catLine}
            <p className="text-[11px] tracking-widest text-neutral-500 pt-1">VOTE AT VETERANPODCASTAWARDS.COM</p>
          </div>
        </div>
      )}
    </div>
  );
};
