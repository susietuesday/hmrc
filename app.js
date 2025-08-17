// Core and third-party imports
const express = require('express');
const session = require('express-session');
const Redis = require('ioredis');
const connectRedis = require('connect-redis');
const { AuthorizationCode } = require('simple-oauth2');

const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// Middleware and utility functions
const { 
  initSessionUser, 
  captureClientIp, 
  captureClientPort, 
  errorHandler 
} = require('./middleware.js');
const { log } = require('./utils');

const { testServices } = require('./services/testSupportService.js');

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

// Set up layout
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // default layout file name without .ejs

app.use(express.static(path.join(__dirname, 'public'))); // for css/js/img

// Session middleware (must come before any req.session usage)
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // set to true if using HTTPS
}));

// Set up route handling
const routes = require('./routes.js');
app.use('/', routes);

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

  res.render('index');
});

// Dev tools route
app.get('/dev-tools', (req, res) => {
  res.render('dev-tools', {
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

// OAuth callback
app.get('/oauth20/callback', async (req, res) => {
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
  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    // Clear the cookie (default name is 'connect.sid')
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(8080, () => {
  log.info('🚀 Server started at http://localhost:8080');
});