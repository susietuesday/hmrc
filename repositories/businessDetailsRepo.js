const utils = require('../utils/utils');

const businessDetailsServices = {
  businessDetails: {
    name: 'individuals/business/details',
    version: '1.0',
    routes: {
      listByNino: (nino) => `/${encodeURIComponent(nino)}/list`
    }
  }
};

async function fetchBusinessDetailsList({ req, nino }) {
  const accessToken = await utils.getUserRestrictedToken(req);
  const routePath = businessDetailsServices.businessDetails.routes.listByNino(nino);

  const response = await utils.callApi({
    method: 'GET',
    serviceName: businessDetailsServices.businessDetails.name,
    serviceVersion: businessDetailsServices.businessDetails.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders: { 'Gov-Test-Scenario': 'STATEFUL' }
  });

  return response;
};

module.exports = { fetchBusinessDetailsList }