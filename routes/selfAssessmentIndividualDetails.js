const asyncHandler = require('express-async-handler');

const { 
  log, 
  callApi,
  getUserRestrictedToken
} = require('../utils');

const hmrcServices = {
  selfAssessmentIndividualDetails: {
    name: 'individuals/person',
    version: '2.0',
    routes: {
      itsaStatus: (nino, taxYear) => `/itsa-status/${encodeURIComponent(nino)}/${encodeURIComponent(taxYear)}`
    }
  }
};

/*
Statuses
--------------
No Status
MTD Mandated
MTD Voluntary
Annual
Non Digital
Dormant
MTD Exempt

Status reasons
---------------
Sign up - return available
Sign up - no return available
ITSA final declaration
ITSA Q4 declaration
CESA SA return
Complex
Ceased income source
Reinstated income source
Rollover
Income Source Latency Changes
MTD ITSA Opt-Out
MTD ITSA Opt-In
Digitally Exempt
*/
const fetchItsaStatus = asyncHandler(async(req, res) => {
  const nino = req.query.nino;
  const taxYear = req.query.taxYear;
  const accessToken = await getUserRestrictedToken(req);
  const serviceName = hmrcServices.selfAssessmentIndividualDetails.name;
  const serviceVersion = hmrcServices.selfAssessmentIndividualDetails.version;
  const routePath = hmrcServices.selfAssessmentIndividualDetails.routes.itsaStatus(nino, taxYear);
  
  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken
  });

  res.status(apiResponse.status).json(apiResponse.body);
})

module.exports = { 
  fetchItsaStatus
};