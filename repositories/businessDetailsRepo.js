const apiUtils = require('../utils/apiUtils.js');

const businessDetailsServices = {
  businessDetails: {
    name: 'individuals/business/details',
    version: '1.0',
    routes: {
      listByNino: (nino) => `/${encodeURIComponent(nino)}/list`
    }
  }
};

async function fetchBusinessDetailsList({ nino, session }) {
  const fraudHeaders = apiUtils.getFraudPreventionHeaders(session);
  const accessToken = await apiUtils.getUserRestrictedToken(session.oauth2Token);
  const routePath = businessDetailsServices.businessDetails.routes.listByNino(nino);

  const extraHeaders = {
    'Gov-Test-Scenario': 'STATEFUL',
    ...fraudHeaders
  };

  const response = await apiUtils.callApi({
    method: 'GET',
    serviceName: businessDetailsServices.businessDetails.name,
    serviceVersion: businessDetailsServices.businessDetails.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders
  });

  return response;
};

module.exports = { fetchBusinessDetailsList }