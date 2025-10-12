-- Drop existing constraints if they exist
ALTER TABLE IF EXISTS public.property_submissions
  DROP CONSTRAINT IF EXISTS prop_subs_business_id_check,
  DROP CONSTRAINT IF EXISTS prop_subs_nino_check,
  DROP CONSTRAINT IF EXISTS prop_subs_tax_year_check;

-- Recreate all constraints cleanly
ALTER TABLE public.property_submissions
  ADD CONSTRAINT prop_subs_business_id_check CHECK (
    business_id::text ~ '^X[A-Z0-9]{1}IS[0-9]{11}$'
  ) NOT VALID,
  ADD CONSTRAINT prop_subs_nino_check CHECK (
    nino::text ~ '^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$'
  ) NOT VALID,
  ADD CONSTRAINT prop_subs_tax_year_check CHECK (
    tax_year::text ~ '^(202[2-9])-([0-9]{2})$'
    AND (SUBSTRING(tax_year FROM 1 FOR 4)::integer + 1)
        = (('20' || SUBSTRING(tax_year FROM 6 FOR 2))::integer)
  ) NOT VALID;
