const request = require('superagent');
const winston = require('winston');
const dateFormat = require('dateformat');

const { ClientCredentials } = require('simple-oauth2');
const { oauthConfig, OAUTH_SCOPE } = require('./config'); // adjust path if needed


const log = winston.createLogger({
  //level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => dateFormat(new Date(), "isoDateTime")
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} ${level.toUpperCase()} ${message} ${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Helper functions
function callApi({
  res,
  bearerToken = null,
  apiBaseUrl,
  serviceName = 'hello',
  serviceVersion = '1.0',
  resource
}) {
  
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

    req.end((err, apiResponse) => handleResponse(res, err, apiResponse));
}

function handleResponse(res, err, apiResponse) {
  if (res.headersSent) {
    log.warn("Attempted to send a response, but headers already sent.");
    return;
  }

  if (err || !apiResponse.ok) {
    log.error('API call error', {
      error: err ? err.message || err : 'Unknown error',
      stack: err ? err.stack : 'No stack available',
      status: apiResponse ? apiResponse.status : 'No status'
    });

    const statusCode = (apiResponse && !apiResponse.ok) ? apiResponse.status : 500;
    const errorMessage = err ? err.message : 'API request failed';

    res.status(statusCode).json({ error: errorMessage });
  } else {
    res.json(apiResponse.body);
  }
}

async function getApplicationRestrictedToken() {
  const config = {
    ...oauthConfig,
    options: { authorizationMethod: 'body' }
  };

  const clientCredentials = new ClientCredentials(config);

  try {
    const tokenResponse = await clientCredentials.getToken({ scope: OAUTH_SCOPE });
    return tokenResponse.token.access_token;
  } catch (error) {
    log.error("❌ Error fetching token:", error.message || error);
    throw new Error('Authentication failed');
  }
}

module.exports = { log, callApi, getApplicationRestrictedToken };
