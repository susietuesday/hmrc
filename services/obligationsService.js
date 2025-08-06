const {
    getUserRestrictedToken,
    callApi 
} = require('../utils');

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

async function fetchIncomeAndExpenditureObligations(req, nino) {
  const fraudHeaders = getFraudPreventionHeaders(req);
  const accessToken = await getUserRestrictedToken(req);

  const routePath = services.obligations.routes.incomeAndExpenditure(nino);

  const response = await callApi({
    method: 'GET',
    serviceName: services.obligations.name,
    serviceVersion: services.obligations.version,
    routePath,
    bearerToken: accessToken,
    extraHeaders: fraudHeaders
  });

  return response;
}

module.exports = {
  fetchIncomeAndExpenditureObligations,
};
