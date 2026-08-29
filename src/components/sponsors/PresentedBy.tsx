import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategorySponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
}

/**
 * "Presented by" strip for a sponsored award category.
 * Renders nothing when the category has no active sponsor.
 */
export const PresentedBy = ({ categoryId, className = "" }: { categoryId: string | null | undefined; className?: string }) => {
  const { data: sponsor } = useQuery({
    queryKey: ["category-sponsor", categoryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("sponsor_categories")
        .select("sponsors(id, name, logo_url, website_url, is_active)")
        .eq("category_id", categoryId)
        .limit(1)
        .maybeSingle();
      if (error) return null;
      const s = (data as { sponsors: (CategorySponsor & { is_active: boolean }) | null } | null)?.sponsors;
      return s && s.is_active ? s : null;
    },
    enabled: !!categoryId,
  });

  if (!sponsor) return null;

  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Presented by</span>
      <img src={sponsor.logo_url} alt={sponsor.name} className="h-7 w-auto object-contain" />
      <span className="text-sm font-semibold text-foreground">{sponsor.name}</span>
    </span>
  );

  return (
    <div className={`flex justify-center ${className}`}>
      {sponsor.website_url ? (
        <a
          href={sponsor.website_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="rounded-full border border-primary/25 bg-primary/5 px-5 py-2.5 hover:bg-primary/10 transition-colors"
        >
          {inner}
        </a>
      ) : (
        <span className="rounded-full border border-primary/25 bg-primary/5 px-5 py-2.5">{inner}</span>
      )}
    </div>
  );
};
