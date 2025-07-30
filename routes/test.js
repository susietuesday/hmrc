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

function createHelloHandler(routePath) {
  return asyncHandler(async (req, res) => {

    // Service metadata
    const serviceName = hmrcServices.hello.name
    const serviceVersion = hmrcServices.hello.version

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

module.exports = {
  createHelloHandler
};