const asyncHandler = require('express-async-handler');
const { log, callApi, getUserRestrictedToken } = require('../utils');

const services = {
  obligations: {
    name: 'obligations',
    version: '3.0',
    routes: {
      incomeAndExpenditure: (nino) => `/details/${encodeURIComponent(nino)}/income-and-expenditure`,
      crystallisation: (nino) => `/details/${encodeURIComponent(nino)}/crystallisation`,
      endOfPeriodStatement: (nino) => `/details/${encodeURIComponent(nino)}/end-of-period-statement`
    }
  }
};

const fetchIncomeAndExpenditureObligations = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  const accessToken = await getUserRestrictedToken(req);
  const serviceName = services.obligations.name;
  const serviceVersion = services.obligations.version;
  const routePath = services.obligations.routes.incomeAndExpenditure(nino);
  
  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken
  });
  
  return res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  fetchIncomeAndExpenditureObligations
};