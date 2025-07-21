// Load environment variables
require('dotenv').config();

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OAUTH_SCOPE = process.env.SCOPE;
const REDIRECT_URI = process.env.REDIRECT_URI
const API_BASE_URL_SANDBOX = process.env.API_BASE_URL_SANDBOX;
const API_BASE_URL_PRODUCTION = process.env.API_BASE_URL_PRODUCTION;
const useSandbox = process.env.USE_SANDBOX;
const apiBaseUrl = useSandbox ? API_BASE_URL_SANDBOX : API_BASE_URL_PRODUCTION;

const oauthConfig = {
  client: {
    id: CLIENT_ID,
    secret: CLIENT_SECRET,
  },
  auth: {
    tokenHost: apiBaseUrl,
    tokenPath: '/oauth/token',
    authorizePath: '/oauth/authorize',
  },
};

module.exports = {
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_SCOPE,
  REDIRECT_URI,
  apiBaseUrl,
  oauthConfig,
};
