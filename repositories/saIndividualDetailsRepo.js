const apiUtils = require('../utils/apiUtils.js');

const services = {
  selfAssessmentIndividualDetails: {
    name: 'individuals/person',
    version: '2.0',
    routes: {
      itsaStatus: (nino, taxYear) => `/itsa-status/${encodeURIComponent(nino)}/${encodeURIComponent(taxYear)}`
    }
  }
};

async function fetchItsaStatus({nino, taxYear, context}) {
  const fraudHeaders = apiUtils.getFraudPreventionHeaders(context);
  const accessToken = await apiUtils.getUserRestrictedToken(context.oauth2Token);

  const routePath = services.selfAssessmentIndividualDetails.routes.itsaStatus(nino, taxYear);

  const extraHeaders = {
    'Gov-Test-Scenario': 'STATEFUL',
    ...fraudHeaders,
  };

  const response = await apiUtils.callApi({
    method: 'GET',
    serviceName: services.selfAssessmentIndividualDetails.name,
    serviceVersion: services.selfAssessmentIndividualDetails.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders,
  });

  return response;
}

module.exports = { fetchItsaStatus };