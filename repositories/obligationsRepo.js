const utils = require('../utils/utils');

const services = {
  obligations: {
    name: 'obligations',
    version: '3.0',
    routes: {
      incomeAndExpenditure: (nino) => `/details/${encodeURIComponent(nino)}/income-and-expenditure`,
      endOfPeriodStatement: (nino) => `/details/${encodeURIComponent(nino)}/end-of-period-statement`,
      crystallisation: (nino) => `/details/${encodeURIComponent(nino)}/crystallisation`
    }
  }
};

async function fetchIncomeAndExpenditureObligations(nino, params, req) {
  const fraudHeaders = utils.getFraudPreventionHeaders(req);
  const accessToken = await utils.getUserRestrictedToken(req);

  const routePath = services.obligations.routes.incomeAndExpenditure(nino);

  const extraHeaders = {
    'Gov-Test-Scenario': 'DYNAMIC',
    ...fraudHeaders,
  };

  const response = await utils.callApi({
    method: 'GET',
    serviceName: services.obligations.name,
    serviceVersion: services.obligations.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders,
    params
  });

  return response;
}

module.exports = {
  fetchIncomeAndExpenditureObligations,
};
