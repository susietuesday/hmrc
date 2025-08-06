const { 
  log, 
  callApi, 
  getApplicationRestrictedToken, 
  getUserRestrictedToken, 
  getFraudPreventionHeaders 
} = require('../utils');

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

async function getHelloWorld(){
  const routePath = testServices.hello.routes.world

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.hello.name,
    serviceVersion: testServices.hello.version,
    routePath
  });

  return response;
};

async function getHelloApplication(){
  const accessToken = await getApplicationRestrictedToken();

  const routePath = testServices.hello.routes.application

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.hello.name,
    serviceVersion: testServices.hello.version,
    routePath,
    bearerToken: accessToken
  });

  return response;
};

async function getHelloUser(req){
  const accessToken = await getUserRestrictedToken(req);

  const routePath = testServices.hello.routes.user

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.hello.name,
    serviceVersion: testServices.hello.version,
    routePath,
    bearerToken: accessToken
  });

  return response;
};

async function getServices(){
  const accessToken = await getApplicationRestrictedToken();

  const response = await callApi({
    method: 'GET',
    serviceName: testServices.createTestUser.name,
    serviceVersion: testServices.createTestUser.version,
    routePath: testServices.createTestUser.routes.individuals,
    bearerToken: accessToken
  });

  return response;
};

module.exports = { 
  testServices,
  getHelloWorld,
  getHelloApplication,
  getHelloUser,
  getServices
};