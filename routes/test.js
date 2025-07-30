const { log, callApi, getApplicationRestrictedToken, getUserRestrictedToken } = require('../utils');
const asyncHandler = require('express-async-handler');
const { AuthorizationCode } = require('simple-oauth2');

// Environment variables
const {
  OAUTH_SCOPE,
  REDIRECT_URI,
  oauthConfig,
  hmrcServices,
} = require('../config');

const client = new AuthorizationCode(oauthConfig);
const authorizationUri = client.authorizeURL({
  redirect_uri: REDIRECT_URI,
  scope: OAUTH_SCOPE,
});

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

module.exports = {
    testServices,
    fetchServices, 
    createTestUser, 
    createHelloHandler
};