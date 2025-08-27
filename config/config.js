// Load environment variables
require('dotenv').config();

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OAUTH_SCOPE = process.env.SCOPE;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REDIS_URL = process.env.REDIS_URL;
const API_BASE_URL_SANDBOX = process.env.API_BASE_URL_SANDBOX;
const API_BASE_URL_PRODUCTION = process.env.API_BASE_URL_PRODUCTION;
const useSandbox = process.env.USE_SANDBOX;
const apiBaseUrl = useSandbox ? API_BASE_URL_SANDBOX : API_BASE_URL_PRODUCTION;
const ACCEPT_HEADER_PREFIX = process.env.ACCEPT_HEADER_PREFIX;
const ACCEPT_HEADER_SUFFIX = process.env.ACCEPT_HEADER_SUFFIX;

// Fraud prevention headers info
const GOV_CLIENT_CONNECTION_METHOD=process.env.GOV_CLIENT_CONNECTION_METHOD;
const GOV_VENDOR_PRODUCT_NAME=process.env.GOV_VENDOR_PRODUCT_NAME;
const GOV_VENDOR_PRODUCT_VERSION=process.env.GOV_VENDOR_PRODUCT_VERSION;
const DEV_CLIENT_PUBLIC_IP=process.env.DEV_CLIENT_PUBLIC_IP || null; // Using test IP for development
const DEV_VENDOR_PUBLIC_IP=process.env.DEV_VENDOR_PUBLIC_IP || null; // Using test IP for development


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

const getAcceptHeader = (serviceVersion) =>
  `${ACCEPT_HEADER_PREFIX}${serviceVersion}${ACCEPT_HEADER_SUFFIX}`;

module.exports = {
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_SCOPE,
  REDIRECT_URI,
  REDIS_URL,
  apiBaseUrl,
  oauthConfig,
  getAcceptHeader,
  GOV_CLIENT_CONNECTION_METHOD,
  GOV_VENDOR_PRODUCT_NAME,
  GOV_VENDOR_PRODUCT_VERSION,
  DEV_CLIENT_PUBLIC_IP,
  DEV_VENDOR_PUBLIC_IP
};
