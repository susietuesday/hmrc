const apiUtils = require('../utils/apiUtils.js');

const services = {
  propertyBusiness: {
    name: 'individuals/business/property',
    version: '6.0',
    routes: {
      createUkPropertyPeriodSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/period/${taxYear}`,
      createUkPropertyCumulativeSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${taxYear}`,
      fetchUkPropertyCumulativeSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/cumulative/${taxYear}`
    }
  }
};

async function createUkPropertyPeriodSummary({ nino, businessId, taxYear, body, session }) {
  const fraudHeaders = apiUtils.getFraudPreventionHeaders(session);
  const accessToken = await apiUtils.getUserRestrictedToken(session.oauth2Token);
  
  const routePath = services.propertyBusiness.routes.createUkPropertyPeriodSummary(nino, businessId, taxYear)

  const extraHeaders = {
    'Gov-Test-Scenario': 'STATEFUL',
    ...fraudHeaders,
  };

  const response = await apiUtils.callApi({
    method: 'POST',
    serviceName: services.propertyBusiness.name,
    serviceVersion: services.propertyBusiness.version,
    routePath,
    bearerToken: accessToken,
    body,
    extraHeaders
  });

  return response;
}

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

  return response;
}

async function fetchUkPropertyCummulativeSummary({ nino, businessId, taxYear, session }) {
  const fraudHeaders = apiUtils.getFraudPreventionHeaders(session);
  const accessToken = await apiUtils.getUserRestrictedToken(session.oauth2Token);
  
  const routePath = services.propertyBusiness.routes.fetchUkPropertyCumulativeSummary(nino, businessId, taxYear)

  const response = await apiUtils.callApi({
    method: 'GET',
    serviceName: services.propertyBusiness.name,
    serviceVersion: services.propertyBusiness.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders: fraudHeaders
  });

  return response;
}

module.exports = {
  createUkPropertyPeriodSummary,
  createUkPropertyCumulativeSummary,
  fetchUkPropertyCummulativeSummary
};