ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS proposal_number text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS company_name text;

CREATE OR REPLACE FUNCTION public.generate_proposal_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  candidate text;
BEGIN
  LOOP
    candidate := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.proposals WHERE proposal_number = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

UPDATE public.proposals SET proposal_number = public.generate_proposal_number() WHERE proposal_number IS NULL;

CREATE OR REPLACE FUNCTION public.set_proposal_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
    NEW.proposal_number := public.generate_proposal_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_proposal_number_trigger ON public.proposals;
CREATE TRIGGER set_proposal_number_trigger
BEFORE INSERT ON public.proposals
FOR EACH ROW EXECUTE FUNCTION public.set_proposal_number();

CREATE UNIQUE INDEX IF NOT EXISTS proposals_proposal_number_key ON public.proposals (proposal_number);