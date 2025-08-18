const apiUtils = require('../utils/apiUtils.js');

const services = {
  propertyBusiness: {
    name: 'individuals/business/property',
    version: '6.0',
    routes: {
      createUkPropertyPeriodSummary: (nino, businessId, taxYear) => `/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/period/${taxYear}`
    }
  }
};

async function createUkPropertyPeriodSummary({ req, nino, businessId, taxYear, body }) {
  const fraudHeaders = utils.getFraudPreventionHeaders(req);
  const routePath = services.propertyBusiness.routes.createUkPropertyPeriodSummary(nino, businessId, taxYear)

  const accessToken = await apiUtils.getUserRestrictedToken(req);

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

module.exports = {
  createUkPropertyPeriodSummary,
};