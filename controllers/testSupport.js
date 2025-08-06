const asyncHandler = require('express-async-handler');

const { 
  getHelloWorld, 
  getHelloApplication, 
  getHelloUser, 
  getServices,
  postTestUser,
  postTestItsaStatus,
  postTestUkPropertyBusiness,
  validateFraudHeaders
} = require('../services/testSupportService');

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

  const apiResponse = await postTestUser({ body: { serviceNames } });
  return res.status(apiResponse.status).json(apiResponse.body);
});

const createTestItsaStatus = asyncHandler(async (req, res) => {
  const { nino, taxYear } = req.body;

  const body = {
    itsaStatusDetails: [
      {
        submittedOn: "2025-07-01T10:00:00.000Z",
        status: "MTD Mandated",
        statusReason: "MTD ITSA Opt-In",
        businessIncome2YearsPrior: 60000.00
      }
    ]
  };

  const apiResponse = await postTestItsaStatus({ req, nino, taxYear, body });
  return res.status(apiResponse.status).json(apiResponse.body);
});

const createTestUkPropertyBusiness = asyncHandler(async (req, res) => {
  const { nino } = req.body;

  if (!nino) {
    return res.status(400).send('NINO is required');
  }

  const body = {
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

  const apiResponse = await postTestUkPropertyBusiness({ req, nino, body });
  return res.status(apiResponse.status).json(apiResponse.body);
});

const validateFraudPreventionHeaders = asyncHandler(async (req, res) => {
  const fraudHeaders = getFraudPreventionHeaders(req);
  const apiResponse = await validateFraudHeaders(fraudHeaders);
  return res.status(apiResponse.status).json(apiResponse.body);
});

module.exports = {
    fetchHelloWorld,
    fetchHelloApplication,
    fetchHelloUser,
    validateFraudPreventionHeaders,
    fetchServices, 
    createTestUser, 
    createTestItsaStatus,
    createTestUkPropertyBusiness
};