const request = require('superagent');
const { ClientCredentials } = require('simple-oauth2');
const { log } = require('./utils');
const asyncHandler = require('express-async-handler');

// Environment variables
const {
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_SCOPE,
  REDIRECT_URI,
  apiBaseUrl,
  oauthConfig,
} = require('./config');

async function getApplicationRestrictedToken() {
  const config = {
    ...oauthConfig,
    options: {
      authorizationMethod: 'body'
    }
  };

  const clientCredentials = new ClientCredentials(config);

  const tokenResponse = await clientCredentials.getToken({ scope: OAUTH_SCOPE });
  return tokenResponse.token.access_token;
}

function createApiRoute(resource) {
  return asyncHandler(async (req, res) => {
    // Service metadata
    let serviceName = 'hello'
    let serviceVersion = '1.0'

    const accessToken = await getApplicationRestrictedToken();
    const apiResponse = await callApi({
      bearerToken: accessToken,
      apiBaseUrl,
      serviceName,
      serviceVersion,
      resource
    });

    res.status(apiResponse.status).json(apiResponse.body);
  });
}

// Call API
function callApi({
  res,
  bearerToken = null,
  serviceName = 'hello',
  serviceVersion = '1.0',
  resource
}) {
  
  return new Promise((resolve, reject) => {

    const acceptHeader = `application/vnd.hmrc.${serviceVersion}+json`;
    const url = apiBaseUrl + serviceName + resource;
    
    log.info(`Calling ${url} with Accept: ${acceptHeader}`);
    
    const req = request
      .get(url)
      .accept(acceptHeader);

    if (bearerToken) {
      log.info(`Using bearer token: ${bearerToken}`);
      req.set('Authorization', `Bearer ${bearerToken}`);
    }

    //req.end((err, apiResponse) => handleResponse(res, err, apiResponse));
    req.end((err, apiResponse) => {
      if (err || !apiResponse.ok) {
        const error = err || new Error(`API responded with status ${apiResponse.status}`);
        return reject(error);
      }
      resolve({
        status: apiResponse.status,
        body: apiResponse.body
      });
    });
  });
}

module.exports = {
  getApplicationRestrictedToken,
  createApiRoute,
  callApi
};