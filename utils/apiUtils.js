const axios = require('axios');
const { log } = require('./utils.js');
const { AuthorizationCode, ClientCredentials } = require('simple-oauth2');

// Environment variables
const {
  OAUTH_SCOPE,
  oauthConfig,
  apiBaseUrl,
  getAcceptHeader,
  GOV_CLIENT_CONNECTION_METHOD,
  DEV_VENDOR_PUBLIC_IP,
  GOV_VENDOR_PRODUCT_NAME,
  GOV_VENDOR_PRODUCT_VERSION
} = require('../config');

const client = new AuthorizationCode(oauthConfig);

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

async function getUserRestrictedToken(oauth2Token) {
  if (!oauth2Token) {
    throw new Error('User is not logged in');
  }

  const accessToken = client.createToken(oauth2Token);

  if (accessToken.expired()) {
    throw new Error('User access token has expired');
  }

  return accessToken.token.access_token;
}

// Call API
const callApi = async ({
  method = 'GET',
  serviceName,
  serviceVersion,
  routePath,
  bearerToken = null,
  extraHeaders = {},
  params = null,
  body = null
}) => {
  const acceptHeader = getAcceptHeader(serviceVersion);
  let url = apiBaseUrl + serviceName + routePath;

  // Append query params if provided
  if (params && typeof params === 'object') {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

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
    log.info('API response headers:', response.headers);

    return {
      status: response.status,
      headers: response.headers,
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

function getFraudPreventionHeaders(session) {
  const encode = encodeURIComponent;
  const s = session.screenInfo || {};

  const headers = {
    'Gov-Client-Connection-Method': GOV_CLIENT_CONNECTION_METHOD,
    'Gov-Client-Browser-JS-User-Agent': session.jsUserAgent || 'Unknown',
    'Gov-Client-Device-ID': session.deviceId || 'Unknown',
    ...(session.clientIp ? { 'Gov-Client-Public-IP': session.clientIp } : {}),
    ...(session.clientIpTimestamp ? { 'Gov-Client-Public-IP-Timestamp': session.clientIpTimestamp } : {}),
    ...(session.clientPort ? { 'Gov-Client-Public-Port': session.clientPort.toString() } : {}),
    'Gov-Client-Timezone': session.timezone || 'UTC',
    'Gov-Client-User-IDs': 'nino=' + session.user.nino,
    ...(s.width && s.height && s.scalingFactor && s.colourDepth
      ? {
          'Gov-Client-Screens': `width=${s.width}&height=${s.height}&scaling-factor=${s.scalingFactor}&colour-depth=${s.colourDepth}`
        } 
      : {}),
    ...(session.windowSize && session.windowSize.width && session.windowSize.height
      ? {
          'Gov-Client-Window-Size': `width=${session.windowSize.width}&height=${session.windowSize.height}`
        }
      : {}),
    ...(getVendorForwardedHeader(session.clientIp) ? { 'Gov-Vendor-Forwarded': getVendorForwardedHeader(session.clientIp) } : {}),
    ...(DEV_VENDOR_PUBLIC_IP ? { 'Gov-Vendor-Public-IP': DEV_VENDOR_PUBLIC_IP } : {}),
    'Gov-Vendor-Product-Name': `${encode(GOV_VENDOR_PRODUCT_NAME)}`,
    'Gov-Vendor-Public-IP': DEV_VENDOR_PUBLIC_IP,
    'Gov-Vendor-Version': `${encode(GOV_VENDOR_PRODUCT_NAME)}=${encode(GOV_VENDOR_PRODUCT_VERSION)}`
  };

  return headers;
}

function getVendorForwardedHeader(clientIp) {
  const encode = encodeURIComponent;

  const serverIp = DEV_VENDOR_PUBLIC_IP;

  if (!clientIp || !serverIp) return undefined;

  return `by=${encode(serverIp)}&for=${encode(clientIp)}`;
}

module.exports = { 
  callApi,
  getApplicationRestrictedToken,
  getUserRestrictedToken,
  getFraudPreventionHeaders
};