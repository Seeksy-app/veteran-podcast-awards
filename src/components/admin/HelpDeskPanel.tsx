import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HELP_ARTICLES, type HelpBlock } from "@/data/helpArticles";
import { BookOpen, Image, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const AUDIENCE_LABEL: Record<string, string> = {
  admin: "Admin",
  support: "Customer Service",
  both: "Admin + Support",
};

const HelpBlockView = ({ block }: { block: HelpBlock }) => {
  switch (block.type) {
    case "heading":
      return <h3 className="font-serif text-lg font-bold text-slate-900 mt-6 mb-2 first:mt-0">{block.text}</h3>;
    case "p":
      return <p className="text-sm text-slate-600 leading-relaxed">{block.text}</p>;
    case "steps":
      return (
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "note":
      return (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{block.text}</span>
        </div>
      );
    case "screenshot":
      return (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <Image className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">{block.caption}</p>
        </div>
      );
    default:
      return null;
  }
};

export const HelpDeskPanel = () => {
  const [activeSlug, setActiveSlug] = useState(HELP_ARTICLES[0]?.slug ?? "");
  const active = HELP_ARTICLES.find((a) => a.slug === activeSlug) ?? HELP_ARTICLES[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <div className="space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Articles</p>
        {HELP_ARTICLES.map((article) => (
          <button
            key={article.slug}
            type="button"
            onClick={() => setActiveSlug(article.slug)}
            className={cn(
              "w-full text-left rounded-lg border px-3 py-2.5 transition-colors",
              article.slug === active?.slug
                ? "border-amber-400 bg-amber-50"
                : "border-slate-200 bg-white hover:border-amber-300"
            )}
          >
            <p className="text-sm font-medium text-slate-900">{article.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{AUDIENCE_LABEL[article.audience]}</p>
          </button>
        ))}
      </div>

      {active && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <Badge variant="outline" className="text-[10px]">{AUDIENCE_LABEL[active.audience]}</Badge>
            </div>
            <h2 className="font-serif text-2xl font-bold text-slate-900 mb-1">{active.title}</h2>
            <p className="text-sm text-slate-500 mb-4">{active.summary}</p>
            <div className="space-y-3">
              {active.blocks.map((block, i) => (
                <HelpBlockView key={i} block={block} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
