const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { getApplicationRestrictedToken, getUserRestrictedToken } = require('./auth'); 
const { log } = require('./utils');
const { apiBaseUrl } = require('./config'); 

const fetchServices = asyncHandler(async (_req, res) => {
  const accessToken = await getApplicationRestrictedToken();

  const response = await axios.get(
    `${apiBaseUrl}create-test-user/services`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.hmrc.1.0+json'
      }
    }
  );

  log.info('Available services:', response.data);
  res.json(response.data);
});

const createTestUser = asyncHandler(async (req, res) => {

  const accessToken = await getApplicationRestrictedToken();

  const response = await axios.post(
    apiBaseUrl + 'create-test-user/individuals',
    { 
      services: 'self-assessment'
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.hmrc.1.0+json'
      }
    }
  );

  log.info('✅ Test user returned');
  res.json(response.data);
});

const fetchBusinessList = asyncHandler(async (req, res) => {

  const accessToken = await getUserRestrictedToken(req);

  const nino = req.query.nino;

  if (!nino) {
    return res.status(400).send("Missing NINO in query string");
  }
  
  const url = `https://test-api.service.hmrc.gov.uk/individuals/business/details/${nino}/list`;

    const response = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.hmrc.2.0+json',
        Authorization: `Bearer ${accessToken}`
      }
    });

  log.info('✅ Business list returned');
  res.json(response.data);
});

module.exports = { fetchServices, createTestUser, fetchBusinessList };
