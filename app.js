// Core and third-party imports
const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const connectRedis = require('connect-redis');
const { AuthorizationCode } = require('simple-oauth2');

// Middleware and utility functions
const { 
  initSessionUser, 
  captureClientIp, 
  captureClientPort, 
  requireUser, 
  errorHandler 
} = require('./middleware.js');
const { log } = require('./utils');

// Route handlers
const {
  testServices,
  fetchHello,
  validateFraudPreventionHeaders,
  createTestUser,
  createTestItsaStatus,
  fetchServices,
  createTestUkPropertyBusiness
} = require('./routes/test');

const { fetchItsaStatus } = require('./routes/selfAssessmentIndividualDetails');
const { fetchIncomeAndExpenditureObligations } = require('./routes/Obligations');
const { fetchBusinessList } = require('./routes/businessDetails');
const { createUkPropertyPeriodSummary } = require('./routes/propertyBusiness');

// Environment variables
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  oauthConfig
} = require('./config');

// Create Redis client and session store
const RedisStore = connectRedis(session);
const redisClient = new Redis();  // auto-connect

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Initialize Express app
const app = express();
app.set('view engine', 'ejs');
app.set('trust proxy', true); // Enabled to get Client IP for fraud prevention headers
app.use(express.urlencoded({ extended: true }));

// Session middleware (must come before any req.session usage)
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // set to true if using HTTPS
}));

// Serve static files from front end
app.use(express.static('public'));

// Serve index.ejs
app.set('view engine', 'ejs');

// Ensure req.session.user is always defined
app.use(initSessionUser);

// OAuth client
const client = new AuthorizationCode(oauthConfig);

// Home page route
app.get('/', (req, res) => {
  const userToken = req.session.oauth2Token;

  const userInfo = userToken ? {
    accessToken: userToken.access_token,
    scope: userToken.scope,
    expiresAt: userToken.expires_at
  } : null;

  if (userInfo) {
    log.info(`ℹ️ Access token: ${userInfo.accessToken}`);
    log.info(`ℹ️ Scope: ${userInfo.scope}`);
    log.info(`ℹ️ Expires at: ${userInfo.expiresAt}`);
  } else {
    log.info('ℹ️ No user is currently logged in.');
  }

  log.info('ℹ️ NINO: ' + req.session.user.nino);

  res.render('index', {
    service: `${testServices.hello.name} (v${testServices.hello.version})`,
    unRestrictedEndpoint: testServices.hello.routes.world,
    appRestrictedEndpoint: testServices.hello.routes.application,
    userRestrictedEndpoint: testServices.hello.routes.user
  });
});

// Capture fraud prevention headers info
app.use(captureClientIp);
app.use(captureClientPort);

app.post('/session-data', express.json(), (req, res) => {
  //log.info('Headers: ' + JSON.stringify(req.headers));
  //log.info('Request body:' + JSON.stringify(req.body));

  const { screenInfo, windowSize, timezone } = req.body;

  req.session.jsUserAgent = req.headers['x-user-agent'];
  req.session.deviceId = req.headers['x-device-id'];
  req.session.screenInfo = screenInfo;
  req.session.windowSize = windowSize;
  req.session.timezone = timezone;

  log.info('JS User Agent: ' + req.session.jsUserAgent);
  log.info('Device ID: ' + req.session.deviceId);
  log.info('Screen Info:' + JSON.stringify(screenInfo));
  log.info('Window Size: ' + JSON.stringify(windowSize));
  log.info('Timezone: ' + JSON.stringify(timezone));

  res.sendStatus(200);
});

// MTD sandbox routes
app.get('/unrestrictedCall', fetchHello(testServices.hello.routes.world));
app.get('/applicationCall', fetchHello(testServices.hello.routes.application));
app.get('/userCall', requireUser, fetchHello(testServices.hello.routes.user));
app.get('/fraud-headers', validateFraudPreventionHeaders);
app.post('/test-users', createTestUser);
app.post('/itsa-status', requireUser, createTestItsaStatus);
app.post('/test/uk-property-business', requireUser, createTestUkPropertyBusiness);

// MTD production routes
app.get('/services', fetchServices);
app.get('/itsa-status', requireUser, fetchItsaStatus);
app.get('/obligations', requireUser, fetchIncomeAndExpenditureObligations);
app.get('/business-sources', requireUser, fetchBusinessList);
app.post('/periodic-summary', requireUser, createUkPropertyPeriodSummary);

// OAuth callback
app.get('/oauth20/callback', async (req, res) => {
  log.info('OAuth callback hit:', req.originalUrl, req.query);
  const { code } = req.query;

  const options = {
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  try {
    const accessToken = await client.getToken(options);
    req.session.oauth2Token = accessToken;
    res.redirect(req.session.caller || '/');
  } catch (error) {
    res.status(500).json('Authentication failed');
  }
});

// Log out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(8080, () => {
  log.info('🚀 Server started at http://localhost:8080');
});