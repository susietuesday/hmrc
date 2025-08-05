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
  getAcceptHeader,
  GOV_CLIENT_CONNECTION_METHOD,
  GOV_VENDOR_PUBLIC_IP,
  GOV_VENDOR_PRODUCT_NAME,
  GOV_VENDOR_PRODUCT_VERSION
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
  const acceptHeader = getAcceptHeader(serviceVersion);
  const url = apiBaseUrl + serviceName + routePath;

  log.info(`Calling: ${url}`);

  const headers = {
    Accept: acceptHeader,
    ...extraHeaders
  };

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`;
  }

  if (body && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  
  log.info('Request headers:', headers);

  let response;

  try {
    if (method === 'GET') {
      response = await axios.get(url, { headers });
    } else {
      log.info('Request body:', body);

      response = await axios.request({
        method,
        url,
        data: body,
        headers
      });
    }

    log.info('✅ Success:', response.data);

    return {
      status: response.status,
      body: response.data
    };

  } catch (error) {
    console.error('❌ ERROR STATUS:', error.response?.status);
    console.error('❌ HMRC ERROR BODY:', JSON.stringify(error.response?.data, null, 2));

    return {
      status: error.response?.status || 500,
      body: error.response?.data || { error: 'Unexpected error' }
    };
  }
};

function getFraudPreventionHeaders(req) {
  const encode = encodeURIComponent;
  const s = req.session.screenInfo || {};

  const headers = {
    'Gov-Client-Connection-Method': GOV_CLIENT_CONNECTION_METHOD,
    'Gov-Client-Browser-JS-User-Agent': req.session.jsUserAgent || 'Unknown',
    'Gov-Client-Device-ID': req.session.deviceId || 'Unknown',
    ...(req.session.clientIp ? { 'Gov-Client-Public-IP': req.session.clientIp } : {}),
    ...(req.session.clientIpTimestamp ? { 'Gov-Client-Public-IP-Timestamp': req.session.clientIpTimestamp } : {}),
    ...(req.session.clientPort ? { 'Gov-Client-Public-Port': req.session.clientPort.toString() } : {}),
    'Gov-Client-Timezone': req.session.timezone || 'UTC',
    ...(s.width && s.height && s.scalingFactor && s.colourDepth
      ? {
          'Gov-Client-Screens': `width=${s.width}&
                                height=${s.height}&
                                scaling-factor=${s.scalingFactor}&
                                colour-depth=${s.colourDepth}`
        }
      : {}),
    ...(req.session.windowSize ? { 'Gov-Client-Window-Size': req.session.windowSize } : {}),
    ...(req ? { 'Gov-Vendor-Forwarded': getVendorForwardedHeader(req) } : {}),
    ...(getVendorForwardedHeader(req) ? { 'Gov-Vendor-Forwarded': getVendorForwardedHeader(req) } : {}),
    ...(GOV_VENDOR_PUBLIC_IP ? { 'Gov-Vendor-Public-IP': GOV_VENDOR_PUBLIC_IP } : {}),
    'Gov-Vendor-Version': `${encode(GOV_VENDOR_PRODUCT_NAME)}=${encode(GOV_VENDOR_VERSION)}`
  };

  return headers;
}

function getVendorForwardedHeader(req) {
  const encode = encodeURIComponent;

  const clientIp = req.session.clientIp;
  const serverIp = GOV_VENDOR_PUBLIC_IP;

  if (!clientIp || !serverIp) return undefined;

  return `by=${encode(serverIp)}&for=${encode(clientIp)}`;
}

module.exports = { 
  log,
  callApi,
  getApplicationRestrictedToken,
  getUserRestrictedToken,
  getFraudPreventionHeaders
};