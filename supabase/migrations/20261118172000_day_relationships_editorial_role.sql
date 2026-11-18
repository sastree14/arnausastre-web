-- Editorial correspondents are neither customers nor technical/commercial delivery partners.
-- Keep the existing roles, RLS policies and associated task/voice-note joins intact.
ALTER TABLE public.day_relationships DROP CONSTRAINT IF EXISTS day_relationships_role_check;
ALTER TABLE public.day_relationships ADD CONSTRAINT day_relationships_role_check
  CHECK (role IN ('client','collaborator','worker','editorial'));
