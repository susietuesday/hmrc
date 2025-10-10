-- Drop existing constraints if they exist
ALTER TABLE IF EXISTS public.property_submissions
  DROP CONSTRAINT IF EXISTS uk_property_period_submissions_pkey,
  DROP CONSTRAINT IF EXISTS user_email_lowercase,
  DROP CONSTRAINT IF EXISTS business_id,
  DROP CONSTRAINT IF EXISTS nino,
  DROP CONSTRAINT IF EXISTS tax_year;

-- Recreate all constraints cleanly
ALTER TABLE public.property_submissions
  ADD CONSTRAINT uk_property_period_submissions_pkey PRIMARY KEY (id),
  ADD CONSTRAINT user_email_lowercase CHECK (email = lower(email)),
  ADD CONSTRAINT business_id CHECK (
    business_id::text ~ '^X[A-Z0-9]{1}IS[0-9]{11}$'
  ) NOT VALID,
  ADD CONSTRAINT nino CHECK (
    nino::text ~ '^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$'
  ) NOT VALID,
  ADD CONSTRAINT tax_year CHECK (
    tax_year::text ~ '^(202[2-9])-([0-9]{2})$'
    AND (SUBSTRING(tax_year FROM 1 FOR 4)::integer + 1)
        = (('20' || SUBSTRING(tax_year FROM 6 FOR 2))::integer)
  ) NOT VALID;
