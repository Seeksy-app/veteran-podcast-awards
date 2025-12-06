import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Sponsor = Database['public']['Tables']['sponsors']['Row'];
type SponsorInsert = Database['public']['Tables']['sponsors']['Insert'];
type SponsorUpdate = Database['public']['Tables']['sponsors']['Update'];

export const useSponsors = () => {
  return useQuery({
    queryKey: ['sponsors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true)
        .order('tier')
        .order('display_order');
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });
};

export const useAllSponsors = () => {
  return useQuery({
    queryKey: ['sponsors', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('tier')
        .order('display_order');
      
      if (error) throw error;
      return data as Sponsor[];
    },
  });
};

export const useCreateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sponsor: SponsorInsert) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert(sponsor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const useUpdateSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: SponsorUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const useDeleteSponsor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
};

export const uploadSponsorLogo = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('sponsor-logos')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;
  
  const { data } = supabase.storage
    .from('sponsor-logos')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};
