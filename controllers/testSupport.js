const asyncHandler = require('express-async-handler');

const { 
  getHelloWorld, 
  getHelloApplication, 
  getHelloUser, 
  getServices
} = require('../services/testSupportService');

const { 
  log, 
  callApi, 
  getApplicationRestrictedToken, 
  getUserRestrictedToken, 
  getFraudPreventionHeaders 
} = require('../utils');

const testServices = {
  testFraudPreventionHeaders: {
    name: 'test/fraud-prevention-headers',
    version: '1.0',
    routes: {
      validate: '/validate'//,
      //feedback: `/${encodeURIComponent(api)}/validation-feedback`
    }
  },
  createTestUser: {
    name: 'create-test-user',
    version: '1.0',
    routes: {
      individuals: '/individuals',
      organisations: '/organisations',
      agents: '/agents',
      services: '/services'
    }
  },
  selfAssessmentTestSupport: {
    name: 'individuals/self-assessment-test-support',
    version: '1.0',
    routes: {
      business: (nino) => `/business/${encodeURIComponent(nino)}`, // Create test business
      itsaStatus: (nino, taxYear) => `/itsa-status/${encodeURIComponent(nino)}/${encodeURIComponent(taxYear)}`  // Create/amend test ITSA status
    }
  },
};

const fetchHelloWorld = asyncHandler(async (_req, res) => {
  const apiResponse = await getHelloWorld();
  return res.status(apiResponse.status).json(apiResponse.body);
});

const fetchHelloApplication = asyncHandler(async (_req, res) => {
  const apiResponse = await getHelloApplication();
  return res.status(apiResponse.status).json(apiResponse.body);
});

const fetchHelloUser = asyncHandler(async (_req, res) => {
  const apiResponse = await getHelloUser(req);
  return res.status(apiResponse.status).json(apiResponse.body);
});

const fetchServices = asyncHandler(async (_req, res) => {
  const apiResponse = await getServices();
  return res.status(apiResponse.status).json(apiResponse.body);
});

const createTestUser = asyncHandler(async (req, res) => {

  // Service metadata
  const serviceName = testServices.createTestUser.name
  const serviceVersion = testServices.createTestUser.version
  const routePath = testServices.createTestUser.routes.individuals

  const serviceNames = [
    "national-insurance",
    "self-assessment",
    "mtd-income-tax"
    //"customs-services",
    //"goods-vehicle-movements",
    //"import-control-system",
    //"mtd-vat",
    //"common-transit-convention-traders",
    //"common-transit-convention-traders-legacy"
  ];

  const accessToken = await getApplicationRestrictedToken();

  const apiResponse = await callApi({
    method: 'POST',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken,
    body: { serviceNames: serviceNames }
  });

  res.status(apiResponse.status).json(apiResponse.body);

});

const createTestItsaStatus = asyncHandler(async (req, res) => {
  const nino = req.body.nino;
  const taxYear = req.body.taxYear;

  const serviceName = testServices.selfAssessmentTestSupport.name
  const serviceVersion = testServices.selfAssessmentTestSupport.version
  const routePath = testServices.selfAssessmentTestSupport.routes.itsaStatus(nino, taxYear)
  const accessToken = await getUserRestrictedToken(req);

  const data = {
    "itsaStatusDetails": [
      {
        "submittedOn": "2025-07-01T10:00:00.000Z",
        "status": "MTD Mandated",
        "statusReason": "MTD ITSA Opt-In",
        "businessIncome2YearsPrior": 60000.00
      }
    ]
  }

  const apiResponse = await callApi({
    method: 'POST',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken,
    body: data
  });

  return res.status(apiResponse.status).json(apiResponse.body);
});

const createTestUkPropertyBusiness = asyncHandler(async (req, res) => {

  const nino = req.body.nino;

  if (!nino) {
    return res.status(400).send('NINO is required');
  }

  const serviceName = testServices.selfAssessmentTestSupport.name
  const serviceVersion = testServices.selfAssessmentTestSupport.version
  const routePath = testServices.selfAssessmentTestSupport.routes.business(nino)
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
  log.info('ℹ️ Data:' + JSON.stringify(data, null, 2))

  
  const apiResponse = await callApi({
    method: 'POST',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken,
    body: data
  });

  return res.status(apiResponse.status).json(apiResponse.body);
  
});

const validateFraudPreventionHeaders = asyncHandler(async (req, res) => {
  const serviceName = testServices.testFraudPreventionHeaders.name
  const serviceVersion = testServices.testFraudPreventionHeaders.version
  const routePath = testServices.testFraudPreventionHeaders.routes.validate
  const accessToken = await getApplicationRestrictedToken();

  const fraudHeaders = getFraudPreventionHeaders(req);

  const apiResponse = await callApi({
    method: 'GET',
    serviceName: serviceName,
    serviceVersion: serviceVersion,
    routePath: routePath,
    bearerToken: accessToken,
    extraHeaders: fraudHeaders
  });

  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = {
    testServices,
    fetchHelloWorld,
    fetchHelloApplication,
    fetchHelloUser,
    validateFraudPreventionHeaders,
    fetchServices, 
    createTestUser, 
    createTestItsaStatus,
    createTestUkPropertyBusiness
};