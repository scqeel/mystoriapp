import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSettings() {
  return useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      (data ?? []).forEach((row: any) => (map[row.key] = row.value));
      return {
        agent_activation_fee: Number(map.agent_activation_fee ?? 50),
        min_withdrawal: Number(map.min_withdrawal ?? 50),
        support_phone: String(map.support_phone ?? ""),
        support_email: String(map.support_email ?? ""),
        platform_name: String(map.platform_name ?? "OneGig"),
        platform_tagline: String(map.platform_tagline ?? "Buy data in seconds ⚡"),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}