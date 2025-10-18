// Core and third-party imports
const express = require('express');
import { setupSession } from './middleware/session';

const { AuthorizationCode } = require('simple-oauth2');

const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// Middleware and utility functions
const { 
  initSessionUser, 
  captureClientIp, 
  captureClientPort, 
  errorHandler 
} = require('./middleware/middleware.js');
const { log } = require('./utils/utils.js');

// Environment variables
const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  oauthConfig
} = require('./config/config');

// Initialize Express app
const app = express();
app.set('view engine', 'ejs');
app.set('trust proxy', true); // Enabled to get Client IP for fraud prevention headers
app.use(express.urlencoded({ extended: true }));

// Set up layout
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // default layout file name without .ejs

app.use(express.static(path.join(__dirname, '../public'))); // for css/js/img

// Set up Redis-backed session
setupSession(app);

// Set up route handling
const routes = require('./routes.js');
app.use('/', routes);

// Serve static files from front end
app.use(express.static('public'));
app.use('/shared', express.static('shared')); // allow browser to import shared code

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

  const error = req.session.error;
  if (error) {
    delete req.session.error; // clear it after reading
    return res.render('index', { error });
  }

  res.render('index');
});

// Capture fraud prevention headers info
app.use(captureClientIp);
app.use(captureClientPort);

app.post('/session-data', express.json(), (req, res) => {
  const { screenInfo, windowSize, timezone } = req.body;

  req.session.jsUserAgent = req.headers['x-user-agent'];
  req.session.deviceId = req.headers['x-device-id'];
  req.session.screenInfo = screenInfo;
  req.session.windowSize = windowSize;
  req.session.timezone = timezone;

  res.sendStatus(200);
});

// OAuth callback
app.get('/oauth20/callback', async (req, res, next) => {
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
    // If the user denied permission, throw a 403
    const err = new Error('User denied HMRC permission');
    err.status = 403;
    next(err);
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

// Catch missing pages
app.use((req, res) => {
  res.status(404).render('404'); // or sendFile
});

// Global error handler
app.use(errorHandler);

module.exports = app;