const { 
  callApi, 
  getApplicationRestrictedToken, 
  getUserRestrictedToken 
} = require('../utils/utils');

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

async function fetchHelloWorld(){
  const response = await callApi({
    method: 'GET',
    serviceName: testServices.hello.name,
    serviceVersion: testServices.hello.version,
    routePath: testServices.hello.routes.world
  });

  return response;
};

async function fetchHelloApplication(){
  const accessToken = await getApplicationRestrictedToken();

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.hello.name,
    serviceVersion: testServices.hello.version,
    routePath: testServices.hello.routes.application,
    bearerToken: accessToken
  });

  return response;
};

async function fetchHelloUser(req){
  const accessToken = await getUserRestrictedToken(req);

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.hello.name,
    serviceVersion: testServices.hello.version,
    routePath: testServices.hello.routes.user,
    bearerToken: accessToken
  });

  return response;
};

async function fetchServices(){
  const accessToken = await getApplicationRestrictedToken();

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.createTestUser.name,
    serviceVersion: testServices.createTestUser.version,
    routePath: testServices.createTestUser.routes.services,
    bearerToken: accessToken
  });

  return response;
};

async function createTestUser({ body }){
  const accessToken = await getApplicationRestrictedToken();

  const response = await callApi({
    method: 'POST',
    serviceName: testServices.createTestUser.name,
    serviceVersion: testServices.createTestUser.version,
    routePath: testServices.createTestUser.routes.individuals,
    bearerToken: accessToken,
    body: body
  });

  return response;
};

async function createTestItsaStatus({ req, nino, taxYear, body }) {
  const accessToken = await getUserRestrictedToken(req);

  const response = await callApi({
    method: 'POST',
    serviceName: testServices.selfAssessmentTestSupport.name,
    serviceVersion: testServices.selfAssessmentTestSupport.version,
    routePath: testServices.selfAssessmentTestSupport.routes.itsaStatus(nino, taxYear),
    bearerToken: accessToken,
    body: body
  });

  return response;
}

async function createTestUkPropertyBusiness({ req, nino, body }) {
  const accessToken = await getUserRestrictedToken(req);

  const response = await callApi({
    method: 'POST',
    serviceName: testServices.selfAssessmentTestSupport.name,
    serviceVersion: testServices.selfAssessmentTestSupport.version,
    routePath: testServices.selfAssessmentTestSupport.routes.business(nino),
    bearerToken: accessToken,
    body
  });

  return response;
}

async function validateFraudHeaders(extraHeaders) {
  const accessToken = await getApplicationRestrictedToken();
  
  const response = await callApi({
    method: 'GET',
    serviceName: testServices.testFraudPreventionHeaders.name,
    serviceVersion: testServices.testFraudPreventionHeaders.version,
    routePath: testServices.testFraudPreventionHeaders.routes.validate,
    bearerToken: accessToken,
    extraHeaders
  });

  return response;
}

module.exports = { 
  testServices,
  fetchHelloWorld,
  fetchHelloApplication,
  fetchHelloUser,
  fetchServices,
  createTestUser,
  createTestItsaStatus,
  createTestUkPropertyBusiness,
  validateFraudHeaders
};