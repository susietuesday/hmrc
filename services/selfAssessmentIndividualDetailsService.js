const { 
    getFraudPreventionHeaders,
    getUserRestrictedToken,
    callApi 
} = require('../utils');

const services = {
  selfAssessmentIndividualDetails: {
    name: 'individuals/person',
    version: '2.0',
    routes: {
      itsaStatus: (nino, taxYear) => `/itsa-status/${encodeURIComponent(nino)}/${encodeURIComponent(taxYear)}`
    }
  }
};

async function fetchItsaStatus(nino, taxYear, req) {
  const fraudHeaders = getFraudPreventionHeaders(req);
  const accessToken = await getUserRestrictedToken(req);

  const routePath = services.selfAssessmentIndividualDetails.routes.itsaStatus(nino, taxYear);

  const extraHeaders = {
    'Gov-Test-Scenario': 'STATEFUL',
    ...fraudHeaders,
  };

  const response = await callApi({
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