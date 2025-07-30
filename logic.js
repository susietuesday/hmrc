const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { getApplicationRestrictedToken, getUserRestrictedToken } = require('./utils'); 

const { 
  log, 
  callApi 
} = require('./utils');

const { 
  apiBaseUrl,
  hmrcServices 
} = require('./config'); 

const config = require('./config');
const { ROUTES } = config;

const fetchServices = asyncHandler(async (_req, res) => {

  // Service metadata
  const serviceName = hmrcServices.createTestUser.name
  const serviceVersion = hmrcServices.createTestUser.version
  const routePath = hmrcServices.createTestUser.routes.services

  const accessToken = await getApplicationRestrictedToken();

  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    routePath: routePath,
    serviceVersion: serviceVersion,
    bearerToken: accessToken
  });

  res.status(apiResponse.status).json(apiResponse.body);

});

const createTestUser = asyncHandler(async (req, res) => {

  // Service metadata
  const serviceName = hmrcServices.createTestUser.name
  const serviceVersion = hmrcServices.createTestUser.version
  const routePath = hmrcServices.createTestUser.routes.individuals

  const accessToken = await getApplicationRestrictedToken();

  const apiResponse = await callApi({
    method: 'POST',
    serviceName: serviceName,
    routePath: routePath,
    serviceVersion: serviceVersion,
    bearerToken: accessToken,
    body: { services: ['self-assessment'] }
  });

  res.status(apiResponse.status).json(apiResponse.body);

});

const fetchBusinessList = asyncHandler(async (req, res) => {

  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }

  const accessToken = await getUserRestrictedToken(req, res);

  const serviceName = hmrcServices.businessDetails.name;
  const routePath = hmrcServices.businessDetails.routes.listByNino(nino);
  const serviceVersion = hmrcServices.businessDetails.version;

  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    routePath: routePath,
    serviceVersion: serviceVersion,
    bearerToken: accessToken,
    extraHeaders: {'Gov-Test-Scenario': 'PROPERTY'}
  });

  res.status(apiResponse.status).json(apiResponse.body);

});

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

const createTestUkPropertyBusiness = asyncHandler(async (req, res) => {

  const nino = req.body.nino;

  if (!nino) {
    return res.status(400).send('NINO is required');
  }

  const url = apiBaseUrl + `individuals/self-assessment-test-support/business/${nino}`;
  const accessToken = await getUserRestrictedToken(req);
      
  const data = {
    typeOfBusiness: "uk-property",
    firstAccountingPeriodStartDate: "2021-04-06",
    firstAccountingPeriodEndDate: "2022-04-05",
    latencyDetails: {
      latencyEndDate: "2023-04-06",
      taxYear1: "2021-22",
      latencyIndicator1: "A",
      taxYear2: "2022-23",
      latencyIndicator2: "Q"
    },
    quarterlyTypeChoice: {
      quarterlyPeriodType: "standard",
      taxYearOfChoice: "2022-23"
    },
    accountingType: "CASH",
    commencementDate: "2020-04-06"
    //cessationDate: "2025-04-06"
  };

  try {

    log.info('ℹ️ Url:' + url)
    log.info('ℹ️ Data:' + JSON.stringify(data, null, 2))
    log.info('ℹ️ Access Token:' + accessToken)

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.hmrc.1.0+json',
        'Content-Type': 'application/json'
      }
    });
    console.log('Business created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating test business:', error.response?.data || error.message);
    throw error;
  }
});

const createUkPropertyPeriodSummary = asyncHandler(async (req, res) => {
  if (req.session.oauth2Token) {
 
    const accessToken = client.createToken(req.session.oauth2Token);
    const nino = req.body.nino;
    const businessId = 'XBIS12345678901'
    const taxYear = '2024-25'

    if (!nino) {
      return res.status(400).send('NINO is required');
    }

    serviceName = 'individuals'
    serviceVersion = '6.0'
    const routePath = `/business/property/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/period/${encodeURIComponent(taxYear)}`;
    
    //Log scope
    log.info(`ℹ️ Scope: ${accessToken.token.scope}`);
    log.info('ℹ️ Url: ', routePath);
    
    callApi({
      bearerToken: accessToken,
      serviceVersion,
      serviceName,
      routePath: routePath
    });

  } else {
    req.session.caller = '/periodic-summary';
    res.redirect(authorizationUri);
  }
});

module.exports = { 
  fetchServices, 
  createTestUser, 
  fetchItsaStatus, 
  fetchBusinessList, 
  createTestUkPropertyBusiness, 
  createUkPropertyPeriodSummary
};
