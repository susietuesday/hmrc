const asyncHandler = require('express-async-handler');
const { log, callApi, getApplicationRestrictedToken, getUserRestrictedToken } = require('../utils');

const testServices = {
  hello: {
    name: 'hello',
    version: '1.0',
    routes: {
      world: '/world',
      application: '/application',
      user: '/user'
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
      business: (nino) => `/business/${encodeURIComponent(nino)}` // Create test business
    }
  },
};

function createHelloHandler(routePath) {
  return asyncHandler(async (req, res) => {

    // Service metadata
    const serviceName = testServices.hello.name
    const serviceVersion = testServices.hello.version

    let accessToken

    switch (routePath) {
      case '/world':
        // No access token required
        break;

      case '/application':
        accessToken = await getApplicationRestrictedToken();
        break;

      case '/user':
        accessToken = await getUserRestrictedToken(req);
        break;
    }
    
    const apiResponse = await callApi({
      method: 'GET',
      serviceName: serviceName,
      routePath: routePath,
      serviceVersion: serviceVersion,
      bearerToken: accessToken
    });

    res.status(apiResponse.status).json(apiResponse.body);
  });
}

const fetchServices = asyncHandler(async (_req, res) => {

  // Service metadata
  const serviceName = testServices.createTestUser.name
  const serviceVersion = testServices.createTestUser.version
  const routePath = testServices.createTestUser.routes.services

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
  const serviceName = testServices.createTestUser.name
  const serviceVersion = testServices.createTestUser.version
  const routePath = testServices.createTestUser.routes.individuals

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


module.exports = {
    testServices,
    fetchServices, 
    createTestUser, 
    createHelloHandler,
    createTestUkPropertyBusiness
};