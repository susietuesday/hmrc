const axios = require('axios');
const { createLogger, format, transports } = require('winston');
const dateFormat = require('dateformat');
const { AuthorizationCode, ClientCredentials } = require('simple-oauth2');

// Environment variables
const {
  OAUTH_SCOPE,
  REDIRECT_URI,
  oauthConfig,
  apiBaseUrl,
  getAcceptHeader
} = require('./config');

const client = new AuthorizationCode(oauthConfig);
const authorizationUri = client.authorizeURL({
  redirect_uri: REDIRECT_URI,
  scope: OAUTH_SCOPE,
});

function requireUser(req, res, next) {
  const tokenData = req.session.oauth2Token;

  if (!tokenData) {
    req.session.caller = req.originalUrl;
    return res.redirect(authorizationUri);  // Redirect to HMRC login
  }

  const accessToken = client.createToken(tokenData);

  if (accessToken.expired()) {
    req.session.oauth2Token = null;
    return res.redirect(authorizationUri);
  }

  req.accessToken = accessToken.token.access_token; // Attach it to req for later use
  next();
}

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
    req.session.caller = '/userCall';
    throw new Error('User is not logged in');
  }

  const accessToken = client.createToken(tokenData);

  if (accessToken.expired()) {
    req.session.oauth2Token = null;
    throw new Error('User access token has expired');
  }

  return accessToken.token.access_token;
}

// Create logger
const log = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: () => dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
    }),
    format.errors({ stack: true }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    format.printf(({ timestamp, level, message, metadata }) => {
      const msgString = typeof message === 'object'
        ? JSON.stringify(message, null, 2)
        : message;

      const metaString = Object.keys(metadata).length
        ? `\n${JSON.stringify(metadata, null, 2)}`
        : '';

      return `${timestamp} ${level.toUpperCase()} ${msgString}${metaString}`;
    })
  ),
  transports: [
    new transports.Console()
  ]
});

// Call API
const callApi = async ({
  method = 'GET',
  serviceName,
  serviceVersion,
  routePath,
  bearerToken = null,
  extraHeaders = {},
  body = null
}) => {
  
  /*
  // Set defaults
  serviceName = serviceName || hmrcServices.hello.name;
  serviceVersion = serviceVersion || hmrcServices.hello.version;
  */
 
  const acceptHeader = getAcceptHeader(serviceVersion);
  const url = apiBaseUrl + serviceName + routePath;
  
  log.info(`Calling ${url} with Accept: ${acceptHeader}`);
  
  const headers = {
    Accept: acceptHeader,
    ...extraHeaders
  };

  if (bearerToken) {
    log.info(`Using bearer token: ${bearerToken}`);
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  const axiosConfig = { headers };

  let response;

  if (method === 'GET') {
    response = await axios.get(url, axiosConfig);

  } else {
    response = await axios.request({
      method,
      url,
      data: body,
      ...axiosConfig
    });
  }

  log.info('API call succeeded', {
    status: response.status,
    body: response.data
  });

  return {
    status: response.status,
    body: response.data
  };
  
}

module.exports = { 
  log,
  callApi,
  requireUser,
  getApplicationRestrictedToken,
  getUserRestrictedToken
};