import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/** /vote — voter entry point: sends visitors to the active program's category list. */
const VoteLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("award_programs")
        .select("id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      navigate(data?.id ? `/awards/${data.id}/categories` : "/awards", { replace: true });
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
};

export default VoteLanding;
