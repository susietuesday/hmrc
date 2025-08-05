const asyncHandler = require('express-async-handler');
const { log, callApi, getUserRestrictedToken } = require('../utils');

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

const fetchIncomeAndExpenditureObligations = asyncHandler(async(req, res) => {
  // Get query parameters
  const nino = req.query.nino;

   // Set fraud headers and access token
  const fraudHeaders = getFraudPreventionHeaders(req);
  const accessToken = await getUserRestrictedToken(req);

  // Set service details
  const serviceName = services.obligations.name;
  const serviceVersion = services.obligations.version;
  const routePath = services.obligations.routes.incomeAndExpenditure(nino);
  
  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken,
    extraHeaders: fraudHeaders
  });
  
  return res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  fetchIncomeAndExpenditureObligations
};