const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log("Prisma loaded");

const apiUtils = require('../utils/apiUtils.js');

const services = {
  propertyBusiness: {
    name: 'individuals/business/property',
    version: '6.0',
    routes: {
      createUkPropertyCumulativeSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${taxYear}`,
      fetchUkPropertyCumulativeSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${taxYear}`
    }
  }
};

async function createUkPropertyCumulativeSummary({ nino, businessId, taxYear, body, context }) {
  const fraudHeaders = apiUtils.getFraudPreventionHeaders(context);
  const accessToken = await apiUtils.getUserRestrictedToken(context.oauth2Token);
  
  const routePath = services.propertyBusiness.routes.createUkPropertyCumulativeSummary(nino, businessId, taxYear)

  const extraHeaders = {
    'Gov-Test-Scenario': 'STATEFUL',
    ...fraudHeaders,
  };

  const response = await apiUtils.callApi({
    method: 'PUT',
    serviceName: services.propertyBusiness.name,
    serviceVersion: services.propertyBusiness.version,
    routePath,
    bearerToken: accessToken,
    body,
    extraHeaders
  });

  createUkPropertyPeriodSubmission(nino, businessId, taxYear, body, response)
    .catch((e) => {
      console.error("Error creating submission:", e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return response;
}

async function createUkPropertyPeriodSubmission(nino, businessId, taxYear, body, response) {
  const submission = await prisma.uk_property_period_submissions.create({
    data: {
      request_body: {
        body
      },
      response_code: 200, // optional
      response_body: {
        response
      },
      nino: nino, // must match length 9
      business_id: businessId, // max length 20
      tax_year: taxYear, // length 7
    },
  });

  console.log("New submission created:", submission);
};

async function fetchUkPropertyCummulativeSummary({ nino, businessId, taxYear, context }) {
  const fraudHeaders = apiUtils.getFraudPreventionHeaders(context);
  const accessToken = await apiUtils.getUserRestrictedToken(context.oauth2Token);
  
  const routePath = services.propertyBusiness.routes.fetchUkPropertyCumulativeSummary(nino, businessId, taxYear)

  const extraHeaders = {
    'Gov-Test-Scenario': 'STATEFUL',
    ...fraudHeaders,
  };

  const response = await apiUtils.callApi({
    method: 'GET',
    serviceName: services.propertyBusiness.name,
    serviceVersion: services.propertyBusiness.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders
  });

  return response;
}

module.exports = {
  createUkPropertyCumulativeSummary,
  fetchUkPropertyCummulativeSummary
};