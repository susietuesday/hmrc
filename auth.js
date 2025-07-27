const axios = require('axios');
const { AuthorizationCode, ClientCredentials } = require('simple-oauth2');
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

const client = new AuthorizationCode(oauthConfig);
const authorizationUri = client.authorizeURL({
  redirect_uri: REDIRECT_URI,
  scope: OAUTH_SCOPE,
});

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

async function getUserRestrictedToken(req) {
  const tokenData = req.session.oauth2Token;

  if (!tokenData) {
    return null;
  }

  const accessToken = client.createToken(tokenData);

  if (accessToken.expired()) {
    req.session.oauth2Token = null;
    return null;
  }

  return accessToken.token.access_token;
}

function createHelloHandler(routePath) {
  return asyncHandler(async (req, res) => {

    // Service metadata
    const serviceName = 'hello'
    const serviceVersion = '1.0'

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
        if (!accessToken) {
          req.session.caller = '/userCall';
          return res.redirect(authorizationUri);
        }
        break;
    }
    
    const apiResponse = await callApi({
      bearerToken: accessToken,
      serviceVersion,
      serviceName,
      routePath
    });

    res.status(apiResponse.status).json(apiResponse.body);
  });
}

// Call API
async function callApi({
  bearerToken = null,
  serviceVersion = '1.0',
  serviceName = 'hello',
  routePath
}) {
  
  const acceptHeader = `application/vnd.hmrc.${serviceVersion}+json`;
  const url = apiBaseUrl + serviceName + routePath;
  
  log.info(`Calling ${url} with Accept: ${acceptHeader}`);
  
  const headers = {
    Accept: acceptHeader
  };

  if (bearerToken) {
    log.info(`Using bearer token: ${bearerToken}`);
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  const response = await axios.get(url, { headers });

  return {
    status: response.status,
    body: response.data
  };
}

module.exports = {
  getApplicationRestrictedToken,
  getUserRestrictedToken,
  createHelloHandler,
  callApi
};