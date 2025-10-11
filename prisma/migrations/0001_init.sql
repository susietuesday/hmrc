-- Table: public.property_submissions

-- DROP TABLE IF EXISTS public.property_submissions;

CREATE TABLE IF NOT EXISTS public.property_submissions
(
    id bigint NOT NULL,
    request_body jsonb NOT NULL,
    response_code integer,
    response_body jsonb,
    nino character varying(9) COLLATE pg_catalog."default" NOT NULL,
    business_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
    tax_year character varying(7) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT uk_property_period_submissions_pkey PRIMARY KEY (id),
    CONSTRAINT business_id CHECK (business_id::text ~ '^X[A-Z0-9]{1}IS[0-9]{11}$'::text) NOT VALID,
    CONSTRAINT nino CHECK (nino::text ~ '^[A-CEGHJ-PR-TW-Z]{2}[0-9]{6}[A-D]$'::text) NOT VALID,
    CONSTRAINT tax_year CHECK (tax_year::text ~ '^(202[2-9])-([0-9]{2})$'::text AND (SUBSTRING(tax_year FROM 1 FOR 4)::integer + 1) = (('20'::text || SUBSTRING(tax_year FROM 6 FOR 2))::integer)) NOT VALID
)

TABLESPACE pg_default;
    
--ALTER TABLE IF EXISTS public.property_submissions
--    OWNER to postgres;