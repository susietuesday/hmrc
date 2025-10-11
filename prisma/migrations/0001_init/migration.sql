-- CreateTable
CREATE TABLE "property_submissions" (
    "id" BIGSERIAL NOT NULL,
    "request_body" JSONB NOT NULL,
    "response_code" INTEGER,
    "response_body" JSONB,
    "nino" VARCHAR(9) NOT NULL,
    "business_id" VARCHAR(20) NOT NULL,
    "tax_year" VARCHAR(7) NOT NULL,

    CONSTRAINT "property_submissions_pkey" PRIMARY KEY ("id")
);

