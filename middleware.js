const { log } = require('./utils/utils');
const { AuthorizationCode } = require('simple-oauth2');

const { 
  OAUTH_SCOPE, 
  REDIRECT_URI, 
  oauthConfig, 
  DEV_CLIENT_PUBLIC_IP 
} = require('./config/config.js');

const client = new AuthorizationCode(oauthConfig);
const authorizationUri = client.authorizeURL({
  redirect_uri: REDIRECT_URI,
  scope: OAUTH_SCOPE,
});

function initSessionUser(req, res, next) {
  // Initialize session user object if it doesn't exist
  if (!req.session.user) {
    req.session.user = {};
    req.session.user.summary = {};
    req.session.user.summary.ukProperty = {};
    req.session.user.summary.ukProperty.income = {};
    req.session.user.summary.ukProperty.expenses = {};
    req.session.user.annual.ukProperty = {};
  }
  
  next();
}

// middleware/context.js
function attachContext(req, res, next) {
  req.context = {
    screenInfo: req.session.screenInfo,
    windowSize: req.session.windowSize,
    jsUserAgent: req.session.jsUserAgent,
    deviceId: req.session.deviceId,
    clientIp: req.session.clientIp,
    clientIpTimestamp: req.session.clientIpTimestamp,
    clientPort: req.session.clientPort,
    timezone: req.session.timezone,
    user: {
      nino: req.session.user?.nino
    },
    oauth2Token: req.session.oauth2Token,
    accessToken: req.accessToken
  };
  next();
}

function captureClientIp (req, res, next) {
  const ip = req.ip;

  // Filter out local and private IPs
  const isLoopback = ip === '::1' || ip.startsWith('::ffff:127.') || ip.startsWith('127.');
  
  if (!req.session.clientIp && ip && !isLoopback) {
    req.session.clientIp = ip;
  } else {
    req.session.clientIp = DEV_CLIENT_PUBLIC_IP;
  }

  // Set timestamp
  req.session.clientIpTimestamp = new Date().toISOString();

  next();
}

function captureClientPort(req, res, next) {
  const port = req.socket?.remotePort;

  // Check it's a valid, non-standard port (not 80 or 443)
  if (
    port &&
    typeof port === 'number' &&
    port >= 1 &&
    port <= 65535 &&
    port !== 80 &&
    port !== 443
  ) {
    req.session.clientPort = port;
  }

  next();
}

function requireUser(req, res, next) {

  // Check for OAuth token
  const tokenData = req.session.oauth2Token;
  if (!tokenData) {
    req.session.caller = req.originalUrl;
    return res.redirect(authorizationUri);  // Redirect to HMRC login
  }

  // Create access token
  const accessToken = client.createToken(tokenData);

  // Check for expired token
  if (accessToken.expired()) {
    req.session.oauth2Token = null;
    return res.redirect(authorizationUri);  // Redirect to HMRC login
  }

  // Set access token
  req.accessToken = accessToken.token.access_token; // Attach it to req for later use
  next();
}

function errorHandler(err, req, res, next) {
  if (!err.stack) {
    log.error(`Error: ${err.message || 'Unknown error'}`);
  } else {
    const stackLines = err.stack.split('\n');
    const messageLine = stackLines[0];
    const locationLines = stackLines.slice(1, 3).map(line => line.trim()).join(' | ');
    log.error(`${messageLine} — ${locationLines}`);
  }

  const status = err.status || err.response?.status || 500;

  // Render a user-friendly error page
  if (status === 404) {
    return res.status(404).render('404'); // or res.sendFile('/path/to/404.html')
  }

  if (status === 403) {
    return res.status(403).render('permission-required');
  }

  return res.status(status).render('error', { code: status });
}

module.exports = {
  initSessionUser,
  attachContext,
  captureClientIp,
  captureClientPort,
  requireUser,
  errorHandler
};