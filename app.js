// Core and third-party imports
const express = require('express');
const { AuthorizationCode } = require('simple-oauth2');

// Utility and business logic functions
const { log, requireUser } = require('./utils'); // Utilities

// Test APIs
const { 
  testServices,
  fetchHello,
  createTestUser,
  createTestItsaStatus,
  fetchServices, 
  createTestUkPropertyBusiness
} = require('./routes/test');

const {
  fetchItsaStatus
} = require('./routes/selfAssessmentIndividualDetails');

const {
  fetchIncomeAndExpenditureObligations
} = require('./routes/Obligations')

const {
  fetchBusinessList  
} = require('./routes/businessDetails');

const {  
  createUkPropertyPeriodSummary 
} = require('./routes/propertyBusiness');

// Initialise express app
const app = express();
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));  // Parse form data

// Environment variables
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  oauthConfig
} = require('./config');

// Set up session management
const session = require('express-session');
app.use(session({
  name: 'session-id',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 60 * 60 * 1000, // 10 hours
    secure: false,               // true if using HTTPS in prod
    httpOnly: true              // protect against client JS access
  }
}));

// Middleware to ensure req.session.user exists
app.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = {};
  }
  next();
});

// Set up user-authenticated access flow
const client = new AuthorizationCode(oauthConfig);

// home-page route
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

  res.render('index', {
    service: `${testServices.hello.name} (v${testServices.hello.version})`,
    unRestrictedEndpoint: testServices.hello.routes.world,
    appRestrictedEndpoint: testServices.hello.routes.application,
    userRestrictedEndpoint: testServices.hello.routes.user
  });
});

// Call hello endpoints
app.get("/unrestrictedCall", fetchHello(testServices.hello.routes.world));
app.get("/applicationCall", fetchHello(testServices.hello.routes.application));
app.get("/userCall", requireUser, fetchHello(testServices.hello.routes.user));

// Callback service parsing the authorization token and asking for the access token
app.get('/oauth20/callback', async (req, res) => {
  console.log('OAuth callback hit:', req.originalUrl, req.query);
  const { code } = req.query;
  const options = {
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  try {
    const accessToken = await client.getToken(options);
    req.session.oauth2Token = accessToken;

    return res.redirect(req.session.caller);

  } catch(error) {
    return res.status(500).json('Authentication failed');
  }
});

app.listen(8080, () => {
  log.info('Started at http://localhost:8080');
});

// Log out
app.post('/logout', (req, res) => {
  // Clear all session data by setting the session object to null or empty
  req.session = null;

  // Redirect to login or homepage
  res.redirect('/');
});

app.get('/services', fetchServices);
app.post('/test-users', createTestUser);
app.post('/itsa-status', requireUser, createTestItsaStatus);
app.get('/itsa-status', requireUser, fetchItsaStatus);
app.get('/obligations', requireUser, fetchIncomeAndExpenditureObligations);
app.get("/business-sources", requireUser, fetchBusinessList);
app.post("/test/uk-property-business", requireUser, createTestUkPropertyBusiness);
app.post("/periodic-summary", requireUser, createUkPropertyPeriodSummary);

app.use((err, req, res, next) => {
  if (!err.stack) {
    log.error(`Error: ${err.message || 'Unknown error'}`);
  } else {
    const stackLines = err.stack.split('\n');
    const messageLine = stackLines[0];        // error message line
    const locationLines = stackLines.slice(1, 3).map(line => line.trim()).join(' | ');
    log.error(`${messageLine} — ${locationLines}`);
  }

  const status = err.status || err.response?.status || 500;
  res.status(status).json({ error: 'Internal Server Error' });
});