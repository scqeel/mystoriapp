-- Add support contact fields to agent_profiles
ALTER TABLE public.agent_profiles
  ADD COLUMN IF NOT EXISTS support_whatsapp text,
  ADD COLUMN IF NOT EXISTS support_phone text;
