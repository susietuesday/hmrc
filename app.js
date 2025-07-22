/*
 * Copyright 2017 HM Revenue & Customs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Core and third-party imports
const express = require('express');
//const request = require('superagent');
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { AuthorizationCode, ClientCredentials } = require('simple-oauth2');

// App-specific functions
const { log } = require('./utils'); // Utilities
const { getApplicationRestrictedToken, createApiRoute, callApi } = require('./auth')

// Initialise express app
const app = express();
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));  // Parse form data

// Environment variables
const {
  CLIENT_ID,
  CLIENT_SECRET,
  OAUTH_SCOPE,
  REDIRECT_URI,
  apiBaseUrl,
  oauthConfig,
} = require('./config');

// Service metadata
let serviceName = 'hello'
let serviceVersion = '1.0'

const ROUTES = {
  UNRESTRICTED: '/world',
  APP_RESTRICTED: '/application',
  USER_RESTRICTED: '/user'
};

// Set up session management
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['oauth2Token', 'caller'],
  maxAge: 10 * 60 * 60 * 1000 // 10 hours
}));

// Set up user-authenticated access flow
const client = new AuthorizationCode(oauthConfig);
const authorizationUri = client.authorizeURL({
  redirect_uri: REDIRECT_URI,
  scope: OAUTH_SCOPE,
});

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
    service: `${serviceName} (v${serviceVersion})`,
    unRestrictedEndpoint: ROUTES.UNRESTRICTED,
    appRestrictedEndpoint: ROUTES.APP_RESTRICTED,
    userRestrictedEndpoint: ROUTES.USER_RESTRICTED
  });
});

app.get("/unrestrictedCall", createApiRoute(ROUTES.UNRESTRICTED));
app.get("/applicationCall", createApiRoute(ROUTES.APP_RESTRICTED));

// Call a user-restricted endpoint
app.get("/userCall", asyncHandler(async (req, res) => {
  const tokenData = req.session.oauth2Token;

  if (!tokenData) {
    req.session.caller = "/userCall";
    return res.redirect(authorizationUri);
  }

  const accessToken = client.createToken(tokenData);

  if (accessToken.expired()) {
    req.session.oauth2Token = null;
    return res.redirect(authorizationUri);
  }

  log.info(`Using token from session: ${JSON.stringify(accessToken.token)}`);

  const apiResponse = await callApi({
    res,
    bearerToken: accessToken.token.access_token,
    serviceName,
    serviceVersion,
    resource: ROUTES.USER_RESTRICTED
  });

  res.status(apiResponse.status).json(apiResponse.body);
}));

// Callback service parsing the authorization token and asking for the access token
app.get('/oauth20/callback', async (req, res) => {
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

// Provides a list of all the available services together with which test user types can enrol to each
app.post('/services', async (req, res) => {

  try {
    // Get application access token
    const accessToken = await getApplicationRestrictedToken();

    const response = await axios.get(
      apiBaseUrl + 'create-test-user/services',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.hmrc.1.0+json'
        }
      }
    );

    log.info('Available services:', response.data);
    res.json(response.data);

  } catch (error) {
    log.error('Error fetching test user services:', error.response?.data || error.message);
    throw error;
  }

});

//Get test user
async function createTestUser() {

  try {
    const accessToken = await getApplicationRestrictedToken();

    const response = await axios.post(
      apiBaseUrl + 'create-test-user/individuals',
      { 
        services: 'mtd-income-tax'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.hmrc.1.0+json'
        }
      }
    );

    log.info('✅ Test user returned with NINO: ');
    return response.data;

    } catch (error) {
      if (error.response && error.response.data) {
        log.error('❌ HMRC Response Error Body:', JSON.stringify(error.response.data, null, 2));
      } else if (error.data && error.data.payload) {
        log.error('❌ HMRC Payload:', JSON.stringify(error.data.payload, null, 2));
      } else {
        log.error('❌ Unexpected Error:', error.message || error);
      }
      throw error;
    }
}

app.post('/test-user', async (req, res) => {

  let foundUser = null;

  const user = await createTestUser();

  // Log user object
  log.info('ℹ️ Full user object:', JSON.stringify(user, null, 2));

    /*
    // Get business list
    const businesses = await getBusinessList(req, res, nino);
    const propertyBusiness = businesses.find(b => b.typeOfBusiness === 'uk-property');

    if (propertyBusiness) {
      foundUser = {
        nino: nino,
        businessId: propertyBusiness.businessId,
        accessToken: user.accessToken // optional
      };
      */
      //break;
  //}

  res.json({ success: true, data: foundUser });
});

async function getBusinessList(req, res, nino) {
  const url = `https://test-api.service.hmrc.gov.uk/individuals/business/details/${nino}/list`;
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.hmrc.2.0+json',
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data.listOfBusinesses || [];

  } catch (error) {
    log.error('Error fetching business list:', error.response?.data || error.message);
    return [];
  }
}

//Get businesses
app.post("/business-sources", (req, res) => {
  if (req.session.oauth2Token) {
 
    const accessToken = client.createToken(req.session.oauth2Token);
    const nino = req.body.nino;

    if (!nino) {
      return res.status(400).send('NINO is required');
    }

    serviceName = 'individuals'
    serviceVersion = '2.0'
    const resource = `/business/details/${encodeURIComponent(nino)}/list`;

    //Log scope
    log.info(`SCOPE: ${accessToken.token.scope}`);
    
    callApi({
      res,
      bearerToken: accessToken,
      serviceName,
      serviceVersion,
      resource: ROUTES.UNRESTRICTED
    });

  } else {
    req.session.caller = '/business-sources';
    res.redirect(authorizationUri);
  }
});

app.post("/test/uk-property-business", (req, res) => {
    if (req.session.oauth2Token) {

      const nino = req.body.nino;

      if (!nino) {
        return res.status(400).send('NINO is required');
      }

      createTestUkPropertyBusiness(nino)

      //https://test-api.service.hmrc.gov.uk/individuals/self-assessment-test-support/business/{nino}

    } else {
      req.session.caller = '/test/uk-property-business';
      res.redirect(authorizationUri);
    }
})

async function createTestUkPropertyBusiness(nino){
  const url = apiBaseUrl + `individuals/self-assessment-test-support/business/${nino}`;
  const accessToken = await getApplicationRestrictedToken();
      
  const data = {
    typeOfBusiness: "uk-property",
    firstAccountingPeriodStartDate: "2021-04-06",
    firstAccountingPeriodEndDate: "2022-04-05",
    latencyDetails: {
      latencyEndDate: "2023-04-06",
      taxYear1: "2021-22",
      latencyIndicator1: "A",
      taxYear2: "2022-23",
      latencyIndicator2: "Q"
    },
    quarterlyTypeChoice: {
      quarterlyPeriodType: "standard",
      taxYearOfChoice: "2022-23"
    },
    accountingType: "CASH",
    commencementDate: "2020-04-06"
    //cessationDate: "2025-04-06"
  };

  try {

    log.info('ℹ️ Url:' + url)
    log.info('ℹ️ Data:' + JSON.stringify(data, null, 2))
    log.info('ℹ️ Access Token:' + accessToken)

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.hmrc.1.0+json',
        'Content-Type': 'application/json'
      }
    });
    console.log('Business created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating test business:', error.response?.data || error.message);
    throw error;
  }
}

app.post("/periodic-summary", (req, res) => {
  if (req.session.oauth2Token) {
 
    const accessToken = client.createToken(req.session.oauth2Token);
    const nino = req.body.nino;
    const businessId = 'XBIS12345678901'
    const taxYear = '2024-25'

    if (!nino) {
      return res.status(400).send('NINO is required');
    }

    serviceName = 'individuals'
    serviceVersion = '6.0'
    const resource = `/business/property/uk/${encodeURIComponent(nino)}/${encodeURIComponent(businessId)}/period/${encodeURIComponent(taxYear)}`;
    
    //Log scope
    log.info(`ℹ️ Scope: ${accessToken.token.scope}`);
    log.info('ℹ️ Url: ', resource);
    
    callApi({
      res,
      bearerToken: accessToken,
      serviceName,
      serviceVersion,
      resource
    });

  } else {
    req.session.caller = '/periodic-summary';
    res.redirect(authorizationUri);
  }
});

app.use((err, req, res, next) => {
  if (!err.stack) {
    log.error(`Error: ${err.message || 'Unknown error'}`);
  } else {
    const stackLines = err.stack.split('\n');
    const messageLine = stackLines[0];        // error message line
    const locationLines = stackLines.slice(1, 3).map(line => line.trim()).join(' | ');
    log.error(`${messageLine} — ${locationLines}`);
  }

  res.status(500).json({ error: 'Internal Server Error' });
});